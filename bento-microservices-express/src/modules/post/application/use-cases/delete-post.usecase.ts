import { IPostRepository } from '../../domain/interfaces/post.interfaces';

export class DeletePostUseCase {
  public constructor(private readonly postRepository: IPostRepository) {}

  public async execute(input: {
    id: string;
    authorId: string;
    role: 'user' | 'admin';
  }): Promise<boolean> {
    if (input.role === 'admin') {
      return this.postRepository.deleteById(input.id);
    }
    return this.postRepository.deleteByAuthor(input.id, input.authorId);
  }
}
