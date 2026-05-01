import { CommentProps } from '../../domain/entities/comment.entity';
import { ICommentRepository } from '../../domain/interfaces/comment.interfaces';

export class ListCommentsUseCase {
  public constructor(private readonly commentRepository: ICommentRepository) {}

  public async execute(input: { postId: string; limit: number }): Promise<CommentProps[]> {
    return this.commentRepository.listByPost(input.postId, input.limit);
  }
}
