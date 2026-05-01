import {
  IFeedCacheRepository,
  IPostRepository,
  IUserFollowRepository
} from '../../domain/interfaces/post.interfaces';
import { PostProps } from '../../domain/entities/post.entity';

export type GetFeedInput = {
  userId: string;
  limit: number;
};

export class GetFeedUseCase {
  public constructor(
    private readonly postRepository: IPostRepository,
    private readonly followRepository: IUserFollowRepository,
    private readonly feedCacheRepository: IFeedCacheRepository
  ) {}

  public async execute(input: GetFeedInput): Promise<PostProps[]> {
    const cachedIds = await this.feedCacheRepository.getFeed(input.userId, input.limit);
    if (cachedIds.length > 0) {
      return this.postRepository.findByIds(cachedIds);
    }

    const followingIds = await this.followRepository.getFollowingIds(input.userId);
    const authorIds = Array.from(new Set([input.userId, ...followingIds]));
    const posts = await this.postRepository.findRecentByAuthorIds(authorIds, input.limit);

    await this.feedCacheRepository.appendFeed(
      input.userId,
      posts.map((post) => post.id)
    );

    return posts;
  }
}
