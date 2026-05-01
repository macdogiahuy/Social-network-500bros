import { IPostRepository } from '../../domain/interfaces/post.interfaces';

export class UpdatePostUseCase {
  public constructor(private readonly postRepository: IPostRepository) {}

  public async execute(input: {
    id: string;
    authorId: string;
    role: 'user' | 'admin';
    content?: string;
    imageUrl?: string | null;
  }): Promise<boolean> {
    if (!input.content && input.imageUrl === undefined) {
      throw new Error('At least one field to update is required');
    }

    const content = input.content?.trim();
    if (content !== undefined && content.length === 0) {
      throw new Error('Post content must not be empty');
    }

    if (input.role === 'admin') {
      return this.postRepository.updateById(input.id, {
        content,
        imageUrl: input.imageUrl
      });
    }

    return this.postRepository.updateByAuthor(input.id, input.authorId, {
      content,
      imageUrl: input.imageUrl
    });
  }
}
