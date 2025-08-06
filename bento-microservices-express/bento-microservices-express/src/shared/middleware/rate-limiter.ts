import { AppError } from '@shared/utils/error';
import Logger from '@shared/utils/logger';
import { NextFunction, Request, Response } from 'express';

// Create rate limiter error
const ErrTooManyRequests = AppError.from(new Error('Too many requests, please try again later'), 429);

// Simple in-memory store for rate limiting
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class SimpleRateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private points: number;
  private duration: number; // in seconds
  private blockDuration?: number; // in seconds

  constructor(options: { points: number; duration: number; blockDuration?: number }) {
    this.points = options.points;
    this.duration = options.duration;
    this.blockDuration = options.blockDuration;
  }

  async consume(key: string): Promise<boolean> {
    const now = Math.floor(Date.now() / 1000);
    const entry = this.store.get(key);

    // If no entry exists or the entry has expired, create a new one
    if (!entry || entry.resetTime < now) {
      this.store.set(key, {
        count: 1,
        resetTime: now + this.duration
      });
      return true;
    }

    // If the entry exists and hasn't expired, check if the limit has been reached
    if (entry.count >= this.points) {
      // Apply block if configured
      if (this.blockDuration) {
        this.store.set(key, {
          count: entry.count,
          resetTime: now + this.blockDuration
        });
      }
      return false;
    }

    // Increment the count
    entry.count += 1;
    this.store.set(key, entry);
    return true;
  }
}

// Create different rate limiters for different endpoints
const generalLimiter = new SimpleRateLimiter({
  points: 60, // Number of points
  duration: 60 // Per second
});

const authLimiter = new SimpleRateLimiter({
  points: 5, // 5 requests
  duration: 60, // Per minute
  blockDuration: 300 // Block for 5 minutes if exceeded
});

const sensitiveActionsLimiter = new SimpleRateLimiter({
  points: 10, // 10 requests
  duration: 60 // Per minute
});

/**
 * Middleware to handle rate limiting
 * @param limiter The rate limiter to use
 * @returns Express middleware
 */
export const rateLimiterMiddleware = (limiter: SimpleRateLimiter) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Use IP as key for rate limiting
    const key = req.ip || (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

    limiter
      .consume(key)
      .then((result) => {
        if (result) {
          next();
        } else {
          Logger.warning(`Rate limit exceeded for IP: ${key}, Path: ${req.path}`);
          next(ErrTooManyRequests);
        }
      })
      .catch((error: Error) => {
        Logger.error(`Rate limiter error: ${error.message}`);
        next(AppError.from(error, 500));
      });
  };
};

// Export specific limiters for different routes
export const generalRateLimiter = rateLimiterMiddleware(generalLimiter);
export const authRateLimiter = rateLimiterMiddleware(authLimiter);
export const sensitiveRateLimiter = rateLimiterMiddleware(sensitiveActionsLimiter);
