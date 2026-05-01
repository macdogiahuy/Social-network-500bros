import { ICommentRepository } from '../../domain/interfaces/comment.interfaces';

export class DeleteCommentUseCase {
  public constructor(private readonly commentRepository: ICommentRepository) {}

  public async execute(input: {
    id: string;
    userId: string;
    role: 'user' | 'admin';
  }): Promise<boolean> {
    if (input.role === 'admin') {
      return this.commentRepository.deleteById(input.id);
    }
    return this.commentRepository.deleteByAuthor(input.id, input.userId);
  }
}
