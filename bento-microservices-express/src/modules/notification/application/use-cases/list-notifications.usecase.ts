import { NotificationProps } from '../../domain/entities/notification.entity';
import { INotificationRepository } from '../../domain/interfaces/notification.interfaces';

export class ListNotificationsUseCase {
  public constructor(private readonly notificationRepository: INotificationRepository) {}

  public async execute(input: { receiverId: string; limit: number }): Promise<NotificationProps[]> {
    const normalizedLimit = Math.min(Math.max(1, Math.trunc(input.limit)), 100);
    return this.notificationRepository.listByReceiver(input.receiverId, normalizedLimit);
  }
}
