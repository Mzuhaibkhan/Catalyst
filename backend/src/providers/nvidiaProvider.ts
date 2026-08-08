import { ILLMProvider, CandidateProfile, DialogueTurn, CurriculumDay, InterviewFeedback } from '../types';
import OpenAI from 'openai';
import { KeyRotator } from './keyRotator';

export class NvidiaProvider implements ILLMProvider {
  public name = 'NVIDIA NIM';
  public readonly rotator = new KeyRotator('NVIDIA_NIM_API_KEY');

  public isAvailable(): boolean {
    return this.rotator.isAvailable();
  }

  private getClient(): OpenAI {
    return new OpenAI({
      apiKey: this.rotator.getKey(),
      baseURL: process.env.NVIDIA_NIM_BASE_URL || 'https://integrate.api.nvidia.com/v1'
    });
  }

  public async generateTurnResponse(context: {
    candidate: CandidateProfile;
    history: DialogueTurn[];
    currentDay: CurriculumDay;
    questionCount: number;
    isFollowUp: boolean;
  }): Promise<{ reply: string; score: number; notes: string }> {
    if (!this.isAvailable()) throw new Error('No NVIDIA NIM keys available');

    const prompt = `Conduct a technical interview for ${context.candidate.member.name}.
Target Day: Day ${context.currentDay.day} - ${context.currentDay.title}
Objectives: ${context.currentDay.objectives.join('; ')}

History:
${context.history.map(t => `${t.speaker.toUpperCase()}: ${t.text}`).join('\n')}

Format output as JSON: {"reply": "...", "score": 4, "notes": "..."}`;

    try {
      const completion = await this.getClient().chat.completions.create({
        model: process.env.NVIDIA_NIM_MODEL || 'meta/llama-3.1-70b-instruct',
        messages: [
          { role: 'system', content: 'You are an AI Technical Interviewer. Return JSON.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        timeout: 15000
      });

      const text = completion.choices[0]?.message?.content || '{}';
      let parsed: any = {};
      try {
        parsed = JSON.parse(text);
      } catch {
        console.warn('NVIDIA NIM returned malformed JSON for turn response, using fallback.');
      }

      return {
        reply: parsed.reply || `Tell me about your implementation on Day ${context.currentDay.day}.`,
        score: parsed.score || 4,
        notes: parsed.notes || 'NVIDIA NIM response generated.'
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
    if (!this.isAvailable()) throw new Error('No NVIDIA NIM keys available');

    const prompt = `Provide interview feedback JSON: { "summary": "...", "strengths": [...], "gaps": [...], "next": [...] }
Candidate: ${context.candidate.member.name}
Covered: ${context.coveredDays.map(d => d.title).join(', ')}`;

    try {
      const completion = await this.getClient().chat.completions.create({
        model: process.env.NVIDIA_NIM_MODEL || 'meta/llama-3.1-70b-instruct',
        messages: [
          { role: 'system', content: 'Return valid JSON matching requested keys.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        timeout: 15000
      });

      const text = completion.choices[0]?.message?.content || '{}';
      let parsed: any = {};
      try {
        parsed = JSON.parse(text);
      } catch {
        console.warn('NVIDIA NIM returned malformed JSON for feedback, using fallback.');
      }

      return {
        summary: parsed.summary || 'Candidate completed technical interview.',
        strengths: parsed.strengths || ['Solid fundamental knowledge'],
        gaps: parsed.gaps || ['Further practice on complex architectures'],
        next: parsed.next || ['Review deployment pipelines']
      };
    } catch (error: any) {
      if (error.status === 429 || error.status === 401 || error.status === 403 || error.message?.includes('429')) {
        this.rotator.rotateOnError(error.status || 429);
      }
      throw error;
    }
  }
}
