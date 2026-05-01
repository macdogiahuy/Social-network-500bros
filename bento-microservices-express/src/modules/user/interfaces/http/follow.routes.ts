import { Router } from 'express';
import { FollowController } from './follow.controller';

export const buildFollowRouter = (controller: FollowController): Router => {
  const router = Router();
  router.post('/users/:userId/follow', controller.follow);
  router.post('/users/:userId/unfollow', controller.unfollow);
  return router;
};
