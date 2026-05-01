import { DomainEvents } from '../../../../shared/constants/events';
import { PostEntity } from '../../domain/entities/post.entity';
import { PostCreatedEvent } from '../../domain/events/post-created.event';
import { IEventBus, IPostRepository } from '../../domain/interfaces/post.interfaces';

export type CreatePostInput = {
  authorId: string;
  topicId: string;
  content: string;
  imageUrl?: string | null;
};

export class CreatePostUseCase {
  public constructor(
    private readonly postRepository: IPostRepository,
    private readonly eventBus: IEventBus
  ) {}

  public async execute(input: CreatePostInput): Promise<string> {
    const post = PostEntity.create(input).toObject();
    await this.postRepository.create(post);

    const event: PostCreatedEvent = {
      name: DomainEvents.PostCreated,
      payload: {
        postId: post.id,
        authorId: post.authorId,
        topicId: post.topicId,
        createdAt: post.createdAt.toISOString()
      }
    };
    await this.eventBus.publish(event);

    return post.id;
  }
}
