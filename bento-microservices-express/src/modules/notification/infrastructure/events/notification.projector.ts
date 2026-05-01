import { DomainEvents } from '../../../../shared/constants/events';
import { CreateNotificationUseCase } from '../../application/use-cases/create-notification.usecase';
import { IEventBus } from '../../../post/domain/interfaces/post.interfaces';

type UserFollowedPayload = {
  followerId: string;
  followingId: string;
};

type PostLikedPayload = {
  postId: string;
  actorId: string;
  authorId: string;
};

type PostCreatedPayload = {
  postId: string;
  authorId: string;
  topicId: string;
  createdAt: string;
};

type CommentCreatedPayload = {
  commentId: string;
  postId: string;
  actorId: string;
  authorId: string;
};

export class NotificationProjector {
  public constructor(
    private readonly eventBus: IEventBus,
    private readonly createNotificationUseCase: CreateNotificationUseCase
  ) {}

  public register(): void {
    this.eventBus.subscribe<UserFollowedPayload>(DomainEvents.UserFollowed, async (event) => {
      await this.createNotificationUseCase.execute({
        receiverId: event.payload.followingId,
        actorId: event.payload.followerId,
        action: 'followed',
        content: 'started following you'
      });
    });

    this.eventBus.subscribe<PostLikedPayload>(DomainEvents.PostLiked, async (event) => {
      await this.createNotificationUseCase.execute({
        receiverId: event.payload.authorId,
        actorId: event.payload.actorId,
        action: 'liked',
        content: 'liked your post'
      });
    });

    this.eventBus.subscribe<PostCreatedPayload>(DomainEvents.PostCreated, async (event) => {
      await this.createNotificationUseCase.execute({
        receiverId: event.payload.authorId,
        actorId: 'system',
        action: 'replied',
        content: 'your post was published successfully'
      });
    });

    this.eventBus.subscribe<CommentCreatedPayload>(DomainEvents.CommentCreated, async (event) => {
      await this.createNotificationUseCase.execute({
        receiverId: event.payload.authorId,
        actorId: event.payload.actorId,
        action: 'replied',
        content: 'commented on your post'
      });
    });
  }
}
