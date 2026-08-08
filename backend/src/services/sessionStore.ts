import { SessionState, CandidateProfile, DialogueTurn } from '../types';
import { planCandidateInterview } from './candidatePlanner';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class SessionStore {
  
  public async getOrCreateSession(sessionId: string, candidate?: CandidateProfile): Promise<SessionState> {
    let session = await this.getSession(sessionId);

    if (!session && candidate) {
      const { targetDays } = planCandidateInterview(candidate);
      
      const newSession = await prisma.session.create({
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
        },
        include: {
          candidate: { include: { signals: true, missions: true } }
        }
      });
      session = this.mapPrismaToState(newSession, []);
    } else if (!session && !candidate) {
      throw new Error(`Session ${sessionId} not found and no candidate profile provided to initialize.`);
    }

    return session!;
  }

  public async getSession(sessionId: string): Promise<SessionState | undefined> {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        candidate: { include: { signals: true, missions: true } },
        history: { orderBy: { turnId: 'asc' } }
      }
    });

    if (!session) return undefined;
    return this.mapPrismaToState(session, session.history);
  }

  public async updateSession(session: SessionState): Promise<void> {
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

    // Save history turns
    // We only need to insert turns that don't already exist in the DB
    // The easiest way is to check the count and insert the difference, 
    // since turns are only appended.
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
  }

  public async getSessionCount(): Promise<number> {
    return prisma.session.count();
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
