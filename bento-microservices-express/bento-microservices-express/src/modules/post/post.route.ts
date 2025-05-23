import { config } from '@shared/components/config';
import { authMiddleware } from '@shared/middleware/auth';
import { TokenIntrospectRPCClient } from '@shared/rpc/verify-token';
import { Router } from 'express';
import { container } from 'tsyringe';
import { PostController } from './post.controller';

const router = Router();
const postController = container.resolve(PostController);
const tokenIntrospector = new TokenIntrospectRPCClient(config.rpc.introspectUrl);

// Apply auth middleware to all post routes
router.use(authMiddleware(tokenIntrospector));

router.post('/', async (req, res, next) => {
  try {
    await postController.createPost(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    await postController.getPosts(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
