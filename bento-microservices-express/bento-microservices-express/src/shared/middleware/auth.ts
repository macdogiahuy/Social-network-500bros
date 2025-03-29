import { ITokenIntrospect, Requester } from '@shared/interface';
import { ErrTokenInvalid } from '@shared/utils/error';
import { Handler, NextFunction, Request, Response } from 'express';

export function authMiddleware(introspector: ITokenIntrospect): Handler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Get token from header
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw ErrTokenInvalid.withLog('Authorization header is missing');
      }

      const [scheme, token] = authHeader.split(' ');
      if (!token || scheme.toLowerCase() !== 'bearer') {
        throw ErrTokenInvalid.withLog('Invalid token format. Use: Bearer <token>');
      }

      // 2. Introspect token
      const { payload, error, isOk } = await introspector.introspect(token);

      if (!isOk) {
        throw ErrTokenInvalid.withLog('Token parse failed').withLog(error?.message || '');
      }

      const requester = payload as Requester;

      // 3. Set requester to res.locals
      res.locals['requester'] = requester;

      return next();
    } catch (error) {
      next(error);
    }
  };
}
