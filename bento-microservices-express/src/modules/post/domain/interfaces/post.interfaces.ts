import { DomainEventName } from '../../../../shared/constants/events';
import { PostProps } from '../entities/post.entity';

export type DomainEvent<TPayload> = {
  name: DomainEventName;
  payload: TPayload;
};

export interface IEventBus {
  publish<TPayload>(event: DomainEvent<TPayload>): Promise<void>;
  subscribe<TPayload>(
    eventName: DomainEventName,
    handler: (event: DomainEvent<TPayload>) => Promise<void>
  ): void;
}

export interface IPostRepository {
  create(post: PostProps): Promise<void>;
  findById(id: string): Promise<PostProps | null>;
  findByIds(ids: string[]): Promise<PostProps[]>;
  findRecentByAuthorIds(authorIds: string[], limit: number): Promise<PostProps[]>;
  search(input: { keyword?: string; topicId?: string; limit: number }): Promise<PostProps[]>;
  updateByAuthor(
    id: string,
    authorId: string,
    data: { content?: string; imageUrl?: string | null }
  ): Promise<boolean>;
  deleteByAuthor(id: string, authorId: string): Promise<boolean>;
  updateById(id: string, data: { content?: string; imageUrl?: string | null }): Promise<boolean>;
  deleteById(id: string): Promise<boolean>;
}

export interface IUserFollowRepository {
  follow(followerId: string, followingId: string): Promise<boolean>;
  unfollow(followerId: string, followingId: string): Promise<boolean>;
  getFollowerIds(userId: string): Promise<string[]>;
  getFollowingIds(userId: string): Promise<string[]>;
}

export interface IFeedCacheRepository {
  prependMany(feedOwnerIds: string[], postId: string): Promise<void>;
  appendFeed(feedOwnerId: string, postIds: string[]): Promise<void>;
  getFeed(feedOwnerId: string, limit: number): Promise<string[]>;
}
