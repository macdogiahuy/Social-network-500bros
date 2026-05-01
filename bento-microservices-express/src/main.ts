import cors from 'cors';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import { config } from './shared/components/config';
import prisma from './shared/components/prisma';
import { buildContainer } from './infrastructure/config/container';
import { errorMiddleware } from './infrastructure/http/error.middleware';
import { buildRateLimitMiddleware } from './infrastructure/http/rate-limit.middleware';
import { traceMiddleware } from './infrastructure/http/trace.middleware';
import { ok } from './infrastructure/http/response';

const boot = async (): Promise<void> => {
  const redisUrl = config.redis.url;
  if (!redisUrl) {
    throw new Error('REDIS_URL is required to run clean architecture entrypoint');
  }

  await prisma.$connect();
  const container = buildContainer({
    prisma,
    redisUrl
  });
  await container.feedCacheRepository.connect();

  const app = express();
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          mediaSrc: ["'self'", 'https:'],
          connectSrc: ["'self'", 'https:'],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"]
        }
      },
      hsts: config.envName === 'production',
      xContentTypeOptions: true
    })
  );
  app.use(
    cors({
      origin: config.corsAllowedOrigins
    })
  );
  app.use(express.json());
  app.use(traceMiddleware);

  app.get('/health', (_req: Request, res: Response) => {
    ok(res, { status: 'ok', architecture: 'clean-modular-monolith' });
  });

  const authRateLimit = buildRateLimitMiddleware({
    windowMs: 60 * 1000,
    maxRequests: 20
  });

  app.use('/v2/auth/register', authRateLimit);
  app.use('/v2/auth/login', authRateLimit);
  app.use('/v2/auth/oauth', authRateLimit);
  app.use('/v2', container.authRouter);
  app.use('/v2', container.authMiddleware, container.postRouter);
  app.use('/v2', container.authMiddleware, container.followRouter);
  app.use('/v2', container.authMiddleware, container.profileRouter);
  app.use('/v2', container.authMiddleware, container.notificationRouter);
  app.use('/v2', container.authMiddleware, container.likeRouter);
  app.use('/v2', container.authMiddleware, container.commentRouter);
  app.use('/v2', container.authMiddleware, container.messagingRouter);
  app.use('/v2', container.authMiddleware, container.bookmarkRouter);
  app.use('/v2', container.authMiddleware, container.mediaRouter);
  app.use(errorMiddleware);

  const port = Number(config.port ?? 3000);
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Clean architecture server listening on :${port}`);
  });
};

void boot();
