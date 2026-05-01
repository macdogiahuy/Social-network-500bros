import { PrismaClient } from '@prisma/client';
import {
  NotificationAction,
  NotificationEntity,
  NotificationProps
} from '../../domain/entities/notification.entity';
import { INotificationRepository } from '../../domain/interfaces/notification.interfaces';

export class PrismaNotificationRepository implements INotificationRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async create(notification: NotificationProps): Promise<void> {
    await this.prisma.notifications.create({
      data: {
        id: notification.id,
        receiverId: notification.receiverId,
        actorId: notification.actorId,
        content: notification.content,
        action: notification.action,
        isRead: notification.isRead,
        isSent: notification.isSent,
        createdAt: notification.createdAt
      }
    });
  }

  public async listByReceiver(receiverId: string, limit: number): Promise<NotificationProps[]> {
    const rows = await this.prisma.notifications.findMany({
      where: { receiverId },
      orderBy: { createdAt: 'desc' },
      take: Math.max(1, limit)
    });

    return rows.map((row) =>
      NotificationEntity.rehydrate({
        id: row.id,
        receiverId: row.receiverId,
        actorId: row.actorId ?? 'system',
        content: row.content ?? '',
        action: this.toAction(row.action),
        isRead: row.isRead ?? false,
        isSent: row.isSent ?? false,
        createdAt: row.createdAt
      }).toObject()
    );
  }

  public async markAsRead(id: string, receiverId: string): Promise<boolean> {
    const result = await this.prisma.notifications.updateMany({
      where: { id, receiverId, isRead: false },
      data: { isRead: true }
    });
    return result.count > 0;
  }

  public async markAllAsRead(receiverId: string): Promise<number> {
    const result = await this.prisma.notifications.updateMany({
      where: { receiverId, isRead: false },
      data: { isRead: true }
    });
    return result.count;
  }

  private toAction(value: string | null): NotificationAction {
    if (value === 'followed' || value === 'liked' || value === 'replied') {
      return value;
    }
    return 'followed';
  }
}
