import { Router } from 'express';
import { PostController } from './post.controller';

export const buildPostRouter = (controller: PostController): Router => {
  const router = Router();
  router.post('/posts', controller.create);
  router.patch('/posts/:postId', controller.update);
  router.delete('/posts/:postId', controller.delete);
  router.get('/posts/:postId', controller.getDetail);
  router.get('/explore/posts', controller.explore);
  router.get('/feed', controller.getFeed);
  return router;
};
