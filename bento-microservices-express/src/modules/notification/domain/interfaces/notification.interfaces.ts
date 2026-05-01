import {
  NotificationAction,
  NotificationProps
} from '../entities/notification.entity';

export interface INotificationRepository {
  create(notification: NotificationProps): Promise<void>;
  listByReceiver(receiverId: string, limit: number): Promise<NotificationProps[]>;
  markAsRead(id: string, receiverId: string): Promise<boolean>;
  markAllAsRead(receiverId: string): Promise<number>;
}

export type NotificationTemplate = {
  action: NotificationAction;
  content: string;
};
