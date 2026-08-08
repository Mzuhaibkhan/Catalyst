import Redis from 'ioredis';

class RedisService {
  private client: Redis | null = null;
  private isConnected: boolean = false;

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    try {
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        retryStrategy: (times: number) => {
          if (times > 2) {
            // Stop retrying quickly to fallback smoothly to in-memory store
            return null;
          }
          return 500;
        },
        lazyConnect: true
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        console.log('⚡ Redis connected successfully. High-speed session caching active.');
      });

      this.client.on('error', (err: any) => {
        if (this.isConnected) {
          console.warn('⚠️ Redis connection error. Falling back to in-memory store:', err.message);
        }
        this.isConnected = false;
      });

      // Attempt initial connection silently
      this.client.connect().catch(() => {
        // Suppress initial unhandled rejection — fallback to memory
        this.isConnected = false;
      });
    } catch {
      this.isConnected = false;
    }
  }

  public isAvailable(): boolean {
    return this.isConnected && this.client !== null && this.client.status === 'ready';
  }

  public async get<T>(key: string): Promise<T | null> {
    if (!this.isAvailable() || !this.client) return null;
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public async set(key: string, value: any, ttlSeconds: number = 3600): Promise<boolean> {
    if (!this.isAvailable() || !this.client) return false;
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      return true;
    } catch {
      return false;
    }
  }

  public async del(key: string): Promise<boolean> {
    if (!this.isAvailable() || !this.client) return false;
    try {
      await this.client.del(key);
      return true;
    } catch {
      return false;
    }
  }
}

export const redisService = new RedisService();
