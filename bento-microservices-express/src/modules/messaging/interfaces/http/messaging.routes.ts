import { Router } from 'express';
import { MessagingController } from './messaging.controller';

export const buildMessagingRouter = (controller: MessagingController): Router => {
  const router = Router();
  router.get('/conversations', controller.listConversations);
  router.post('/messages', controller.sendMessage);
  router.patch('/messages/reactions', controller.reactMessage);
  router.delete('/messages/:messageId', controller.deleteMessage);
  router.delete('/conversations/:roomId', controller.deleteRoom);
  return router;
};
