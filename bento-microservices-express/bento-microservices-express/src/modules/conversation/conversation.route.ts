import { Router } from 'express';
import { container } from 'tsyringe';
import { ConversationController } from './conversation.controller';

const router = Router();
const conversationController = container.resolve(ConversationController);

router.post('/initiate', async (req, res, next) => {
  try {
    await conversationController.initiateConversation(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
