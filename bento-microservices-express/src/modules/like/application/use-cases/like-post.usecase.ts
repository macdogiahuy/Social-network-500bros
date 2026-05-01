import { DomainEvents } from '../../../../shared/constants/events';
import { IEventBus } from '../../../post/domain/interfaces/post.interfaces';
import { ILikeReadRepository, ILikeRepository } from '../../domain/interfaces/like.interfaces';

export class LikePostUseCase {
  public constructor(
    private readonly likeRepository: ILikeRepository,
    private readonly likeReadRepository: ILikeReadRepository,
    private readonly eventBus: IEventBus
  ) {}

  public async execute(input: { postId: string; userId: string }): Promise<void> {
    const authorId = await this.likeReadRepository.findPostAuthorId(input.postId);
    if (!authorId) {
      throw new Error('Post not found');
    }

    const created = await this.likeRepository.likePost(input.postId, input.userId);
    if (!created) {
      return;
    }

    await this.eventBus.publish({
      name: DomainEvents.PostLiked,
      payload: {
        postId: input.postId,
        actorId: input.userId,
        authorId
      }
    });
  }
}
