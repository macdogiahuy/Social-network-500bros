import { INotificationRepository } from '../../domain/interfaces/notification.interfaces';

export class MarkAllNotificationsReadUseCase {
  public constructor(private readonly notificationRepository: INotificationRepository) {}

  public async execute(input: { receiverId: string }): Promise<number> {
    return this.notificationRepository.markAllAsRead(input.receiverId);
  }
}
