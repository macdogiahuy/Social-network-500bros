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
router.get('/', async (req: Request, res: Response) => {
  try {
    await conversationController.getConversations(req, res);
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/initiate', async (req: Request, res: Response) => {
  try {
    await conversationController.initiateConversation(req, res);
  } catch (error) {
    console.error('Error initiating conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:conversationId/messages', async (req: Request, res: Response) => {
  try {
    await conversationController.getMessages(req, res);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:conversationId/messages', async (req: Request, res: Response) => {
  try {
    await conversationController.sendMessage(req, res);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
