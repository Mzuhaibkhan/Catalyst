import { KeyRotator } from './keyRotator';
import { BaseLLMProvider } from './baseProvider';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiProvider extends BaseLLMProvider {
  public name = 'Google Gemini 1.5 Flash';
  public readonly rotator = new KeyRotator('GEMINI_API_KEY');

  private getModel() {
    const ai = new GoogleGenerativeAI(this.rotator.getKey());
    return ai.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });
  }

  protected async callChatCompletion(
    systemPrompt: string,
    userPrompt: string,
    options: { temperature: number; maxTokens: number }
  ): Promise<string> {
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    const GEMINI_TIMEOUT_MS = 15000;

    const response = await Promise.race([
      this.getModel().generateContent(fullPrompt),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Gemini API timeout after ${GEMINI_TIMEOUT_MS}ms`)), GEMINI_TIMEOUT_MS)
      )
    ]);

    return response.response.text() || '{}';
  }
}
