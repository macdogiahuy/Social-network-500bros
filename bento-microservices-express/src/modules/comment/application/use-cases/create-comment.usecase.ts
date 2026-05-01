import { DomainEvents } from '../../../../shared/constants/events';
import { IEventBus } from '../../../post/domain/interfaces/post.interfaces';
import { CommentEntity } from '../../domain/entities/comment.entity';
import { ICommentRepository } from '../../domain/interfaces/comment.interfaces';

export class CreateCommentUseCase {
  public constructor(
    private readonly commentRepository: ICommentRepository,
    private readonly eventBus: IEventBus
  ) {}

  public async execute(input: {
    content: string;
    userId: string;
    postId: string;
    parentId?: string | null;
  }): Promise<string> {
    const authorId = await this.commentRepository.findPostAuthorId(input.postId);
    if (!authorId) {
      throw new Error('Post not found');
    }

    const comment = CommentEntity.create(input).toObject();
    await this.commentRepository.create(comment);

    await this.eventBus.publish({
      name: DomainEvents.CommentCreated,
      payload: {
        commentId: comment.id,
        postId: comment.postId,
        actorId: comment.userId,
        authorId
      }
    });

    return comment.id;
  }
}
