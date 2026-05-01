import { Router } from 'express';
import { CommentController } from './comment.controller';

export const buildCommentRouter = (controller: CommentController): Router => {
  const router = Router();
  router.post('/posts/:postId/comments', controller.create);
  router.get('/posts/:postId/comments', controller.listByPost);
  router.patch('/comments/:commentId', controller.update);
  router.delete('/comments/:commentId', controller.delete);
  return router;
};
