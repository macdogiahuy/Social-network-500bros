import { RedisClientType, createClient } from 'redis';
import Logger from '@shared/utils/logger';
import { config } from '../config';

export class RedisCache {
  private static instance: RedisCache;
  private client: RedisClientType;

  private constructor(connectionUrl: string) {
    this.client = createClient({ url: connectionUrl });
    this.client.on('error', (err) => {
      Logger.error(`Redis cache client error: ${err.message}`);
    });
  }

  public static async init(connectionUrl: string) {
    if (!this.instance) {
      this.instance = new RedisCache(connectionUrl);
      await this.instance.connect();
    }
  }

  public static getInstance(): RedisCache {
    if (!this.instance) {
      throw new Error('RedisCache instance not initialized');
    }
    return this.instance;
  }

  private async connect(): Promise<void> {
    try {
      await this.client.connect();
      Logger.success('Connected to Redis cache server');
    } catch (error) {
      Logger.error(`Redis cache connection error: ${(error as Error).message}`);
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      Logger.error(`Redis get error: ${(error as Error).message}`);
      return null;
    }
  }

  public async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      return true;
    } catch (error) {
      Logger.error(`Redis set error: ${(error as Error).message}`);
      return false;
    }
  }

  public async del(key: string): Promise<boolean> {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      Logger.error(`Redis del error: ${(error as Error).message}`);
      return false;
    }
  }

  public async delPattern(pattern: string): Promise<boolean> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (error) {
      Logger.error(`Redis delPattern error: ${(error as Error).message}`);
      return false;
    }
  }

  public async disconnect(): Promise<void> {
    await this.client.disconnect();
    Logger.info('Disconnected from Redis cache server');
  }
}

export default RedisCache;
