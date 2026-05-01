import { NotificationEntity } from '../../domain/entities/notification.entity';
import {
  INotificationRepository,
  NotificationTemplate
} from '../../domain/interfaces/notification.interfaces';

export type CreateNotificationInput = {
  receiverId: string;
  actorId: string;
  content: string;
} & NotificationTemplate;

export class CreateNotificationUseCase {
  public constructor(private readonly notificationRepository: INotificationRepository) {}

  public async execute(input: CreateNotificationInput): Promise<void> {
    if (input.receiverId === input.actorId) {
      return;
    }

    const notification = NotificationEntity.create(input).toObject();
    await this.notificationRepository.create(notification);
  }
}
