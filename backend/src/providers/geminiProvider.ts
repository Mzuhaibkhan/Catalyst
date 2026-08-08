import { ILLMProvider, CandidateProfile, DialogueTurn, CurriculumDay, InterviewFeedback } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { KeyRotator } from './keyRotator';

const GEMINI_TIMEOUT_MS = 15000;

function withGeminiTimeout<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Gemini API timeout after ${GEMINI_TIMEOUT_MS}ms`)), GEMINI_TIMEOUT_MS)
    )
  ]);
}

export class GeminiProvider implements ILLMProvider {
  public name = 'Google Gemini 1.5 Flash';
  public readonly rotator = new KeyRotator('GEMINI_API_KEY');

  public isAvailable(): boolean {
    return this.rotator.isAvailable();
  }

  private getModel() {
    const ai = new GoogleGenerativeAI(this.rotator.getKey());
    return ai.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });
  }

  public async generateTurnResponse(context: {
    candidate: CandidateProfile;
    history: DialogueTurn[];
    currentDay: CurriculumDay;
    questionCount: number;
    isFollowUp: boolean;
  }): Promise<{ reply: string; score: number; notes: string }> {
    if (!this.isAvailable()) throw new Error('No Gemini keys available');

    const prompt = `You are a technical interviewer interviewing candidate ${context.candidate.member.name} (${context.candidate.member.jobRole}).
Current Curriculum Target: Day ${context.currentDay.day} - ${context.currentDay.title}
Objectives: ${context.currentDay.objectives.join('; ')}
Tools: ${context.currentDay.tools.join(', ')}

Interview History:
${context.history.map(t => `${t.speaker.toUpperCase()}: ${t.text}`).join('\n')}

Rules:
1. Be professional, natural, and technical.
2. Ask 1 question or probing follow-up.
3. Max 3-4 sentences.

Format output as JSON:
{"reply": "your text", "score": 4, "notes": "notes"}`;

    try {
      const response = await withGeminiTimeout(this.getModel().generateContent(prompt));
      const text = response.response.text() || '{}';
      let parsed: any = {};
      try {
        parsed = JSON.parse(text);
      } catch {
        console.warn('[GeminiProvider] Malformed JSON in turn response, using fallback.');
      }

      return {
        reply: parsed.reply || `Let's discuss Day ${context.currentDay.day}: ${context.currentDay.title}. What engineering choices did you make?`,
        score: parsed.score || 4,
        notes: parsed.notes || 'Gemini response generated.'
      };
    } catch (error: any) {
      if (error.status === 429 || error.status === 401 || error.status === 403 || error.message?.includes('429')) {
        this.rotator.rotateOnError(error.status || 429);
      }
      throw error;
    }
  }

  public async generateFeedback(context: {
    candidate: CandidateProfile;
    history: DialogueTurn[];
    coveredDays: CurriculumDay[];
  }): Promise<InterviewFeedback> {
    if (!this.isAvailable()) throw new Error('No Gemini keys available');

    const prompt = `Synthesize final technical interview feedback for candidate ${context.candidate.member.name}.
Covered Topics: ${context.coveredDays.map(d => `Day ${d.day}: ${d.title}`).join(', ')}

History:
${context.history.map(t => `${t.speaker.toUpperCase()}: ${t.text}`).join('\n')}

Return JSON with exact keys:
{
  "summary": "String overview",
  "strengths": ["Item 1", "Item 2"],
  "gaps": ["Item 1", "Item 2"],
  "next": ["Item 1", "Item 2"]
}`;

    try {
      const response = await withGeminiTimeout(this.getModel().generateContent(prompt));
      const text = response.response.text() || '{}';
      let parsed: any = {};
      try {
        parsed = JSON.parse(text);
      } catch {
        console.warn('[GeminiProvider] Malformed JSON in feedback response, using fallback.');
      }

      return {
        summary: parsed.summary || `${context.candidate.member.name} completed the interview.`,
        strengths: parsed.strengths || ['Good overall grasp'],
        gaps: parsed.gaps || ['Further practice on latency tuning'],
        next: parsed.next || ['Build end-to-end evaluation benchmark']
      };
    } catch (error: any) {
      if (error.status === 429 || error.status === 401 || error.status === 403 || error.message?.includes('429')) {
        this.rotator.rotateOnError(error.status || 429);
      }
      throw error;
    }
  }
}
