import { ILLMProvider, CandidateProfile, DialogueTurn, CurriculumDay, InterviewFeedback } from '../types';
import OpenAI from 'openai';

export class OpenAIProvider implements ILLMProvider {
  public name = 'OpenAI (GPT-4o-mini)';
  private client: OpenAI | null = null;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
  }

  public isAvailable(): boolean {
    return !!this.client;
  }

  public async generateTurnResponse(context: {
    candidate: CandidateProfile;
    history: DialogueTurn[];
    currentDay: CurriculumDay;
    questionCount: number;
    isFollowUp: boolean;
  }): Promise<{ reply: string; score: number; notes: string }> {
    if (!this.client) throw new Error('OpenAI client not initialized');

    const prompt = `Conduct a technical interview for ${context.candidate.member.name}.
Target Day: Day ${context.currentDay.day} - ${context.currentDay.title}
Objectives: ${context.currentDay.objectives.join('; ')}

History:
${context.history.map(t => `${t.speaker.toUpperCase()}: ${t.text}`).join('\n')}

Format output as JSON: {"reply": "...", "score": 4, "notes": "..."}`;

    const completion = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an AI Technical Interviewer. Return JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    });

    const text = completion.choices[0]?.message?.content || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      console.warn('OpenAI returned malformed JSON for turn response, using fallback.');
    }

    return {
      reply: parsed.reply || `Tell me about your implementation on Day ${context.currentDay.day}.`,
      score: parsed.score || 4,
      notes: parsed.notes || 'OpenAI response generated.'
    };
  }

  public async generateFeedback(context: {
    candidate: CandidateProfile;
    history: DialogueTurn[];
    coveredDays: CurriculumDay[];
  }): Promise<InterviewFeedback> {
    if (!this.client) throw new Error('OpenAI client not initialized');

    const prompt = `Provide interview feedback JSON: { "summary": "...", "strengths": [...], "gaps": [...], "next": [...] }
Candidate: ${context.candidate.member.name}
Covered: ${context.coveredDays.map(d => d.title).join(', ')}`;

    const completion = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Return valid JSON matching requested keys.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    });

    const text = completion.choices[0]?.message?.content || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      console.warn('OpenAI returned malformed JSON for feedback, using fallback.');
    }

    return {
      summary: parsed.summary || 'Candidate completed technical interview.',
      strengths: parsed.strengths || ['Solid fundamental knowledge'],
      gaps: parsed.gaps || ['Further practice on complex architectures'],
      next: parsed.next || ['Review deployment pipelines']
    };
  }
}
