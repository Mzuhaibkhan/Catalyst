import { CandidateProfile, DialogueTurn, CurriculumDay } from '../types';

/**
 * Centralized prompt templates for all LLM providers.
 * Ensures consistent, high-quality prompts across Groq, Gemini, OpenAI, Grok, and NVIDIA.
 */

// ─── System Prompts ─────────────────────────────────────────────────────────

export const TURN_SYSTEM_PROMPT = `You are a senior technical interviewer conducting a personalized AI engineering interview. You must:
1. Ask focused, probing technical questions that test understanding, not memorization.
2. Reference the candidate's actual work and curriculum topics naturally.
3. Keep responses concise (2-4 sentences). Ask exactly ONE question per turn.
4. Be conversational and professional — this should feel like a real interview, not a quiz.
5. ALWAYS output valid JSON matching the specified format.`;

export const FEEDBACK_SYSTEM_PROMPT = `You are a senior technical evaluator synthesizing interview feedback. Analyze the full conversation transcript carefully.
Provide honest, specific, actionable feedback. Reference concrete examples from the conversation.
ALWAYS output valid JSON matching the specified format.`;

// ─── Candidate Signal Analysis ──────────────────────────────────────────────

function buildCandidateContext(candidate: CandidateProfile): string {
  const passedMissions = candidate.missions.filter(m => m.passed);
  const skippedMissions = candidate.missions.filter(m => m.skipped);
  const hardMissions = candidate.missions.filter(m => m.passed && m.attempts && m.attempts >= 3);
  const easyMissions = candidate.missions.filter(m => m.passed && m.attempts === 1);

  let context = `Candidate: ${candidate.member.name}
Role: ${candidate.member.jobRole} (${candidate.member.yearsExperience} years experience)
Education: ${candidate.member.education}
Status: ${candidate.member.status}

Learning Signals:
- Committed ${candidate.signals.commitDays} out of 31 days
- Completed ${candidate.signals.missionsCompleted} missions, ${candidate.signals.missionsFirstTry} on first try
- First-try pass rate: ${Math.round((candidate.signals.missionsFirstTry / Math.max(candidate.signals.missionsCompleted, 1)) * 100)}%`;

  if (hardMissions.length > 0) {
    context += `\n\nTopics that required multiple attempts (probe deeper here):
${hardMissions.map(m => `  - Day ${m.day}: ${m.title} (${m.attempts} attempts)`).join('\n')}`;
  }

  if (skippedMissions.length > 0) {
    context += `\n\nSkipped topics (potential knowledge gaps):
${skippedMissions.map(m => `  - Day ${m.day}: ${m.title}`).join('\n')}`;
  }

  if (easyMissions.length > 0) {
    context += `\n\nStrength areas (first-try passes):
${easyMissions.map(m => `  - Day ${m.day}: ${m.title}`).join('\n')}`;
  }

  return context;
}

// ─── Turn Prompt Builder ────────────────────────────────────────────────────

export function buildTurnPrompt(context: {
  candidate: CandidateProfile;
  history: DialogueTurn[];
  currentDay: CurriculumDay;
  questionCount: number;
  isFollowUp: boolean;
}): string {
  const { candidate, history, currentDay, questionCount, isFollowUp } = context;
  const candidateContext = buildCandidateContext(candidate);

  // Find if candidate struggled on this specific day
  const missionForDay = candidate.missions.find(m => m.day === currentDay.day);
  const dayDifficulty = missionForDay
    ? missionForDay.skipped
      ? '(Candidate SKIPPED this topic — ask foundational questions)'
      : missionForDay.attempts && missionForDay.attempts >= 3
        ? `(Candidate needed ${missionForDay.attempts} attempts — probe for gaps)`
        : missionForDay.attempts === 1
          ? '(Candidate passed first try — ask advanced/architectural questions)'
          : `(Candidate passed in ${missionForDay.attempts} attempts)`
    : '(No mission data for this day)';

  const historyStr = history.length > 0
    ? history.map(t => `${t.speaker.toUpperCase()}: ${t.text}`).join('\n')
    : '(This is the first turn — greet the candidate and ask your opening question)';

  return `${candidateContext}

Current Curriculum Target: Day ${currentDay.day} - ${currentDay.title} ${dayDifficulty}
Topic Type: ${currentDay.type}
Learning Objectives: ${currentDay.objectives.join('; ')}
Tools Covered: ${currentDay.tools.join(', ')}
Turn Number: ${questionCount + 1}
Is Follow-up Probe: ${isFollowUp}

Conversation History:
${historyStr}

Instructions:
${isFollowUp
    ? '- This is a follow-up. Dig deeper into the candidate\'s previous response. Ask them to elaborate on specifics, trade-offs, or edge cases.'
    : questionCount === 0
      ? '- This is the FIRST question. Greet the candidate warmly by first name, then ask an opening question about this curriculum day.'
      : '- Transition naturally to this new topic. Briefly acknowledge the previous answer, then ask a focused question about this day\'s objectives.'}
- Ask exactly ONE clear technical question.
- Keep your response to 2-4 sentences maximum.
- Be conversational and natural, like a senior engineer conducting a real interview.

Return JSON:
{
  "reply": "Your interviewer response text here",
  "score": 4,
  "notes": "Brief evaluation notes on the candidate's last response"
}`;
}

// ─── Feedback Prompt Builder ────────────────────────────────────────────────

export function buildFeedbackPrompt(context: {
  candidate: CandidateProfile;
  history: DialogueTurn[];
  coveredDays: CurriculumDay[];
}): string {
  const { candidate, history, coveredDays } = context;
  const candidateContext = buildCandidateContext(candidate);

  // Extract scores from history for quantitative analysis
  const scores = history
    .filter(t => t.speaker === 'interviewer' && t.evaluation)
    .map(t => t.evaluation!.score);
  const avgScore = scores.length > 0
    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
    : 'N/A';

  return `${candidateContext}

Interview Statistics:
- Total interview turns: ${history.length}
- Curriculum days covered: ${coveredDays.map(d => `Day ${d.day}: ${d.title}`).join(', ')}
- Average evaluation score: ${avgScore}/5

Full Interview Transcript:
${history.map(t => `${t.speaker.toUpperCase()}: ${t.text}`).join('\n')}

Instructions:
- Synthesize comprehensive, actionable feedback based on the FULL transcript above.
- Reference specific responses and topics from the conversation.
- Be honest but constructive. Highlight both strengths and areas for growth.
- For "next" steps, provide concrete, actionable learning recommendations.

Return JSON with these exact keys:
{
  "summary": "A 2-3 sentence executive overview of the candidate's performance",
  "strengths": ["Specific strength 1 with evidence", "Specific strength 2 with evidence", "Specific strength 3"],
  "gaps": ["Specific gap 1 with context", "Specific gap 2 with context"],
  "next": ["Actionable recommendation 1", "Actionable recommendation 2", "Actionable recommendation 3"]
}`;
}

// ─── Safe JSON Parser ───────────────────────────────────────────────────────

export function safeParseJSON<T>(text: string, fallback: T, providerName: string): T {
  try {
    return JSON.parse(text);
  } catch {
    console.warn(`[${providerName}] Malformed JSON response, using fallback.`);
    return fallback;
  }
}
