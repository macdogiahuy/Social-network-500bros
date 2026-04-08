import { ConversationUseCase } from '@modules/conversation/usecase/conversation.usecase';
import { upload } from '@shared/services/file-upload.service';
import { pickParam } from '@shared/utils/request';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { MdlFactory } from '@shared/interface';

export class ConversationHttpService {
  constructor(private readonly useCase: ConversationUseCase) {}

  getRoutes(mdlFactory: MdlFactory): Router {
    const router = Router();
    const auth = mdlFactory.auth;

    router.get('/conversations', auth, this.getConversationsAPI.bind(this) as any);
    router.post('/conversations/initiate', auth, upload.single('file'), this.initiateConversationAPI.bind(this) as any);
    router.get('/conversations/:roomId/messages', auth, this.getMessagesAPI.bind(this) as any);
    router.post('/conversations/:roomId/messages', auth, upload.single('file'), this.sendMessageAPI.bind(this) as any);
    router.post('/conversations/:roomId/messages/:messageId/reactions', auth, this.reactToMessageAPI.bind(this) as any);
    router.delete('/conversations/:roomId/messages/:messageId', auth, this.deleteMessageAPI.bind(this) as any);
    router.delete('/conversations/:roomId', auth, this.deleteConversationAPI.bind(this) as any);

    return router;
  }

  private async getConversationsAPI(req: Request, res: Response) {
    const userId = res.locals.requester?.sub;
    if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });

    const data = await this.useCase.getConversations(userId);
    return res.status(StatusCodes.OK).json({ data });
  }

  private async initiateConversationAPI(req: Request, res: Response) {
    const userId = res.locals.requester?.sub;
    if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });

    const { receiverId, userIds, name } = req.body;
    const file = req.file;

    if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      const room = await this.useCase.initiateGroupConversation(userId, userIds, name || 'New Group', file);
      return res.status(StatusCodes.CREATED).json({ data: room });
    }

    if (!receiverId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Receiver ID is required' });
    }

    const { room, isNew } = await this.useCase.initiateDirectConversation(userId, receiverId);
    return res.status(isNew ? StatusCodes.CREATED : StatusCodes.OK).json({ data: room });
  }

  private async getMessagesAPI(req: Request, res: Response) {
    const userId = res.locals.requester?.sub;
    if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });

    const roomId = pickParam(req.params.roomId);
    const data = await this.useCase.getMessages(userId, roomId);
    return res.status(StatusCodes.OK).json({ data });
  }

  private async sendMessageAPI(req: Request, res: Response) {
    const userId = res.locals.requester?.sub;
    if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });

    const roomId = pickParam(req.params.roomId);
    const { content } = req.body;
    const file = req.file;

    if (!content?.trim() && !file) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Message content or file is required' });
    }

    const data = await this.useCase.sendMessage(userId, roomId, content, file);
    return res.status(StatusCodes.CREATED).json({ data });
  }

  private async deleteConversationAPI(req: Request, res: Response) {
    const userId = res.locals.requester?.sub;
    if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });

    const roomId = pickParam(req.params.roomId);
    await this.useCase.deleteConversation(userId, roomId);
    return res.status(StatusCodes.OK).json({ message: 'Conversation deleted successfully' });
  }

  private async deleteMessageAPI(req: Request, res: Response) {
    const userId = res.locals.requester?.sub;
    if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });

    const roomId = pickParam(req.params.roomId);
    const messageId = pickParam(req.params.messageId);
    await this.useCase.deleteMessage(userId, roomId, messageId);
    return res.status(StatusCodes.OK).json({ message: 'Message deleted successfully', data: { id: messageId } });
  }

  private async reactToMessageAPI(req: Request, res: Response) {
    const userId = res.locals.requester?.sub;
    if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });

    const roomId = pickParam(req.params.roomId);
    const messageId = pickParam(req.params.messageId);
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Emoji is required' });
    }

    const { action, result } = await this.useCase.reactToMessage(userId, roomId, messageId, emoji);
    return res.status(StatusCodes.OK).json(action === 'remove' ? result : { data: result });
  }
}
