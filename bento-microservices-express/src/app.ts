import 'compression';
import cors from 'cors';
import express, { Application, json, Request, Response, urlencoded } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

function buildApp(): Application {
  const app: Application = express();

  app.use(urlencoded({ extended: true }));
  app.use(json());
  app.use(
    helmet({
      crossOriginResourcePolicy: false
    })
  );
  app.use(cors({ origin: '*' }));
  app.set('trust proxy', 1);
  app.use(morgan('dev'));

  app.get('/ping', (_: Request, res: Response) => {
    res.status(200).json({ message: 'pong' });
  });

  app.get('/health', (_: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      service: 'api-gateway',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  return app;
}

export default buildApp();
