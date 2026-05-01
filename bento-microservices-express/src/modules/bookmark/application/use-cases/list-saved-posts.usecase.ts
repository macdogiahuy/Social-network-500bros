import { IPostRepository } from '../../../post/domain/interfaces/post.interfaces';
import { PostProps } from '../../../post/domain/entities/post.entity';
import { IBookmarkRepository } from '../../domain/interfaces/bookmark.interfaces';

export class ListSavedPostsUseCase {
  public constructor(
    private readonly bookmarkRepository: IBookmarkRepository,
    private readonly postRepository: IPostRepository
  ) {}

  public async execute(input: { userId: string; limit: number }): Promise<PostProps[]> {
    const ids = await this.bookmarkRepository.listSavedPostIds(input.userId, input.limit);
    return this.postRepository.findByIds(ids);
  }
}
