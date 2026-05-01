import { ICommentRepository } from '../../domain/interfaces/comment.interfaces';

export class UpdateCommentUseCase {
  public constructor(private readonly commentRepository: ICommentRepository) {}

  public async execute(input: {
    id: string;
    userId: string;
    role: 'user' | 'admin';
    content: string;
  }): Promise<boolean> {
    const content = input.content.trim();
    if (!content) {
      throw new Error('Comment content must not be empty');
    }
    if (input.role === 'admin') {
      return this.commentRepository.updateById(input.id, content);
    }
    return this.commentRepository.updateByAuthor(input.id, input.userId, content);
  }
}
