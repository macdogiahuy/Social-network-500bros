import { Router } from 'express';
import { container } from 'tsyringe';
import { FollowingController } from './following.controller';

const router = Router();
const followingController = container.resolve(FollowingController);

router.post('/:userId/follow', async (req, res, next) => {
  try {
    await followingController.followUser(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/:userId/unfollow', async (req, res, next) => {
  try {
    await followingController.unfollowUser(req, res);
  } catch (error) {
    next(error);
  }
});

// Add your following routes here
// Example:
// router.post('/:userId/follow', (req, res) => followingController.followUser(req, res));

export default router;
