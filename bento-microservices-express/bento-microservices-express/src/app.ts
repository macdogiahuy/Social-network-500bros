import 'compression';
import cors from 'cors';
import express, { Application, json, NextFunction, Request, Response, urlencoded } from 'express';
import morgan from 'morgan';
import path from 'path';

import commentRoutes from '@modules/comment/comment.route';
import followingRoutes from '@modules/following/following.route';
import userRoutes from '@modules/user/user.route';
import { sensitiveOperationsAudit } from '@shared/middleware/audit-logger';
import { generalRateLimiter } from '@shared/middleware/rate-limiter';
import { applySecurityMiddleware } from '@shared/middleware/security';

function buildApp(): Application {
  const app: Application = express();

  app.use(urlencoded({ extended: true }));
  app.use(json());

  // Apply security middleware (which includes helmet configuration)
  applySecurityMiddleware(app);

  // Configure CORS with more secure options
  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
      maxAge: 86400 // 24 hours in seconds
    })
  );

  app.set('trust proxy', 1);
  app.use(morgan('dev'));

  // Apply general rate limiter to all routes
  app.use(generalRateLimiter);

  // Apply audit logging for security-relevant operations
  app.use(sensitiveOperationsAudit);

  // Serve static files from uploads directory with enhanced configuration
  app.use('/uploads', (req, res, next) => {
    // Log image requests for debugging
    console.log(`Image request: ${req.path}`);
    next();
  });

  app.use(
    '/uploads',
    express.static(path.join(__dirname, '../uploads'), {
      maxAge: '1d', // Cache for 1 day
      immutable: true,
      index: false,
      setHeaders: (res, filePath) => {
        // Set appropriate MIME type based on file extension
        const ext = path.extname(filePath).toLowerCase();
        let contentType = 'application/octet-stream';

        switch (ext) {
          case '.jpg':
          case '.jpeg':
            contentType = 'image/jpeg';
            break;
          case '.png':
            contentType = 'image/png';
            break;
          case '.gif':
            contentType = 'image/gif';
            break;
          case '.webp':
            contentType = 'image/webp';
            break;
        }

        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
        res.setHeader('Access-Control-Allow-Origin', '*');
      }
    })
  );

  app.use('/ping', (_: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      message: 'pong'
    });
  });

  // Routes with specific rate limiters
  app.use('/v1/users', userRoutes);
  app.use('/v1/comments', commentRoutes);
  app.use('/v1/following', followingRoutes);

  // Global error handler (phải đặt sau tất cả các route)
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Global error:', err);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
  });

  return app;
}

export default buildApp();
