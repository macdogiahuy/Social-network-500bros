import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

export const traceMiddleware = (_req: Request, res: Response, next: NextFunction): void => {
  res.locals.traceId = randomUUID();
  next();
};
