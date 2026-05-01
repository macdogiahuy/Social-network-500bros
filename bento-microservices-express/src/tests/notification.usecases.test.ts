import test from 'node:test';
import assert from 'node:assert/strict';
import { CreateNotificationUseCase } from '../modules/notification/application/use-cases/create-notification.usecase';
import { ListNotificationsUseCase } from '../modules/notification/application/use-cases/list-notifications.usecase';
import { MarkNotificationReadUseCase } from '../modules/notification/application/use-cases/mark-notification-read.usecase';
import {
  INotificationRepository,
  NotificationTemplate
} from '../modules/notification/domain/interfaces/notification.interfaces';
import { NotificationProps } from '../modules/notification/domain/entities/notification.entity';

class InMemoryNotificationRepository implements INotificationRepository {
  public notifications: NotificationProps[] = [];
  public lastListLimit = 0;

  public async create(notification: NotificationProps): Promise<void> {
    this.notifications.push(notification);
  }

  public async listByReceiver(receiverId: string, limit: number): Promise<NotificationProps[]> {
    this.lastListLimit = limit;
    return this.notifications.filter((item) => item.receiverId === receiverId).slice(0, limit);
  }

  public async markAsRead(id: string, receiverId: string): Promise<boolean> {
    const found = this.notifications.find((item) => item.id === id && item.receiverId === receiverId);
    if (!found || found.isRead) {
      return false;
    }
    found.isRead = true;
    return true;
  }

  public async markAllAsRead(receiverId: string): Promise<number> {
    let updated = 0;
    this.notifications.forEach((item) => {
      if (item.receiverId === receiverId && !item.isRead) {
        item.isRead = true;
        updated += 1;
      }
    });
    return updated;
  }
}

const template: NotificationTemplate = {
  action: 'followed',
  content: 'started following you'
};

test('create notification skips self-notification', async () => {
  const repository = new InMemoryNotificationRepository();
  const useCase = new CreateNotificationUseCase(repository);

  await useCase.execute({
    receiverId: 'u1',
    actorId: 'u1',
    ...template
  });

  assert.equal(repository.notifications.length, 0);
});

test('list notifications clamps limit to upper bound', async () => {
  const repository = new InMemoryNotificationRepository();
  const create = new CreateNotificationUseCase(repository);
  const list = new ListNotificationsUseCase(repository);

  await create.execute({
    receiverId: 'u1',
    actorId: 'u2',
    action: 'liked',
    content: 'liked your post'
  });

  const result = await list.execute({ receiverId: 'u1', limit: 9999 });
  assert.equal(repository.lastListLimit, 100);
  assert.equal(result.length, 1);
});

test('mark notification read delegates to repository', async () => {
  const repository = new InMemoryNotificationRepository();
  const create = new CreateNotificationUseCase(repository);
  const mark = new MarkNotificationReadUseCase(repository);

  await create.execute({
    receiverId: 'u1',
    actorId: 'u2',
    action: 'replied',
    content: 'commented on your post'
  });

  const created = repository.notifications[0];
  assert.ok(created);

  const updated = await mark.execute({
    id: created.id,
    receiverId: 'u1'
  });

  assert.equal(updated, true);
  assert.equal(repository.notifications[0]?.isRead, true);
});
