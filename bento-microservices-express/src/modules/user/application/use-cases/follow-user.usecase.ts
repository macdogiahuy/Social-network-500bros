import { DomainEvents } from '../../../../shared/constants/events';
import { IUserRepository } from '../../domain/interfaces/user.interfaces';
import {
  IEventBus,
  IFeedCacheRepository,
  IPostRepository,
  IUserFollowRepository
} from '../../../post/domain/interfaces/post.interfaces';

export type FollowUserInput = {
  followerId: string;
  followingId: string;
  warmupLimit: number;
};

export class FollowUserUseCase {
  public constructor(
    private readonly userRepository: IUserRepository,
    private readonly followRepository: IUserFollowRepository,
    private readonly postRepository: IPostRepository,
    private readonly feedCacheRepository: IFeedCacheRepository,
    private readonly eventBus: IEventBus
  ) {}

  public async execute(input: FollowUserInput): Promise<void> {
    if (input.followerId === input.followingId) {
      throw new Error('Users cannot follow themselves');
    }

    const [followerExists, followingExists] = await Promise.all([
      this.userRepository.exists(input.followerId),
      this.userRepository.exists(input.followingId)
    ]);
    if (!followerExists || !followingExists) {
      throw new Error('User not found');
    }

    const created = await this.followRepository.follow(input.followerId, input.followingId);
    if (!created) {
      return;
    }

    const recentPosts = await this.postRepository.findRecentByAuthorIds(
      [input.followingId],
      input.warmupLimit
    );

    await this.feedCacheRepository.appendFeed(
      input.followerId,
      recentPosts.map((post) => post.id)
    );

    await this.eventBus.publish({
      name: DomainEvents.UserFollowed,
      payload: {
        followerId: input.followerId,
        followingId: input.followingId
      }
    });
  }
}
