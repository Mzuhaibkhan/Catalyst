import { SessionState, CandidateProfile } from '../types';
import { planCandidateInterview } from './candidatePlanner';
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;
try {
  prisma = new PrismaClient();
} catch (e) {
  console.warn('⚠️ PrismaClient initialization failed, running with fast in-memory store.');
}

class SessionStore {
  private inMemorySessions = new Map<string, SessionState>();
  private cleanupTimer: NodeJS.Timeout | null = null;
  private MAX_SESSIONS = Number(process.env.MAX_SESSIONS) || 100;
  private SESSION_TTL_MS = (Number(process.env.SESSION_TTL_HOURS) || 2) * 60 * 60 * 1000;

  constructor() {
    this.startCleanupTimer();
  }

  public async getOrCreateSession(sessionId: string, candidate?: CandidateProfile): Promise<SessionState> {
    let session = await this.getSession(sessionId);

    if (!session && candidate) {
      const { targetDays } = planCandidateInterview(candidate);
      
      const newMemorySession: SessionState = {
        sessionId,
        candidate,
        history: [],
        askedQuestions: [],
        coveredDays: new Set<number>(),
        targetDays,
        currentDayIndex: 0,
        questionCount: 0,
        isComplete: false,
        isWindingDown: false,
        createdAt: Date.now(),
        lastUpdatedAt: Date.now()
      };

      if (prisma) {
        try {
          // Ensure candidate exists in DB
          await prisma.candidate.upsert({
            where: { id: candidate.member.id },
            update: {},
            create: {
              id: candidate.member.id,
              name: candidate.member.name,
              jobRole: candidate.member.jobRole,
              yearsExperience: candidate.member.yearsExperience,
              education: candidate.member.education,
              status: candidate.member.status,
              signals: {
                create: {
                  commitDays: candidate.signals.commitDays,
                  missionsCompleted: candidate.signals.missionsCompleted,
                  missionsFirstTry: candidate.signals.missionsFirstTry,
                }
              },
              missions: {
                create: candidate.missions.map((m: any) => ({
                  day: m.day,
                  title: m.title,
                  passed: m.passed,
                  attempts: m.attempts,
                  skipped: m.skipped,
                }))
              }
            }
          });

          await prisma.session.create({
            data: {
              id: sessionId,
              candidateId: candidate.member.id,
              askedQuestions: '[]',
              coveredDays: '[]',
              targetDays: JSON.stringify(targetDays),
              currentDayIndex: 0,
              questionCount: 0,
              isComplete: false,
              isWindingDown: false,
            }
          });
        } catch (err: any) {
          console.warn(`[SessionStore] Prisma session creation skipped (${err.message}). Using in-memory fallback.`);
        }
      }

      this.inMemorySessions.set(sessionId, newMemorySession);
      session = newMemorySession;
    } else if (!session && !candidate) {
      throw new Error(`Session ${sessionId} not found and no candidate profile provided to initialize.`);
    }

    return session!;
  }

  public async getSession(sessionId: string): Promise<SessionState | undefined> {
    // 1. Try memory map first (fastest)
    if (this.inMemorySessions.has(sessionId)) {
      return this.inMemorySessions.get(sessionId);
    }

    // 2. Try Prisma fallback
    if (prisma) {
      try {
        const dbSession = await prisma.session.findUnique({
          where: { id: sessionId },
          include: {
            candidate: { include: { signals: true, missions: true } },
            history: { orderBy: { turnId: 'asc' } }
          }
        });

        if (dbSession) {
          const state = this.mapPrismaToState(dbSession, dbSession.history);
          this.inMemorySessions.set(sessionId, state);
          return state;
        }
      } catch (err: any) {
        // Suppress DB error and return undefined
      }
    }

    return undefined;
  }

  public async updateSession(session: SessionState): Promise<void> {
    session.lastUpdatedAt = Date.now();
    this.inMemorySessions.set(session.sessionId, session);

    if (prisma) {
      try {
        await prisma.session.update({
          where: { id: session.sessionId },
          data: {
            askedQuestions: JSON.stringify(session.askedQuestions),
            coveredDays: JSON.stringify(Array.from(session.coveredDays)),
            currentDayIndex: session.currentDayIndex,
            questionCount: session.questionCount,
            isComplete: session.isComplete,
            isWindingDown: session.isWindingDown,
            feedback: session.feedback ? JSON.stringify(session.feedback) : null,
          }
        });

        const dbTurnsCount = await prisma.dialogueTurn.count({
          where: { sessionId: session.sessionId }
        });

        if (session.history.length > dbTurnsCount) {
          const newTurns = session.history.slice(dbTurnsCount);
          await prisma.dialogueTurn.createMany({
            data: newTurns.map(t => ({
              sessionId: session.sessionId,
              turnId: t.turnId,
              speaker: t.speaker,
              text: t.text,
              timestamp: new Date(t.timestamp),
              targetDay: t.targetDay,
              score: t.evaluation?.score,
              notes: t.evaluation?.notes
            }))
          });
        }
      } catch (err: any) {
        // Suppress DB update error, in-memory state is up to date
      }
    }
  }

  public async getSessionCount(): Promise<number> {
    return this.inMemorySessions.size;
  }

  public startCleanupTimer(): void {
    if (this.cleanupTimer) return;
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      let evictedCount = 0;
      for (const [id, session] of this.inMemorySessions.entries()) {
        if (now - session.lastUpdatedAt > this.SESSION_TTL_MS) {
          this.inMemorySessions.delete(id);
          evictedCount++;
        }
      }
      if (evictedCount > 0) {
        console.info(`[SessionStore] Evicted ${evictedCount} stale session(s).`);
      }
    }, 30 * 60 * 1000);
  }

  public stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  private mapPrismaToState(prismaSession: any, history: any[]): SessionState {
    return {
      sessionId: prismaSession.id,
      candidate: {
        member: {
          id: prismaSession.candidate.id,
          name: prismaSession.candidate.name,
          jobRole: prismaSession.candidate.jobRole,
          yearsExperience: prismaSession.candidate.yearsExperience,
          education: prismaSession.candidate.education,
          status: prismaSession.candidate.status,
        },
        missions: prismaSession.candidate.missions,
        signals: prismaSession.candidate.signals,
      },
      history: history.map(t => ({
        turnId: t.turnId,
        speaker: t.speaker as 'interviewer' | 'candidate',
        text: t.text,
        timestamp: t.timestamp.toISOString(),
        targetDay: t.targetDay || undefined,
        evaluation: t.score ? { score: t.score, notes: t.notes || '' } : undefined,
      })),
      askedQuestions: JSON.parse(prismaSession.askedQuestions || '[]'),
      coveredDays: new Set(JSON.parse(prismaSession.coveredDays || '[]')),
      targetDays: JSON.parse(prismaSession.targetDays || '[]'),
      currentDayIndex: prismaSession.currentDayIndex,
      questionCount: prismaSession.questionCount,
      isComplete: prismaSession.isComplete,
      isWindingDown: prismaSession.isWindingDown,
      feedback: prismaSession.feedback ? JSON.parse(prismaSession.feedback) : undefined,
      createdAt: prismaSession.createdAt.getTime(),
      lastUpdatedAt: prismaSession.lastUpdatedAt.getTime()
    };
  }
}

export const sessionStore = new SessionStore();
