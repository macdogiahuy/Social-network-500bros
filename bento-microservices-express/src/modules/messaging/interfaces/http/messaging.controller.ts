import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../../infrastructure/http/auth.middleware';
import { fail, ok } from '../../../../infrastructure/http/response';
import { DeleteMessageUseCase } from '../../application/use-cases/delete-message.usecase';
import { DeleteRoomUseCase } from '../../application/use-cases/delete-room.usecase';
import { ListConversationsUseCase } from '../../application/use-cases/list-conversations.usecase';
import { ReactMessageUseCase } from '../../application/use-cases/react-message.usecase';
import { SendMessageUseCase } from '../../application/use-cases/send-message.usecase';
import { reactMessageSchema, sendMessageSchema } from './messaging.schemas';

export class MessagingController {
  public constructor(
    private readonly listConversationsUseCase: ListConversationsUseCase,
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly reactMessageUseCase: ReactMessageUseCase,
    private readonly deleteMessageUseCase: DeleteMessageUseCase,
    private readonly deleteRoomUseCase: DeleteRoomUseCase
  ) {}

  public listConversations = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthenticatedRequest).authUser?.id;
    if (!userId) {
      fail(res, 401, { code: 'UNAUTHORIZED', message: 'Unauthorized' });
      return;
    }

    const limit = Number(req.query.limit ?? 20);
    const data = await this.listConversationsUseCase.execute({
      userId,
      limit: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : 20
    });
    ok(res, data);
  };

  public sendMessage = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthenticatedRequest).authUser?.id;
    if (!userId) {
      fail(res, 401, { code: 'UNAUTHORIZED', message: 'Unauthorized' });
      return;
    }

    const parsed = sendMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      fail(res, 400, {
        code: 'VALIDATION_ERROR',
        message: parsed.error.issues[0]?.message ?? 'Invalid request body'
      });
      return;
    }

    const data = await this.sendMessageUseCase.execute({
      userId,
      roomId: parsed.data.roomId,
      content: parsed.data.content,
      fileUrl: parsed.data.fileUrl
    });
    ok(res, data, 201);
  };

  public reactMessage = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthenticatedRequest).authUser?.id;
    if (!userId) {
      fail(res, 401, { code: 'UNAUTHORIZED', message: 'Unauthorized' });
      return;
    }

    const parsed = reactMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      fail(res, 400, {
        code: 'VALIDATION_ERROR',
        message: parsed.error.issues[0]?.message ?? 'Invalid request body'
      });
      return;
    }

    const updated = await this.reactMessageUseCase.execute({
      userId,
      messageId: parsed.data.messageId,
      emoji: parsed.data.emoji
    });
    ok(res, { updated });
  };

  public deleteMessage = async (req: Request, res: Response): Promise<void> => {
    const auth = (req as AuthenticatedRequest).authUser;
    const messageId = req.params.messageId;
    if (!auth || !messageId) {
      fail(res, 401, { code: 'UNAUTHORIZED', message: 'Unauthorized' });
      return;
    }
    const deleted = await this.deleteMessageUseCase.execute({
      userId: auth.id,
      role: auth.role,
      messageId
    });
    if (!deleted) {
      fail(res, 403, { code: 'FORBIDDEN', message: 'Forbidden or message not found' });
      return;
    }
    ok(res, { deleted });
  };

  public deleteRoom = async (req: Request, res: Response): Promise<void> => {
    const auth = (req as AuthenticatedRequest).authUser;
    const roomId = req.params.roomId;
    if (!auth || !roomId) {
      fail(res, 401, { code: 'UNAUTHORIZED', message: 'Unauthorized' });
      return;
    }
    const deleted = await this.deleteRoomUseCase.execute({
      userId: auth.id,
      role: auth.role,
      roomId
    });
    if (!deleted) {
      fail(res, 403, { code: 'FORBIDDEN', message: 'Forbidden or room not found' });
      return;
    }
    ok(res, { deleted });
  };
}
