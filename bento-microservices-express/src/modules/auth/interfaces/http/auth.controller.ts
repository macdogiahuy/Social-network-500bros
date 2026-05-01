import { Request, Response } from 'express';
import { LoginUseCase } from '../../application/use-cases/login.usecase';
import { RegisterUseCase } from '../../application/use-cases/register.usecase';
import { IntrospectTokenUseCase } from '../../application/use-cases/introspect-token.usecase';
import { OAuthLoginUseCase } from '../../application/use-cases/oauth-login.usecase';
import { fail, ok } from '../../../../infrastructure/http/response';
import { loginSchema, oauthLoginSchema, registerSchema } from './auth.schemas';
import { audit } from '../../../../infrastructure/http/audit';

export class AuthController {
  public constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly introspectTokenUseCase: IntrospectTokenUseCase,
    private readonly oauthLoginUseCase: OAuthLoginUseCase
  ) {}

  public register = async (req: Request, res: Response): Promise<void> => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      fail(res, 400, {
        code: 'VALIDATION_ERROR',
        message: parsed.error.issues[0]?.message ?? 'Invalid request body'
      });
      return;
    }
    const body = parsed.data;

    try {
      const result = await this.registerUseCase.execute({
        username: body.username,
        firstName: body.firstName,
        lastName: body.lastName,
        password: body.password
      });
      ok(res, result, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Register failed';
      fail(res, 400, {
        code: 'REGISTER_FAILED',
        message
      });
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      fail(res, 400, {
        code: 'VALIDATION_ERROR',
        message: parsed.error.issues[0]?.message ?? 'Invalid request body'
      });
      return;
    }
    const body = parsed.data;

    try {
      const result = await this.loginUseCase.execute({
        username: body.username,
        password: body.password
      });
      ok(res, result);
    } catch {
      audit('auth.failed.invalid_credentials', { username: body.username });
      fail(res, 401, {
        code: 'UNAUTHORIZED',
        message: 'Invalid credentials'
      });
    }
  };

  public introspect = async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      fail(res, 400, {
        code: 'VALIDATION_ERROR',
        message: 'Bearer token is required'
      });
      return;
    }

    const result = await this.introspectTokenUseCase.execute({ token });
    ok(res, result);
  };

  public oauthLogin = async (req: Request, res: Response): Promise<void> => {
    const parsed = oauthLoginSchema.safeParse(req.body);
    if (!parsed.success) {
      fail(res, 400, {
        code: 'VALIDATION_ERROR',
        message: parsed.error.issues[0]?.message ?? 'Invalid request body'
      });
      return;
    }

    try {
      const result = await this.oauthLoginUseCase.execute(parsed.data);
      ok(res, result);
    } catch {
      audit('auth.failed.oauth_invalid', { provider: parsed.data.provider });
      fail(res, 401, {
        code: 'UNAUTHORIZED',
        message: 'Invalid OAuth credentials'
      });
    }
  };
}
