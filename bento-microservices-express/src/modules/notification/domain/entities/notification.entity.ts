import { randomUUID } from 'crypto';

export type NotificationAction = 'followed' | 'liked' | 'replied';

export type NotificationProps = {
  id: string;
  receiverId: string;
  actorId: string;
  content: string;
  action: NotificationAction;
  isRead: boolean;
  isSent: boolean;
  createdAt: Date;
};

export class NotificationEntity {
  private constructor(private readonly props: NotificationProps) {}

  public static rehydrate(props: NotificationProps): NotificationEntity {
    return new NotificationEntity(props);
  }

  public static create(input: {
    receiverId: string;
    actorId: string;
    content: string;
    action: NotificationAction;
  }): NotificationEntity {
    const receiverId = input.receiverId.trim();
    const actorId = input.actorId.trim();
    const content = input.content.trim();
    if (!receiverId) {
      throw new Error('Notification receiverId must not be empty');
    }
    if (!actorId) {
      throw new Error('Notification actorId must not be empty');
    }
    if (!content) {
      throw new Error('Notification content must not be empty');
    }

    return new NotificationEntity({
      id: randomUUID(),
      receiverId,
      actorId,
      content,
      action: input.action,
      isRead: false,
      isSent: false,
      createdAt: new Date()
    });
  }

  public toObject(): NotificationProps {
    return { ...this.props };
  }
}
