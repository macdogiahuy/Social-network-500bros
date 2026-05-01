import 'module-alias/register';
import 'reflect-metadata';

import { setupMediaModule } from '@modules/media/module';
import { config } from '@shared/components/config';
import prisma from '@shared/components/prisma';
import { RedisClient } from '@shared/components/redis-pubsub/redis';
import { RedisCache } from '@shared/components/redis-cache';
import { SocketService } from '@shared/components/socket/socket.service';
import { responseErr } from '@shared/utils/error';
import Logger from '@shared/utils/logger';
import { NextFunction, Request, Response, static as serveStatic } from 'express';
import { createServer } from 'http';
import path from 'path';
import app from './app';
import migrationRoute from '@modules/migration/migration.route';

async function bootServer(port: number) {
  Logger.info(`Starting server in ${config.envName} mode...`);

  try {
    const connectionUrl = config.redis.url as string;
    await RedisClient.init(connectionUrl);
    await RedisCache.init(connectionUrl);

    await prisma.$connect();
    Logger.success('Prisma connected to database');

    const mediaModule = setupMediaModule();

    app.use('/v1', mediaModule);

    app.use('/uploads', serveStatic(path.join(__dirname, '../uploads')));
    app.use('/v1', migrationRoute);

    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      responseErr(err, res);
    });

    const server = createServer(app);

    // Init socket
    SocketService.getInstance().init(server);

    server.listen(port, config.host, () => {
      Logger.success(`Server is running on ${config.host}:${port}`);
    });
  } catch (e) {
    Logger.error(`Failed to start server: ${(e as Error).message}`);
    process.exit(1);
  }
}

const port = parseInt(config.port);
bootServer(port);
