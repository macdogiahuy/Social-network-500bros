import { DomainEvents } from '../../../../shared/constants/events';
import {
  DomainEvent,
  IEventBus,
  IFeedCacheRepository,
  IUserFollowRepository
} from '../../domain/interfaces/post.interfaces';

type PostCreatedPayload = {
  postId: string;
  authorId: string;
  topicId: string;
  createdAt: string;
};

export class PostCreatedFeedProjector {
  public constructor(
    private readonly eventBus: IEventBus,
    private readonly followRepository: IUserFollowRepository,
    private readonly feedCacheRepository: IFeedCacheRepository
  ) {}

  public register(): void {
    this.eventBus.subscribe<PostCreatedPayload>(DomainEvents.PostCreated, async (event) => {
      await this.handle(event);
    });
  }

  private async handle(event: DomainEvent<PostCreatedPayload>): Promise<void> {
    const followerIds = await this.followRepository.getFollowerIds(event.payload.authorId);
    const feedOwners = Array.from(new Set([...followerIds, event.payload.authorId]));
    await this.feedCacheRepository.prependMany(feedOwners, event.payload.postId);
  }
}
