import { KeyRotator } from './keyRotator';
import { BaseLLMProvider } from './baseProvider';
import OpenAI from 'openai';

export class OpenAIProvider extends BaseLLMProvider {
  public name = 'OpenAI (GPT-4o-mini)';
  public readonly rotator = new KeyRotator('OPENAI_API_KEY');
  private client: OpenAI | null = null;
  private lastKeyUsed: string = '';

  private getClient(): OpenAI {
    const currentKey = this.rotator.getKey();
    if (!this.client || this.lastKeyUsed !== currentKey) {
      this.client = new OpenAI({ apiKey: currentKey });
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
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: options.temperature,
        max_tokens: options.maxTokens
      },
      { timeout: 15000 }
    );

    return completion.choices[0]?.message?.content || '{}';
  }
}
