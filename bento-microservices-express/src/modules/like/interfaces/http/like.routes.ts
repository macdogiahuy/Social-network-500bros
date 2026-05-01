import { Router } from 'express';
import { LikeController } from './like.controller';

export const buildLikeRouter = (controller: LikeController): Router => {
  const router = Router();
  router.post('/posts/:postId/likes', controller.likePost);
  return router;
};
