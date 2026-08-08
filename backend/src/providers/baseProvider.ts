import { ILLMProvider, CandidateProfile, DialogueTurn, CurriculumDay, InterviewFeedback } from '../types';
import { KeyRotator } from './keyRotator';
import { buildTurnPrompt, buildFeedbackPrompt, safeParseJSON, TURN_SYSTEM_PROMPT, FEEDBACK_SYSTEM_PROMPT } from './prompts';

/**
 * BaseLLMProvider — Abstract base class eliminating code duplication across providers.
 * Subclasses only need to implement `callChatCompletion()` and set name/rotator/model.
 */
export abstract class BaseLLMProvider implements ILLMProvider {
  public abstract name: string;
  public abstract readonly rotator: KeyRotator;

  public isAvailable(): boolean {
    return this.rotator.isAvailable();
  }

  /** Subclasses implement their specific API call */
  protected abstract callChatCompletion(
    systemPrompt: string,
    userPrompt: string,
    options: { temperature: number; maxTokens: number }
  ): Promise<string>;

  public async generateTurnResponse(context: {
    candidate: CandidateProfile;
    history: DialogueTurn[];
    currentDay: CurriculumDay;
    questionCount: number;
    isFollowUp: boolean;
  }): Promise<{ reply: string; score: number; notes: string }> {
    if (!this.isAvailable()) throw new Error(`No ${this.name} keys available`);

    const prompt = buildTurnPrompt(context);

    try {
      const text = await this.callChatCompletion(TURN_SYSTEM_PROMPT, prompt, {
        temperature: 0.7,
        maxTokens: 400
      });

      const parsed = safeParseJSON<Record<string, any>>(text, {}, this.name);

      return {
        reply: parsed.reply || `Could you detail your technical approach on Day ${context.currentDay.day}?`,
        score: parsed.score || 4,
        notes: parsed.notes || `${this.name} response generated.`
      };
    } catch (error: any) {
      this.handleError(error);
      throw error;
    }
  }

  public async generateFeedback(context: {
    candidate: CandidateProfile;
    history: DialogueTurn[];
    coveredDays: CurriculumDay[];
  }): Promise<InterviewFeedback> {
    if (!this.isAvailable()) throw new Error(`No ${this.name} keys available`);

    const prompt = buildFeedbackPrompt(context);

    try {
      const text = await this.callChatCompletion(FEEDBACK_SYSTEM_PROMPT, prompt, {
        temperature: 0.5,
        maxTokens: 800
      });

      const parsed = safeParseJSON<Record<string, any>>(text, {}, this.name);

      return {
        summary: parsed.summary || `${context.candidate.member.name} completed the technical interview.`,
        strengths: parsed.strengths || ['Good overall understanding of cohort topics'],
        gaps: parsed.gaps || ['Could expand on advanced optimization metrics'],
        next: parsed.next || ['Review deployment strategies']
      };
    } catch (error: any) {
      this.handleError(error);
      throw error;
    }
  }

  /** Shared error handling: rotate keys on 429/401/403 */
  protected handleError(error: any): void {
    if (
      error.status === 429 || error.status === 401 || error.status === 403 ||
      error.message?.includes('429')
    ) {
      this.rotator.rotateOnError(error.status || 429);
    }
  }
}
