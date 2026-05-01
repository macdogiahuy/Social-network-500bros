import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRequireAuthMiddleware } from '../infrastructure/http/auth.middleware';
import { ITokenService, TokenPayload } from '../modules/auth/domain/interfaces/token-service.interface';
import { loginSchema, registerSchema } from '../modules/auth/interfaces/http/auth.schemas';

class FakeTokenService implements ITokenService {
  public constructor(private readonly payload: TokenPayload | null) {}

  public async generate(_payload: TokenPayload): Promise<string> {
    return 'token';
  }

  public async verify(_token: string): Promise<TokenPayload | null> {
    return this.payload;
  }
}

test('auth middleware rejects missing bearer token', async () => {
  const middleware = buildRequireAuthMiddleware(new FakeTokenService(null));
  let statusCode = 200;
  let body: unknown = null;
  let nextCalled = false;

  await middleware(
    {
      headers: {},
      path: '/v2/posts',
      method: 'POST',
      ip: '127.0.0.1'
    } as never,
    {
      locals: {},
      status: (code: number) => {
        statusCode = code;
        return {
          json: (payload: unknown) => {
            body = payload;
          }
        };
      }
    } as never,
    () => {
      nextCalled = true;
    }
  );

  assert.equal(statusCode, 401);
  assert.equal(nextCalled, false);
  assert.ok(typeof body === 'object' && body !== null);
});

test('auth schemas reject unknown fields', () => {
  const registerParsed = registerSchema.safeParse({
    username: 'user',
    firstName: 'First',
    lastName: 'Last',
    password: 'password123',
    extra: 'not-allowed'
  });
  const loginParsed = loginSchema.safeParse({
    username: 'user',
    password: 'password123',
    extra: 'not-allowed'
  });

  assert.equal(registerParsed.success, false);
  assert.equal(loginParsed.success, false);
});
