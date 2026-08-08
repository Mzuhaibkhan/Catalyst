/**
 * KeyRotator — Round-robin multi-key manager for LLM provider API keys.
 * Reads PREFIX_1, PREFIX_2, PREFIX_3 (and PREFIX as fallback) from process.env.
 * On 429/401/403 errors, rotates to next key and places current key in a cooldown.
 */
export class KeyRotator {
  private keys: string[];
  private pointer: number = 0;
  private cooldowns: Map<string, number> = new Map();

  constructor(private prefix: string) {
    const numbered: string[] = [];
    for (let i = 1; i <= 10; i++) {
      const val = process.env[`${prefix}_${i}`];
      if (val && val.trim() && !val.startsWith('your_')) {
        numbered.push(val.trim());
      }
    }

    if (numbered.length === 0) {
      const single = process.env[prefix];
      if (single && single.trim() && !single.startsWith('your_')) {
        numbered.push(single.trim());
      }
    }

    this.keys = numbered;
  }

  public isAvailable(): boolean {
    return this.getAvailableKeys().length > 0;
  }

  public getAvailableKeyCount(): number {
    return this.getAvailableKeys().length;
  }

  public getTotalKeyCount(): number {
    return this.keys.length;
  }

  public getKey(): string {
    const available = this.getAvailableKeys();
    if (available.length === 0) {
      if (this.keys.length === 0) throw new Error(`No API keys configured for prefix: ${this.prefix}`);
      return this.keys[this.pointer % this.keys.length];
    }

    let attempts = 0;
    while (attempts < this.keys.length) {
      const key = this.keys[this.pointer % this.keys.length];
      if (!this.isOnCooldown(key)) {
        return key;
      }
      this.pointer = (this.pointer + 1) % this.keys.length;
      attempts++;
    }

    return this.keys[this.pointer % this.keys.length];
  }

  public rotateOnError(errorCode: number): void {
    if (this.keys.length === 0) return;

    const currentKey = this.keys[this.pointer % this.keys.length];
    const isRateLimitOrAuth = errorCode === 429 || errorCode === 401 || errorCode === 403;

    if (isRateLimitOrAuth) {
      const cooldownMs = errorCode === 429 ? 60_000 : 30_000;
      this.cooldowns.set(currentKey, Date.now() + cooldownMs);
      console.warn(
        `[KeyRotator:${this.prefix}] Key ...${currentKey.slice(-6)} placed on ${cooldownMs / 1000}s cooldown (HTTP ${errorCode})`
      );
    }

    this.pointer = (this.pointer + 1) % this.keys.length;
    console.info(
      `[KeyRotator:${this.prefix}] Rotated to key index ${this.pointer % this.keys.length} (${this.getAvailableKeyCount()}/${this.keys.length} keys available)`
    );
  }

  private isOnCooldown(key: string): boolean {
    const expiry = this.cooldowns.get(key);
    if (!expiry) return false;
    if (Date.now() > expiry) {
      this.cooldowns.delete(key);
      return false;
    }
    return true;
  }

  private getAvailableKeys(): string[] {
    return this.keys.filter(k => !this.isOnCooldown(k));
  }
}
