import { SessionState, InterviewResponse, CurriculumDay } from '../types';
import { getCurriculumDayMap } from './candidatePlanner';
import { llmRouter } from '../providers/llmRouter';

const WIND_DOWN_MESSAGE = `Thank you for walking me through your technical work across the AI Cohort. You've given some excellent insights. Before we wrap up — is there anything else you'd like to highlight about your engineering approach or any projects you're particularly proud of?`;

export async function processInterviewTurn(
  session: SessionState,
  candidateMessage?: string,
  requestedProvider?: string
): Promise<InterviewResponse> {
  const dayMap = getCurriculumDayMap();

  // 1. Record candidate message if this is a follow-up turn
  if (candidateMessage && candidateMessage.trim().length > 0) {
    session.history.push({
      turnId: session.history.length + 1,
      speaker: 'candidate',
      text: candidateMessage.trim(),
      timestamp: new Date().toISOString()
    });
  }

  // 2. Check if minimum requirements for completing interview are met
  // Min 8 questions (or interviewer turns) and min 4 covered curriculum days
  const isEligibleToFinish = session.questionCount >= 8 && session.coveredDays.size >= 4;

  if (isEligibleToFinish && candidateMessage) {
    // Wind-down phase: give the candidate one closing turn before generating feedback
    if (!session.isWindingDown) {
      session.isWindingDown = true;
      session.history.push({
        turnId: session.history.length + 1,
        speaker: 'interviewer',
        text: WIND_DOWN_MESSAGE,
        timestamp: new Date().toISOString()
      });
      return {
        reply: WIND_DOWN_MESSAGE,
        done: false,
        metrics: {
          latencyMs: 0,
          provider: 'system',
          coveredDaysCount: session.coveredDays.size,
          questionCount: session.questionCount
        }
      };
    }

    // Generate structured feedback after wind-down
    const coveredDayObjects: CurriculumDay[] = Array.from(session.coveredDays)
      .map(d => dayMap.get(d))
      .filter((d): d is CurriculumDay => d !== undefined);

    const feedback = await llmRouter.generateFeedback({
      candidate: session.candidate,
      history: session.history,
      coveredDays: coveredDayObjects,
      requestedProvider
    });

    session.isComplete = true;
    session.feedback = feedback;

    return {
      reply: `Excellent — thank you, ${session.candidate.member.name.split(' ')[0]}. Your interview is now complete. I've synthesized a comprehensive evaluation based on our conversation. You'll find your detailed feedback below.`,
      done: true,
      feedback: feedback
    };
  }

  // 3. Select target curriculum day for current turn
  // Rotate through candidate's targetDays array to ensure at least 4 unique days are covered across 8 turns
  const targetDayNumber = session.targetDays[session.currentDayIndex % session.targetDays.length];
  const currentDayObj = dayMap.get(targetDayNumber) || {
    day: targetDayNumber,
    title: `Day ${targetDayNumber} Curriculum Topic`,
    type: 'BUILD',
    tools: ['AI Engineering Tools'],
    objectives: ['Implement enterprise AI patterns']
  };

  session.coveredDays.add(targetDayNumber);

  // Adaptive follow-up logic based on last evaluation score
  // Score <= 2: simplify & clarify, Score 3-4: deeper follow-up, Score 5: advance to next topic
  const lastInterviewerTurn = [...session.history].reverse().find(t => t.speaker === 'interviewer' && t.evaluation);
  const lastScore = lastInterviewerTurn?.evaluation?.score ?? 4;
  const isFollowUp = session.questionCount > 0 && (lastScore <= 4 && session.questionCount % 2 === 1);

  // 4. Generate Interviewer response using Multi-LLM Router
  const trimmedHistory = session.history.slice(-10);
  
  const turnResult = await llmRouter.generateTurn({
    candidate: session.candidate,
    history: trimmedHistory,
    currentDay: currentDayObj,
    questionCount: session.questionCount,
    isFollowUp,
    requestedProvider
  });

  // Increment counters and update history
  session.questionCount += 1;

  // Progress to next target day if not follow-up
  if (!isFollowUp) {
    session.currentDayIndex = (session.currentDayIndex + 1) % session.targetDays.length;
  }

  session.history.push({
    turnId: session.history.length + 1,
    speaker: 'interviewer',
    text: turnResult.reply,
    timestamp: new Date().toISOString(),
    targetDay: targetDayNumber,
    evaluation: {
      score: turnResult.score,
      notes: turnResult.notes
    }
  });

  return {
    reply: turnResult.reply,
    done: false,
    evaluation: {
      score: turnResult.score,
      notes: turnResult.notes
    },
    metrics: {
      latencyMs: turnResult.latencyMs,
      provider: turnResult.provider,
      coveredDaysCount: session.coveredDays.size,
      questionCount: session.questionCount
    }
  };
}
