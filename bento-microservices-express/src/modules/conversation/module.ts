import { ServiceContext } from '@shared/interface';
import { Router } from 'express';
import conversationRoutes from './conversation.route';

export function setupConversationModule(ctx: ServiceContext): Router {
  const router = Router();
  router.use('/conversations', ctx.mdlFactory.auth, conversationRoutes);
  return router;
}
