import { Router } from 'express';
import { container } from 'tsyringe';
import { UserController } from './user.controller';

const router = Router();
const userController = container.resolve(UserController);

router.get('/profile', async (req, res, next) => {
  try {
    await userController.getProfile(req, res);
  } catch (error) {
    next(error);
  }
});

router.put('/profile', async (req, res, next) => {
  try {
    await userController.updateProfile(req, res);
  } catch (error) {
    next(error);
  }
});

// Add your user routes here
// Example:
// router.get('/profile', (req, res) => userController.getProfile(req, res));
// router.put('/profile', (req, res) => userController.updateProfile(req, res));

export default router;
