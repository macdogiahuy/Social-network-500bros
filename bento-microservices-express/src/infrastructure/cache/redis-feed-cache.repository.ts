import { createClient, RedisClientType } from 'redis';
import { IFeedCacheRepository } from '../../modules/post/domain/interfaces/post.interfaces';

const FEED_MAX_LENGTH = 500;
const FEED_TTL_SECONDS = 60 * 30;

export class RedisFeedCacheRepository implements IFeedCacheRepository {
  private readonly client: RedisClientType;

  public constructor(redisUrl: string) {
    this.client = createClient({ url: redisUrl });
  }

  public async connect(): Promise<void> {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.disconnect();
    }
  }

  public async prependMany(feedOwnerIds: string[], postId: string): Promise<void> {
    if (feedOwnerIds.length === 0) {
      return;
    }

    const pipeline = this.client.multi();
    for (const userId of feedOwnerIds) {
      const key = this.feedKey(userId);
      pipeline.lPush(key, postId);
      pipeline.lTrim(key, 0, FEED_MAX_LENGTH - 1);
      pipeline.expire(key, FEED_TTL_SECONDS);
    }
    await pipeline.exec();
  }

  public async appendFeed(feedOwnerId: string, postIds: string[]): Promise<void> {
    if (postIds.length === 0) {
      return;
    }

    const key = this.feedKey(feedOwnerId);
    const pipeline = this.client.multi();
    pipeline.rPush(key, postIds);
    pipeline.lTrim(key, 0, FEED_MAX_LENGTH - 1);
    pipeline.expire(key, FEED_TTL_SECONDS);
    await pipeline.exec();
  }

  public async getFeed(feedOwnerId: string, limit: number): Promise<string[]> {
    if (limit <= 0) {
      return [];
    }
    return this.client.lRange(this.feedKey(feedOwnerId), 0, Math.max(0, limit - 1));
  }

  private feedKey(userId: string): string {
    return `feed:${userId}`;
  }
}
