import { ILLMProvider, CandidateProfile, DialogueTurn, CurriculumDay, InterviewFeedback } from '../types';
import Groq from 'groq-sdk';
import { KeyRotator } from './keyRotator';

export class GroqProvider implements ILLMProvider {
  public name = 'Groq (Llama-3.3-70B)';
  public readonly rotator = new KeyRotator('GROQ_API_KEY');
  private readonly baseClient = new Groq({ apiKey: 'placeholder' }); // re-used; key overridden per request

  public isAvailable(): boolean {
    return this.rotator.isAvailable();
  }

  public async generateTurnResponse(context: {
    candidate: CandidateProfile;
    history: DialogueTurn[];
    currentDay: CurriculumDay;
    questionCount: number;
    isFollowUp: boolean;
  }): Promise<{ reply: string; score: number; notes: string }> {
    if (!this.isAvailable()) throw new Error('No Groq keys available');

    const prompt = `You are a top-tier technical interviewer conducting a multi-turn engineering interview for ${context.candidate.member.name} (${context.candidate.member.jobRole}, ${context.candidate.member.yearsExperience} yrs exp).

Curriculum Topic: Day ${context.currentDay.day} - ${context.currentDay.title}
Objectives: ${context.currentDay.objectives.join('; ')}
Tools: ${context.currentDay.tools.join(', ')}
Turn Count: ${context.questionCount}
Is Follow-up Probe: ${context.isFollowUp}

Conversation History:
${context.history.map(t => `${t.speaker.toUpperCase()}: ${t.text}`).join('\n')}

Rules:
1. Speak naturally as a senior engineering interviewer.
2. Ask 1 focused technical question or follow-up probe.
3. Keep response concise (2-4 sentences max).

Return JSON format:
{
  "reply": "Your interviewer response text",
  "score": 4,
  "notes": "Brief notes on candidate performance"
}`;

    try {
      const completion = await this.baseClient.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are an AI Technical Interviewer. Output valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 300,
        timeout: 15000
      // @ts-ignore - Groq SDK supports per-request apiKey override
      }, { headers: { Authorization: `Bearer ${this.rotator.getKey()}` } });

      const text = completion.choices[0]?.message?.content || '{}';
      let parsed: any = {};
      try {
        parsed = JSON.parse(text);
      } catch {
        console.warn('Groq returned malformed JSON for turn response, using fallback.');
      }

      return {
        reply: parsed.reply || `Could you detail your technical decisions on Day ${context.currentDay.day}?`,
        score: parsed.score || 4,
        notes: parsed.notes || 'Groq response generated.'
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
    if (!this.isAvailable()) throw new Error('No Groq keys available');

    const prompt = `Generate final interview feedback for candidate ${context.candidate.member.name}.
Covered Days: ${context.coveredDays.map(d => `Day ${d.day}: ${d.title}`).join(', ')}

Interview History:
${context.history.map(t => `${t.speaker.toUpperCase()}: ${t.text}`).join('\n')}

Return JSON with exact keys:
{
  "summary": "Concise executive overview string",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "gaps": ["Gap 1", "Gap 2"],
  "next": ["Action 1", "Action 2"]
}`;

    try {
      const completion = await this.baseClient.chat.completions.create({
        messages: [
          { role: 'system', content: 'Return valid JSON only matching the schema.' },
          { role: 'user', content: prompt }
        ],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' },
        temperature: 0.5,
        max_tokens: 600,
        timeout: 15000
      // @ts-ignore - Groq SDK supports per-request apiKey override
      }, { headers: { Authorization: `Bearer ${this.rotator.getKey()}` } });

      const text = completion.choices[0]?.message?.content || '{}';
      let parsed: any = {};
      try {
        parsed = JSON.parse(text);
      } catch {
        console.warn('Groq returned malformed JSON for feedback, using fallback.');
      }

      return {
        summary: parsed.summary || `${context.candidate.member.name} completed the technical interview.`,
        strengths: parsed.strengths || ['Good overall understanding of cohort topics'],
        gaps: parsed.gaps || ['Could expand on advanced optimization metrics'],
        next: parsed.next || ['Review deployment strategies']
      };
    } catch (error: any) {
      if (error.status === 429 || error.status === 401 || error.status === 403 || error.message?.includes('429')) {
        this.rotator.rotateOnError(error.status || 429);
      }
      throw error;
    }
  }
}
