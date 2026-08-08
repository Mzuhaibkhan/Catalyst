import { ILLMProvider, CandidateProfile, DialogueTurn, CurriculumDay, InterviewFeedback } from '../types';
import { GroqProvider } from './groqProvider';
import { GeminiProvider } from './geminiProvider';
import { OpenAIProvider } from './openaiProvider';
import { MockProvider } from './mockProvider';

export class LLMRouter {
  private providers: ILLMProvider[];

  constructor() {
    this.providers = [
      new GroqProvider(),
      new GeminiProvider(),
      new OpenAIProvider(),
      new MockProvider() // Fallback engine guaranteeing 100% uptime
    ];
  }

  public getAvailableProviders(): string[] {
    return this.providers.filter(p => p.isAvailable()).map(p => p.name);
  }

  public async generateTurn(context: {
    candidate: CandidateProfile;
    history: DialogueTurn[];
    currentDay: CurriculumDay;
    questionCount: number;
    isFollowUp: boolean;
    requestedProvider?: string;
  }): Promise<{ reply: string; score: number; notes: string; provider: string; latencyMs: number }> {
    const start = Date.now();

    // If specific provider requested and available
    if (context.requestedProvider) {
      const match = this.providers.find(p => p.name.toLowerCase().includes(context.requestedProvider!.toLowerCase()) && p.isAvailable());
      if (match) {
        try {
          const res = await match.generateTurnResponse(context);
          return { ...res, provider: match.name, latencyMs: Date.now() - start };
        } catch (err) {
          console.warn(`Requested provider ${context.requestedProvider} failed, falling back to router logic.`, err);
        }
      }
    }

    // Try available providers in tier order
    for (const provider of this.providers) {
      if (provider.isAvailable()) {
        try {
          const res = await provider.generateTurnResponse(context);
          return {
            ...res,
            provider: provider.name,
            latencyMs: Date.now() - start
          };
        } catch (err) {
          console.warn(`Provider ${provider.name} failed during turn execution. Fallback to next.`, err);
        }
      }
    }

    // Guaranteed local mock execution
    const fallback = new MockProvider();
    const res = await fallback.generateTurnResponse(context);
    return { ...res, provider: fallback.name, latencyMs: Date.now() - start };
  }

  public async generateFeedback(context: {
    candidate: CandidateProfile;
    history: DialogueTurn[];
    coveredDays: CurriculumDay[];
    requestedProvider?: string;
  }): Promise<InterviewFeedback> {
    for (const provider of this.providers) {
      if (provider.isAvailable()) {
        try {
          return await provider.generateFeedback(context);
        } catch (err) {
          console.warn(`Provider ${provider.name} failed during feedback generation. Fallback.`, err);
        }
      }
    }
    return new MockProvider().generateFeedback(context);
  }
}

export const llmRouter = new LLMRouter();
