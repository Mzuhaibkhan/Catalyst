import { KeyRotator } from './keyRotator';
import { BaseLLMProvider } from './baseProvider';
import Groq from 'groq-sdk';

export class GroqProvider extends BaseLLMProvider {
  public name = 'Groq (Llama-3.3-70B)';
  public readonly rotator = new KeyRotator('GROQ_API_KEY');
  private readonly baseClient = new Groq({ apiKey: 'placeholder' });

  protected async callChatCompletion(
    systemPrompt: string,
    userPrompt: string,
    options: { temperature: number; maxTokens: number }
  ): Promise<string> {
    const completion = await this.baseClient.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      temperature: options.temperature,
      max_tokens: options.maxTokens
    // @ts-ignore - Groq SDK supports per-request apiKey override
    }, { timeout: 15000, headers: { Authorization: `Bearer ${this.rotator.getKey()}` } });

    return completion.choices[0]?.message?.content || '{}';
  }
}
