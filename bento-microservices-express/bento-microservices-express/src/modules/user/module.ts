import { ServiceContext, UserRole } from '@shared/interface';
import { authRateLimiter } from '@shared/middleware/rate-limiter';
import { validateBody } from '@shared/middleware/validation';
import { Router } from 'express';

import { PrismaUserCommandRepository, PrismaUserQueryRepository, PrismaUserRepository } from './infras/repository';
import { PrismaResetTokenRepository } from './infras/repository/reset-token.repository';
import { EmailService } from './infras/services/email.service';
import { UserHTTPService } from './infras/transport';
import { PasswordResetHttpService } from './infras/transport/password-reset-http.service';
import { RedisUserConsumer } from './infras/transport/redis-consumer';
import { UserStatsHttpService } from './infras/transport/user-stats-http.service';
import { userLoginDTOSchema, userRegistrationDTOSchema } from './model';
import { requestResetDTOSchema, resetPasswordDTOSchema } from './model/reset-password';
import { UserUseCase } from './usecase';
import { PasswordResetUsecase } from './usecase/password-reset.usecase';
import { UserStatsUsecase } from './usecase/user-stats.usecase';

export const setupUserModule = (sctx: ServiceContext) => {
  const queryRepository = new PrismaUserQueryRepository();
  const commandRepository = new PrismaUserCommandRepository();

  const repository = new PrismaUserRepository(queryRepository, commandRepository);
  const useCase = new UserUseCase(repository);
  const httpService = new UserHTTPService(useCase);

  // Password reset setup
  const resetTokenRepo = new PrismaResetTokenRepository();
  const emailService = new EmailService();
  const passwordResetUsecase = new PasswordResetUsecase(resetTokenRepo, emailService, repository);
  const passwordResetHttpService = new PasswordResetHttpService(passwordResetUsecase);

  // User stats setup
  const userStatsUsecase = new UserStatsUsecase();
  const userStatsHttpService = new UserStatsHttpService(userStatsUsecase);

  const router = Router();
  const mdlFactory = sctx.mdlFactory;
  const adminChecker = mdlFactory.allowRoles([UserRole.ADMIN]);

  router.post(
    '/register',
    authRateLimiter,
    validateBody(userRegistrationDTOSchema),
    httpService.registerAPI.bind(httpService)
  );

  router.post(
    '/authenticate',
    authRateLimiter,
    validateBody(userLoginDTOSchema),
    httpService.loginAPI.bind(httpService)
  );

  router.get('/profile', httpService.profileAPI.bind(httpService));
  router.patch('/profile', httpService.updateProfileAPI.bind(httpService));

  // Password reset routes
  router.post(
    '/forgot-password',
    authRateLimiter,
    validateBody(requestResetDTOSchema),
    passwordResetHttpService.requestResetAPI.bind(passwordResetHttpService)
  );
  router.post(
    '/reset-password',
    authRateLimiter,
    validateBody(resetPasswordDTOSchema),
    passwordResetHttpService.resetPasswordAPI.bind(passwordResetHttpService)
  );

  // User stats route
  router.get('/users/:userId/stats', userStatsHttpService.getUserStatsAPI.bind(userStatsHttpService));

  router.post('/users', mdlFactory.auth, adminChecker, httpService.createAPI.bind(httpService));
  router.get('/users/:id', httpService.getDetailAPI.bind(httpService));
  router.get('/users', httpService.listAPI.bind(httpService));
  router.patch('/users/:id', mdlFactory.auth, adminChecker, httpService.updateAPI.bind(httpService));
  router.delete('/users/:id', mdlFactory.auth, adminChecker, httpService.deleteAPI.bind(httpService));

  // RPC API (use internally)
  router.post('/rpc/introspect', httpService.introspectAPI.bind(httpService));
  router.post('/rpc/users/list-by-ids', httpService.listByIdsAPI.bind(httpService));
  router.get('/rpc/users/:id', httpService.getByIdAPI.bind(httpService));
  return router;
};

export const setupUserConsumer = (sctx: ServiceContext) => {
  const commandRepository = new PrismaUserCommandRepository();
  const consumer = new RedisUserConsumer(commandRepository);
  consumer.subscribe();
};
