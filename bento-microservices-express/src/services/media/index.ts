import 'module-alias/register';
import 'reflect-metadata';

import cors from 'cors';
import express, { json, urlencoded } from 'express';
import helmet from 'helmet';
import { createServer } from 'http';

import { config } from '@shared/components/config';
import { setupMediaModule } from '@modules/media/module';
import Logger from '@shared/utils/logger';

const SERVICE_NAME = 'media-service';
const PORT = parseInt(process.env.MEDIA_SERVICE_PORT || '3005');

async function boot() {
  Logger.info(`[${SERVICE_NAME}] Starting on port ${PORT}...`);

  const app = express();
  app.use(urlencoded({ extended: true }));
  app.use(json());
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(cors({ origin: '*' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: SERVICE_NAME, uptime: process.uptime() });
  });

  const mediaModule = setupMediaModule();
  app.use('/v1', mediaModule);

  const server = createServer(app);
  server.listen(PORT, config.host, () => {
    Logger.success(`[${SERVICE_NAME}] Running on ${config.host}:${PORT}`);
  });
}

boot().catch((e) => {
  Logger.error(`[${SERVICE_NAME}] Failed to start: ${(e as Error).message}`);
  process.exit(1);
});
