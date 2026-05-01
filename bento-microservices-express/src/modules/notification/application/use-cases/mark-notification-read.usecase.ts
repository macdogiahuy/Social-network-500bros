import { INotificationRepository } from '../../domain/interfaces/notification.interfaces';

export class MarkNotificationReadUseCase {
  public constructor(private readonly notificationRepository: INotificationRepository) {}

  public async execute(input: { id: string; receiverId: string }): Promise<boolean> {
    return this.notificationRepository.markAsRead(input.id, input.receiverId);
  }
}
