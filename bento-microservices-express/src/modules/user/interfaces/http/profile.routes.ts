import { Router } from 'express';
import { ProfileController } from './profile.controller';

export const buildProfileRouter = (controller: ProfileController): Router => {
  const router = Router();
  router.get('/users/profile', controller.getProfile);
  router.patch('/users/profile', controller.updateProfile);
  return router;
};
