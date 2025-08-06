import { upload } from '@shared/services/file-upload.service';
import { Request, Response, Router } from 'express';
import { container } from 'tsyringe';
import { ConversationController } from './conversation.controller';

const router = Router();
const conversationController = container.resolve(ConversationController);

// Debug route to verify the endpoint is accessible
router.get('/test', (req: Request, res: Response) => {
  res.json({ message: 'Conversation routes are working' });
});

// Get all conversations for the current user
router.get('/', async (req: Request, res: Response, next: Function) => {
  try {
    await conversationController.getConversations(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/initiate', async (req: Request, res: Response, next: Function) => {
  try {
    await conversationController.initiateConversation(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/:conversationId/messages', async (req: Request, res: Response, next: Function) => {
  try {
    await conversationController.getMessages(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/:conversationId/messages', upload.single('file'), async (req: Request, res: Response, next: Function) => {
  try {
    await conversationController.sendMessage(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
