import { Router } from 'express';
import { uploadImageOnly } from '@shared/services/file-upload.service';
import { container } from 'tsyringe';
import { UserController } from './user.controller';

const router = Router();
const userController = container.resolve(UserController);

router.get('/users', async (req, res, next) => {
  try {
    await userController.getUsers(req, res);
  } catch (error) {
    next(error);
  }
});

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

router.post('/profile/avatar', uploadImageOnly.single('avatar'), async (req, res, next) => {
  try {
    await userController.updateAvatar(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
