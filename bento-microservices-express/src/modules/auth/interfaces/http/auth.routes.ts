import { Router } from 'express';
import { AuthController } from './auth.controller';

export const buildAuthRouter = (controller: AuthController): Router => {
  const router = Router();
  router.post('/auth/register', controller.register);
  router.post('/auth/login', controller.login);
  router.post('/auth/oauth', controller.oauthLogin);
  router.get('/auth/introspect', controller.introspect);
  return router;
};
