import 'module-alias/register';
import 'reflect-metadata';

import cors from 'cors';
import express, { json, NextFunction, Request, Response, urlencoded } from 'express';
import helmet from 'helmet';
import { createServer } from 'http';

import { config } from '@shared/components/config';
import prisma from '@shared/components/prisma';
import { RedisClient } from '@shared/components/redis-pubsub/redis';
import { RedisCache } from '@shared/components/redis-cache';
import { TokenIntrospectRPCClient } from '@shared/rpc/verify-token';
import { setupMiddlewares } from '@shared/middleware/index';
import { setupNotificationConsumer, setupNotificationModule } from '@modules/notification/module';
import { responseErr } from '@shared/utils/error';
import Logger from '@shared/utils/logger';

const SERVICE_NAME = 'notification-service';
const PORT = parseInt(process.env.NOTIFICATION_SERVICE_PORT || '3004');

async function boot() {
  Logger.info(`[${SERVICE_NAME}] Starting on port ${PORT}...`);

  const introspector = new TokenIntrospectRPCClient(config.rpc.introspectUrl);
  const mdlFactory = setupMiddlewares(introspector);

  const connectionUrl = config.redis.url as string;
  await RedisClient.init(connectionUrl);
  await RedisCache.init(connectionUrl);

  await prisma.$connect();
  Logger.success(`[${SERVICE_NAME}] Prisma connected`);

  const app = express();
  app.use(urlencoded({ extended: true }));
  app.use(json());
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(cors({ origin: '*' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: SERVICE_NAME, uptime: process.uptime() });
  });

  const serviceCtx = { mdlFactory, eventPublisher: RedisClient.getInstance() };
  const notificationModule = setupNotificationModule(serviceCtx);
  app.use('/v1', notificationModule);

  setupNotificationConsumer(serviceCtx);

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    responseErr(err, res);
  });

  const server = createServer(app);
  server.listen(PORT, config.host, () => {
    Logger.success(`[${SERVICE_NAME}] Running on ${config.host}:${PORT}`);
  });
}

boot().catch((e) => {
  Logger.error(`[${SERVICE_NAME}] Failed to start: ${(e as Error).message}`);
  process.exit(1);
});
