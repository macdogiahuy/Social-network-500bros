import { IBookmarkRepository } from '../../domain/interfaces/bookmark.interfaces';

export class UnsavePostUseCase {
  public constructor(private readonly bookmarkRepository: IBookmarkRepository) {}

  public async execute(input: { userId: string; postId: string }): Promise<boolean> {
    return this.bookmarkRepository.unsavePost(input.userId, input.postId);
  }
}
