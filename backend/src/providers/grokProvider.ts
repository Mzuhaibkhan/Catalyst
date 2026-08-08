import { KeyRotator } from './keyRotator';
import { BaseLLMProvider } from './baseProvider';
import OpenAI from 'openai';

export class GrokProvider extends BaseLLMProvider {
  public name = 'xAI Grok';
  public readonly rotator = new KeyRotator('GROK_API_KEY');
  private client: OpenAI | null = null;
  private lastKeyUsed: string = '';

  private getClient(): OpenAI {
    const currentKey = this.rotator.getKey();
    if (!this.client || this.lastKeyUsed !== currentKey) {
      this.client = new OpenAI({
        apiKey: currentKey,
        baseURL: 'https://api.x.ai/v1'
      });
      this.lastKeyUsed = currentKey;
    }
    return this.client;
  }

  protected async callChatCompletion(
    systemPrompt: string,
    userPrompt: string,
    options: { temperature: number; maxTokens: number }
  ): Promise<string> {
    const completion = await this.getClient().chat.completions.create(
      {
        model: process.env.GROK_MODEL || 'grok-3-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      },
      { timeout: 15000 }
    );

    return completion.choices[0]?.message?.content || '{}';
  }
}
