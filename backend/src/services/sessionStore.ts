import { SessionState, CandidateProfile } from '../types';
import { planCandidateInterview } from './candidatePlanner';

class SessionStore {
  private sessions = new Map<string, SessionState>();

  public getOrCreateSession(sessionId: string, candidate?: CandidateProfile): SessionState {
    let session = this.sessions.get(sessionId);

    if (!session && candidate) {
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
}

export const sessionStore = new SessionStore();
