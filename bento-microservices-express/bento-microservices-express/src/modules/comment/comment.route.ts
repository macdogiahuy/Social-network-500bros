import { Router } from 'express';
import { container } from 'tsyringe';
import { CommentController } from './comment.controller';

const router = Router();
const commentController = container.resolve(CommentController);

router.post('/', async (req, res, next) => {
  try {
    await commentController.createComment(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    await commentController.getComments(req, res);
  } catch (error) {
    next(error);
  }
});

// Add your comment routes here
// Example:
// router.post('/', (req, res) => commentController.createComment(req, res));

export default router;
