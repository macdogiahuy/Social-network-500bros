import { IBookmarkRepository } from '../../domain/interfaces/bookmark.interfaces';

export class SavePostUseCase {
  public constructor(private readonly bookmarkRepository: IBookmarkRepository) {}

  public async execute(input: { userId: string; postId: string }): Promise<boolean> {
    return this.bookmarkRepository.savePost(input.userId, input.postId);
  }
}
