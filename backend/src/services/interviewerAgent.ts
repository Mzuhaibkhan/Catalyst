import { SessionState, InterviewResponse, CurriculumDay } from '../types';
import { getCurriculumDayMap } from './candidatePlanner';
import { llmRouter } from '../providers/llmRouter';

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
    // Generate structured feedback
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
      reply: 'Interview completed. Thank you for walking through your technical journey in the AI Cohort!',
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

  // Decide if this turn is a follow-up probe (e.g. if turn is odd and questionCount > 0)
  const isFollowUp = session.questionCount > 0 && session.questionCount % 2 === 1;

  // 4. Generate Interviewer response using Multi-LLM Router
  const turnResult = await llmRouter.generateTurn({
    candidate: session.candidate,
    history: session.history,
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
      notes: turnResult.provider
    }
  });

  return {
    reply: turnResult.reply,
    done: false,
    metrics: {
      latencyMs: turnResult.latencyMs,
      provider: turnResult.provider,
      coveredDaysCount: session.coveredDays.size,
      questionCount: session.questionCount
    }
  };
}
