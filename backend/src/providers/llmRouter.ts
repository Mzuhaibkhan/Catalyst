import { ILLMProvider, CandidateProfile, DialogueTurn, CurriculumDay, InterviewFeedback } from '../types';
import { GroqProvider } from './groqProvider';
import { GeminiProvider } from './geminiProvider';
import { OpenAIProvider } from './openaiProvider';
import { MockProvider } from './mockProvider';
import { GrokProvider } from './grokProvider';
import { NvidiaProvider } from './nvidiaProvider';

const ROUTER_TIMEOUT_MS = 20000;

// ─── Structured Error Categorization Helpers ───────────────────────────────

function isRateLimitError(err: any): boolean {
  return err?.status === 429 || String(err?.message).includes('429') || String(err?.message).toLowerCase().includes('rate limit');
}

function isAuthError(err: any): boolean {
  return err?.status === 401 || err?.status === 403;
}

function isNetworkError(err: any): boolean {
  return (
    err?.code === 'ECONNREFUSED' ||
    err?.code === 'ENOTFOUND' ||
    err?.code === 'ETIMEDOUT' ||
    String(err?.message).toLowerCase().includes('timeout') ||
    String(err?.message).toLowerCase().includes('network')
  );
}

function categorizeError(err: any): 'rate_limit' | 'auth' | 'network' | 'parse' | 'unknown' {
  if (isRateLimitError(err)) return 'rate_limit';
  if (isAuthError(err)) return 'auth';
  if (isNetworkError(err)) return 'network';
  if (String(err?.message).toLowerCase().includes('json') || String(err?.message).toLowerCase().includes('parse')) return 'parse';
  return 'unknown';
}

// ─── Timeout Wrapper ────────────────────────────────────────────────────────

function withTimeout<T>(promise: Promise<T>, ms: number, providerName: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms from ${providerName}`)), ms)
    )
  ]);
}

// ─── Extended interface for providers with key metadata ────────────────────

interface ILLMProviderWithKeys extends ILLMProvider {
  rotator?: { getAvailableKeyCount(): number; getTotalKeyCount(): number };
}

// ─── Router ─────────────────────────────────────────────────────────────────

export class LLMRouter {
  private providers: ILLMProvider[];

  constructor() {
    this.providers = [
      new GroqProvider(),
      new GeminiProvider(),
      new GrokProvider(),
      new NvidiaProvider(),
      new OpenAIProvider(),
      new MockProvider() // Fallback engine guaranteeing 100% uptime
    ];
  }

  public getAvailableProviders(): string[] {
    return this.providers.filter(p => p.isAvailable()).map(p => p.name);
  }

  /** Returns per-provider metadata for the health check endpoint */
  public getProviderDetails(): Array<{ name: string; available: boolean; availableKeys?: number; totalKeys?: number }> {
    return this.providers.map(p => {
      const withKeys = p as ILLMProviderWithKeys;
      return {
        name: p.name,
        available: p.isAvailable(),
        ...(withKeys.rotator ? {
          availableKeys: withKeys.rotator.getAvailableKeyCount(),
          totalKeys: withKeys.rotator.getTotalKeyCount()
        } : {})
      };
    });
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

    // If specific provider requested and available, try it first
    if (context.requestedProvider) {
      const match = this.providers.find(
        p => p.name.toLowerCase().includes(context.requestedProvider!.toLowerCase()) && p.isAvailable()
      );
      if (match) {
        try {
          const res = await withTimeout(match.generateTurnResponse(context), ROUTER_TIMEOUT_MS, match.name);
          return { ...res, provider: match.name, latencyMs: Date.now() - start };
        } catch (err: any) {
          const category = categorizeError(err);
          console.warn(
            `[LLMRouter] Requested provider "${context.requestedProvider}" failed [${category}]: ${err.message} — falling back to router logic`
          );
        }
      }
    }

    // Try available providers in tier order
    for (const provider of this.providers) {
      if (provider.isAvailable()) {
        try {
          const res = await withTimeout(provider.generateTurnResponse(context), ROUTER_TIMEOUT_MS, provider.name);
          return {
            ...res,
            provider: provider.name,
            latencyMs: Date.now() - start
          };
        } catch (err: any) {
          const category = categorizeError(err);
          console.warn(
            `[LLMRouter] Provider "${provider.name}" failed [${category}]: ${err.message} — trying next provider`
          );
        }
      }
    }

    // MockProvider is last in the array so we should never reach here, but guard anyway
    const fallback = this.providers[this.providers.length - 1];
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
          return await withTimeout(provider.generateFeedback(context), ROUTER_TIMEOUT_MS, provider.name);
        } catch (err: any) {
          const category = categorizeError(err);
          console.warn(
            `[LLMRouter] Provider "${provider.name}" failed during feedback [${category}]: ${err.message} — trying next provider`
          );
        }
      }
    }

    // Guaranteed fallback
    const fallback = this.providers[this.providers.length - 1];
    return fallback.generateFeedback(context);
  }
}

export const llmRouter = new LLMRouter();
