import { ITokenIntrospect, MdlFactory } from '@shared/interface';
import { NextFunction, Request, Response } from 'express';
import { allowRoles } from './allow-roles';
import { authMiddleware } from './auth';

export const setupMiddlewares = (introspector: ITokenIntrospect): MdlFactory => {
  const auth = authMiddleware(introspector);

  const optAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if authorization header exists
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        // No token provided, continue without authentication
        next();
        return;
      }

      // Token provided, validate it
      await auth(req, res, next);
    } catch (e) {
      // Token is invalid, continue without authentication
      next();
    }
  };

  return {
    auth,
    optAuth,
    allowRoles
  };
};
