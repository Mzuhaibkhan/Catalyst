export interface CandidateMember {
  id: string;
  name: string;
  jobRole: string;
  yearsExperience: number;
  education: string;
  status: string;
}

export interface CandidateMission {
  day: number;
  title: string;
  passed?: boolean;
  attempts?: number;
  skipped?: boolean;
}

export interface CandidateSignals {
  commitDays: number;
  missionsCompleted: number;
  missionsFirstTry: number;
}

export interface CandidateProfile {
  member: CandidateMember;
  missions: CandidateMission[];
  signals: CandidateSignals;
}

export interface CurriculumDay {
  day: number;
  title: string;
  type: string;
  tools: string[];
  objectives: string[];
}

export interface CurriculumModule {
  n: number;
  title: string;
  days: [number, number];
}

export interface CurriculumData {
  cohort: string;
  modules: CurriculumModule[];
  days: CurriculumDay[];
}

export interface DialogueTurn {
  turnId: number;
  speaker: 'interviewer' | 'candidate';
  text: string;
  timestamp: string;
  targetDay?: number;
  evaluation?: {
    score: number;
    notes: string;
  };
}

export interface InterviewFeedback {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
}

export interface SessionState {
  sessionId: string;
  candidate: CandidateProfile;
  history: DialogueTurn[];
  askedQuestions: string[];
  coveredDays: Set<number>;
  targetDays: number[];
  currentDayIndex: number;
  questionCount: number;
  isComplete: boolean;
  feedback?: InterviewFeedback;
  createdAt: number;
  lastUpdatedAt: number;
}

export interface InterviewStartRequest {
  sessionId: string;
  candidate: CandidateProfile;
}

export interface InterviewTurnRequest {
  sessionId: string;
  message?: string;
}

export interface InterviewResponse {
  reply: string;
  done: boolean;
  feedback?: InterviewFeedback;
  metrics?: {
    latencyMs: number;
    provider: string;
    coveredDaysCount: number;
    questionCount: number;
  };
}

export interface ILLMProvider {
  name: string;
  isAvailable(): boolean;
  generateTurnResponse(
    context: {
      candidate: CandidateProfile;
      history: DialogueTurn[];
      currentDay: CurriculumDay;
      questionCount: number;
      isFollowUp: boolean;
    }
  ): Promise<{ reply: string; score: number; notes: string }>;
  
  generateFeedback(
    context: {
      candidate: CandidateProfile;
      history: DialogueTurn[];
      coveredDays: CurriculumDay[];
    }
  ): Promise<InterviewFeedback>;
}
