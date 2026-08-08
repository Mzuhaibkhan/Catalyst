import { ILLMProvider, CandidateProfile, DialogueTurn, CurriculumDay, InterviewFeedback } from '../types';

export class MockProvider implements ILLMProvider {
  public name = 'Zero-Latency Mock Engine';

  public isAvailable(): boolean {
    return true; // Always available
  }

  public async generateTurnResponse(context: {
    candidate: CandidateProfile;
    history: DialogueTurn[];
    currentDay: CurriculumDay;
    questionCount: number;
    isFollowUp: boolean;
  }): Promise<{ reply: string; score: number; notes: string }> {
    const { candidate, currentDay, questionCount, isFollowUp } = context;
    const name = candidate.member.name.split(' ')[0];

    let reply = '';
    if (questionCount === 0) {
      reply = `Welcome ${name}. I'm excited to dive into your technical journey through the AI Cohort. Let's start with Day ${currentDay.day}: ${currentDay.title}. Could you explain how you designed your system around ${currentDay.tools[0] || 'the core objective'} and what engineering trade-offs you considered?`;
    } else if (isFollowUp) {
      reply = `That's an interesting approach regarding ${currentDay.title}. How did you measure performance or handle edge cases when scaling this in production?`;
    } else {
      reply = `Great points on that topic. Let's transition to Day ${currentDay.day}: ${currentDay.title}. In your mission implementation, what was the biggest challenge you encountered with ${currentDay.objectives[0] || 'the main framework'}?`;
    }

    return {
      reply,
      score: 4,
      notes: 'Structured heuristic turn generation.'
    };
  }

  public async generateFeedback(context: {
    candidate: CandidateProfile;
    history: DialogueTurn[];
    coveredDays: CurriculumDay[];
  }): Promise<InterviewFeedback> {
    const { candidate, coveredDays } = context;
    const dayTitles = coveredDays.map(d => `Day ${d.day} (${d.title})`).join(', ');

    return {
      summary: `${candidate.member.name} demonstrated solid engineering competence across key cohort topics including ${dayTitles}. Showed good problem-solving ability and practical hands-on experience.`,
      strengths: [
        `Strong grasp of core concepts across ${coveredDays.length} distinct curriculum days`,
        `Practical understanding of toolings: ${coveredDays.flatMap(d => d.tools).slice(0, 4).join(', ')}`,
        `Clear technical communication style and structured trade-off reasoning`
      ],
      gaps: [
        `Could elaborate deeper on edge-case failure modes and production monitoring metrics`,
        `Opportunity to refine deep vector retrieval tuning parameters under high load`
      ],
      next: [
        `Implement automated evaluation suites (RAGAS/TruLens) for production RAG pipelines`,
        `Explore advanced Model Context Protocol (MCP) tool integration patterns`,
        `Practice system design explanations focused on latency and concurrency limits`
      ]
    };
  }
}
