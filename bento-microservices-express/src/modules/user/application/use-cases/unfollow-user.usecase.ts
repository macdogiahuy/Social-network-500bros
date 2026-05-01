import { IUserFollowRepository } from '../../../post/domain/interfaces/post.interfaces';

export class UnfollowUserUseCase {
  public constructor(private readonly followRepository: IUserFollowRepository) {}

  public async execute(input: { followerId: string; followingId: string }): Promise<boolean> {
    if (input.followerId === input.followingId) {
      throw new Error('Users cannot unfollow themselves');
    }
    return this.followRepository.unfollow(input.followerId, input.followingId);
  }
}
