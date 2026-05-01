import { NextFunction, Request, Response } from 'express';
import { ITokenService } from '../../modules/auth/domain/interfaces/token-service.interface';
import { audit } from './audit';
import { fail } from './response';

export type AuthenticatedRequest = Request & {
  authUser?: {
    id: string;
    role: 'user' | 'admin';
  };
};

export const buildRequireAuthMiddleware = (tokenService: ITokenService) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      audit('auth.failed.missing_token', { path: req.path, method: req.method, ip: req.ip });
      fail(res, 401, { code: 'UNAUTHORIZED', message: 'Unauthorized' });
      return;
    }

    const payload = await tokenService.verify(token);
    if (!payload) {
      audit('auth.failed.invalid_token', { path: req.path, method: req.method, ip: req.ip });
      fail(res, 401, { code: 'UNAUTHORIZED', message: 'Unauthorized' });
      return;
    }

    (req as AuthenticatedRequest).authUser = {
      id: payload.sub,
      role: payload.role
    };
    next();
  };
};
