import { NextFunction, Request, Response } from 'express';
import { fail } from './response';

export const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const message = error instanceof Error ? error.message : 'Internal server error';
  fail(res, 500, {
    code: 'INTERNAL_ERROR',
    message
  });
};
