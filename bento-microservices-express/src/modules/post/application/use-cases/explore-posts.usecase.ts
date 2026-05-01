import { PostProps } from '../../domain/entities/post.entity';
import { IPostRepository } from '../../domain/interfaces/post.interfaces';

export class ExplorePostsUseCase {
  public constructor(private readonly postRepository: IPostRepository) {}

  public async execute(input: { keyword?: string; topicId?: string; limit: number }): Promise<PostProps[]> {
    return this.postRepository.search(input);
  }
}
