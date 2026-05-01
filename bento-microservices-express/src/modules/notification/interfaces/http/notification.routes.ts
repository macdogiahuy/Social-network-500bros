import { Router } from 'express';
import { NotificationController } from './notification.controller';

export const buildNotificationRouter = (controller: NotificationController): Router => {
  const router = Router();
  router.get('/notifications', controller.list);
  router.patch('/notifications/:id/read', controller.markRead);
  router.patch('/notifications/read-all', controller.markAllRead);
  return router;
};
