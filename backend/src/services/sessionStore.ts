import { SessionState, CandidateProfile } from '../types';
import { planCandidateInterview } from './candidatePlanner';

class SessionStore {
  private sessions = new Map<string, SessionState>();
  private cleanupTimer: NodeJS.Timeout | null = null;
  private MAX_SESSIONS = Number(process.env.MAX_SESSIONS) || 100;
  private SESSION_TTL_MS = (Number(process.env.SESSION_TTL_HOURS) || 2) * 60 * 60 * 1000;

  public getOrCreateSession(sessionId: string, candidate?: CandidateProfile): SessionState {
    let session = this.sessions.get(sessionId);

    if (!session && candidate) {
      if (this.sessions.size >= this.MAX_SESSIONS) {
        throw new Error(`Maximum concurrent sessions (${this.MAX_SESSIONS}) reached.`);
      }
      const { targetDays } = planCandidateInterview(candidate);
      session = {
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
      this.sessions.set(sessionId, session);
    } else if (!session && !candidate) {
      throw new Error(`Session ${sessionId} not found and no candidate profile provided to initialize.`);
    }

    return session!;
  }

  public getSession(sessionId: string): SessionState | undefined {
    return this.sessions.get(sessionId);
  }

  public updateSession(session: SessionState): void {
    session.lastUpdatedAt = Date.now();
    this.sessions.set(session.sessionId, session);
  }

  public clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  public getSessionCount(): number {
    return this.sessions.size;
  }

  public startCleanupTimer(): void {
    if (this.cleanupTimer) return;
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      let evictedCount = 0;
      for (const [id, session] of this.sessions.entries()) {
        if (now - session.lastUpdatedAt > this.SESSION_TTL_MS) {
          this.sessions.delete(id);
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
}

export const sessionStore = new SessionStore();
sessionStore.startCleanupTimer();
