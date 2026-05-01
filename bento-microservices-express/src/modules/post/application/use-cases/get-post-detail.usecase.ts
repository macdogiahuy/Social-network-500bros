import { PostProps } from '../../domain/entities/post.entity';
import { IPostRepository } from '../../domain/interfaces/post.interfaces';

export class GetPostDetailUseCase {
  public constructor(private readonly postRepository: IPostRepository) {}

  public async execute(input: { id: string }): Promise<PostProps | null> {
    return this.postRepository.findById(input.id);
  }
}
