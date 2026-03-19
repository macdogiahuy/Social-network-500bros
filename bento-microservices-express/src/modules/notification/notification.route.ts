import { Router } from 'express';
import { container } from 'tsyringe';
import { NotificationController } from './notification.controller';

const router = Router();
const notificationController = container.resolve(NotificationController);

router.get('/', async (req, res, next) => {
  try {
    await notificationController.getNotifications(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/read', async (req, res, next) => {
  try {
    await notificationController.markAsRead(req, res);
  } catch (error) {
    next(error);
  }
});

// Add your notification routes here
// Example:
// router.get('/', (req, res) => notificationController.getNotifications(req, res));

export default router;
