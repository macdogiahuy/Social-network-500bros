import { ITokenIntrospect, Requester } from '@shared/interface';
import { AppError } from '@shared/utils/error';
import { Handler, NextFunction, Request, Response } from 'express';

export function authMiddleware(introspector: ITokenIntrospect): Handler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Get token from header
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).json({ error: 'Access token is missing' });
        return;
      }

      const [scheme, token] = authHeader.split(' ');
      if (!token || scheme.toLowerCase() !== 'bearer') {
        throw AppError.from(new Error('Token is invalid'), 401).withLog('Invalid token format. Use: Bearer <token>');
      }

      // 2. Introspect token
      const { payload, error, isOk } = await introspector.introspect(token);

      if (!isOk) {
        throw AppError.from(new Error('Token is invalid'), 401).withLog('Token parse failed').withLog(error?.message || '');
      }

      const requester = payload as Requester;

      // 3. Set requester to res.locals
      res.locals['requester'] = requester;

      next();
    } catch (error) {
      next(error);
    }
  };
}
