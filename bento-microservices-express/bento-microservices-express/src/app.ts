import 'compression';
import cors from 'cors';
import express, { Application, json, NextFunction, Request, Response, urlencoded } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import commentRoutes from '@modules/comment/comment.route';
import conversationRoutes from '@modules/conversation/conversation.route';
import followingRoutes from '@modules/following/following.route';
import postRoutes from '@modules/post/post.route';
import userRoutes from '@modules/user/user.route';

function buildApp(): Application {
  const app: Application = express();

  app.use(urlencoded({ extended: true }));
  app.use(json());
  app.use(helmet());
  app.use(cors({ origin: '*' }));
  app.set('trust proxy', 1);
  app.use(morgan('dev'));

  app.use('/ping', (_: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      message: 'pong'
    });
  });

  // Routes
  app.use('/v1/users', userRoutes);
  app.use('/v1/posts', postRoutes);
  app.use('/v1/comments', commentRoutes);
  app.use('/v1/following', followingRoutes);
  app.use('/v1/conversations', conversationRoutes);

  // Global error handler (phải đặt sau tất cả các route)
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Global error:', err);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
  });

  return app;
}

export default buildApp();
