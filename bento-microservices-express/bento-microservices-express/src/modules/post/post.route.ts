import { Router } from 'express';
import { container } from 'tsyringe';
import { PostController } from './post.controller';

const router = Router();
const postController = container.resolve(PostController);

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
