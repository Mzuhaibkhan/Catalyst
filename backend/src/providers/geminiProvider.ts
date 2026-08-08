import { ILLMProvider, CandidateProfile, DialogueTurn, CurriculumDay, InterviewFeedback } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiProvider implements ILLMProvider {
  public name = 'Google Gemini 1.5 Flash';
  private ai: GoogleGenerativeAI | null = null;

  constructor() {
    if (process.env.GEMINI_API_KEY) {
      this.ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
  }

  public isAvailable(): boolean {
    return !!this.ai;
  }

  public async generateTurnResponse(context: {
    candidate: CandidateProfile;
    history: DialogueTurn[];
    currentDay: CurriculumDay;
    questionCount: number;
    isFollowUp: boolean;
  }): Promise<{ reply: string; score: number; notes: string }> {
    if (!this.ai) throw new Error('Gemini client not initialized');

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

    const model = this.ai.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const response = await model.generateContent(prompt);
    const text = response.response.text() || '{}';
    const parsed = JSON.parse(text);

    return {
      reply: parsed.reply || `Let's discuss Day ${context.currentDay.day}: ${context.currentDay.title}. What engineering choices did you make?`,
      score: parsed.score || 4,
      notes: parsed.notes || 'Gemini response generated.'
    };
  }

  public async generateFeedback(context: {
    candidate: CandidateProfile;
    history: DialogueTurn[];
    coveredDays: CurriculumDay[];
  }): Promise<InterviewFeedback> {
    if (!this.ai) throw new Error('Gemini client not initialized');

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

    const model = this.ai.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const response = await model.generateContent(prompt);
    const text = response.response.text() || '{}';
    const parsed = JSON.parse(text);

    return {
      summary: parsed.summary || `${context.candidate.member.name} completed the interview.`,
      strengths: parsed.strengths || ['Good overall grasp'],
      gaps: parsed.gaps || ['Further practice on latency tuning'],
      next: parsed.next || ['Build end-to-end evaluation benchmark']
    };
  }
}
