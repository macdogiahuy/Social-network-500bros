import { Request, Response } from 'express';
import { ListNotificationsUseCase } from '../../application/use-cases/list-notifications.usecase';
import { MarkNotificationReadUseCase } from '../../application/use-cases/mark-notification-read.usecase';
import { MarkAllNotificationsReadUseCase } from '../../application/use-cases/mark-all-notifications-read.usecase';
import { AuthenticatedRequest } from '../../../../infrastructure/http/auth.middleware';
import { fail, ok } from '../../../../infrastructure/http/response';

export class NotificationController {
  public constructor(
    private readonly listNotificationsUseCase: ListNotificationsUseCase,
    private readonly markNotificationReadUseCase: MarkNotificationReadUseCase,
    private readonly markAllNotificationsReadUseCase: MarkAllNotificationsReadUseCase
  ) {}

  public list = async (req: Request, res: Response): Promise<void> => {
    const receiverId = (req as AuthenticatedRequest).authUser?.id;
    if (!receiverId) {
      fail(res, 401, { code: 'UNAUTHORIZED', message: 'Unauthorized' });
      return;
    }

    const limit = Number(req.query.limit ?? 20);
    const data = await this.listNotificationsUseCase.execute({
      receiverId,
      limit: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : 20
    });

    ok(res, data);
  };

  public markRead = async (req: Request, res: Response): Promise<void> => {
    const receiverId = (req as AuthenticatedRequest).authUser?.id;
    const id = req.params.id;
    if (!receiverId || !id) {
      fail(res, 401, { code: 'UNAUTHORIZED', message: 'Unauthorized' });
      return;
    }

    const updated = await this.markNotificationReadUseCase.execute({ id, receiverId });
    ok(res, { updated });
  };

  public markAllRead = async (req: Request, res: Response): Promise<void> => {
    const receiverId = (req as AuthenticatedRequest).authUser?.id;
    if (!receiverId) {
      fail(res, 401, { code: 'UNAUTHORIZED', message: 'Unauthorized' });
      return;
    }

    const updated = await this.markAllNotificationsReadUseCase.execute({ receiverId });
    ok(res, { updated });
  };
}
