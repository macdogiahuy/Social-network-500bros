import { NextFunction, Request, Response } from 'express';
import { fail } from './response';

type Bucket = {
  count: number;
  resetAtMs: number;
};

const buckets = new Map<string, Bucket>();

export const buildRateLimitMiddleware = (options: {
  windowMs: number;
  maxRequests: number;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${req.path}:${ip}`;
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAtMs <= now) {
      buckets.set(key, {
        count: 1,
        resetAtMs: now + options.windowMs
      });
      next();
      return;
    }

    if (bucket.count >= options.maxRequests) {
      fail(res, 429, {
        code: 'RATE_LIMITED',
        message: 'Too many requests, please try again later'
      });
      return;
    }

    bucket.count += 1;
    buckets.set(key, bucket);
    next();
  };
};
