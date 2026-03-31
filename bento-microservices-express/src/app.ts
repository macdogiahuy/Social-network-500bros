import 'compression';
import cors from 'cors';
import express, { Application, json, NextFunction, Request, Response, urlencoded } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

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

  const uploadsPath = path.join(__dirname, '../uploads');
  app.use('/uploads', express.static(uploadsPath));

  app.use('/ping', (_: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      message: 'pong'
    });
  });

  return app;
}

export default buildApp();
