export interface CandidateProfile {
  member: {
    id: string;
    name: string;
    jobRole: string;
    yearsExperience: number;
    education: string;
    status: string;
  };
  missions: Array<{
    day: number;
    title: string;
    passed?: boolean;
    attempts?: number;
    skipped?: boolean;
  }>;
  signals: {
    commitDays: number;
    missionsCompleted: number;
    missionsFirstTry: number;
  };
}

export interface InterviewFeedback {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
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
  error?: string;
}

export async function sendInterviewRequest(payload: {
  sessionId: string;
  candidate?: CandidateProfile;
  message?: string;
  provider?: string;
}): Promise<InterviewResponse> {
  const response = await fetch('/api/interview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${response.status}: Failed to execute interview API`);
  }

  return await response.json();
}

export async function checkBackendHealth(): Promise<{ status: string; availableProviders: string[] }> {
  try {
    const res = await fetch('/api/health');
    if (res.ok) return await res.json();
  } catch (err) {
    // ignore
  }
  return { status: 'offline', availableProviders: [] };
}
