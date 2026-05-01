export const DomainEvents = {
  PostCreated: 'post.created',
  UserFollowed: 'user.followed',
  PostLiked: 'post.liked',
  CommentCreated: 'comment.created',
  MessageSent: 'message.sent'
} as const;

export type DomainEventName = (typeof DomainEvents)[keyof typeof DomainEvents];
