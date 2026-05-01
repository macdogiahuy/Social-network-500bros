import test from 'node:test';
import assert from 'node:assert/strict';
import { LoginUseCase } from '../modules/auth/application/use-cases/login.usecase';
import { OAuthLoginUseCase } from '../modules/auth/application/use-cases/oauth-login.usecase';
import { RegisterUseCase } from '../modules/auth/application/use-cases/register.usecase';
import {
  AuthUser,
  IAuthUserRepository
} from '../modules/auth/domain/interfaces/auth-user-repository.interface';
import {
  IOAuthProviderVerifier,
  OAuthIdentity
} from '../modules/auth/domain/interfaces/oauth-provider.interface';
import { ITokenService, TokenPayload } from '../modules/auth/domain/interfaces/token-service.interface';

class InMemoryAuthUserRepository implements IAuthUserRepository {
  private users = new Map<string, AuthUser>();

  public async create(input: {
    username: string;
    firstName: string;
    lastName: string;
    passwordHash: string;
    salt: string;
  }): Promise<AuthUser> {
    const user: AuthUser = {
      id: `user-${this.users.size + 1}`,
      username: input.username,
      firstName: input.firstName,
      lastName: input.lastName,
      role: 'user',
      passwordHash: input.passwordHash,
      salt: input.salt
    };
    this.users.set(input.username, user);
    return user;
  }

  public async findByUsername(username: string): Promise<AuthUser | null> {
    return this.users.get(username) ?? null;
  }
}

class FakeTokenService implements ITokenService {
  public async generate(payload: TokenPayload): Promise<string> {
    return `token:${payload.sub}:${payload.role}`;
  }

  public async verify(_token: string): Promise<TokenPayload | null> {
    return null;
  }
}

class FakeOAuthVerifier implements IOAuthProviderVerifier {
  public async verify(_input: {
    provider: 'google' | 'github';
    accessToken: string;
  }): Promise<OAuthIdentity | null> {
    return {
      provider: 'google',
      subject: 'abc123',
      email: 'alice@example.com',
      firstName: 'Alice',
      lastName: 'Nguyen'
    };
  }
}

class RejectOAuthVerifier implements IOAuthProviderVerifier {
  public async verify(_input: {
    provider: 'google' | 'github';
    accessToken: string;
  }): Promise<OAuthIdentity | null> {
    return null;
  }
}

test('register creates user and returns token', async () => {
  const userRepo = new InMemoryAuthUserRepository();
  const tokenService = new FakeTokenService();
  const useCase = new RegisterUseCase(userRepo, tokenService);

  const result = await useCase.execute({
    username: 'alice',
    firstName: 'Alice',
    lastName: 'Nguyen',
    password: 'password123'
  });

  assert.equal(result.user.username, 'alice');
  assert.match(result.token, /^token:user-\d+:user$/);
});

test('login rejects invalid credentials', async () => {
  const userRepo = new InMemoryAuthUserRepository();
  const tokenService = new FakeTokenService();
  const registerUseCase = new RegisterUseCase(userRepo, tokenService);
  const loginUseCase = new LoginUseCase(userRepo, tokenService);

  await registerUseCase.execute({
    username: 'bob',
    firstName: 'Bob',
    lastName: 'Tran',
    password: 'password123'
  });

  await assert.rejects(
    async () =>
      loginUseCase.execute({
        username: 'bob',
        password: 'wrong-password'
      }),
    /Invalid credentials/
  );
});

test('oauth login creates oauth user and returns token', async () => {
  const userRepo = new InMemoryAuthUserRepository();
  const tokenService = new FakeTokenService();
  const useCase = new OAuthLoginUseCase(userRepo, tokenService, new FakeOAuthVerifier());

  const result = await useCase.execute({
    provider: 'google',
    accessToken: 'dev-google:abc123'
  });

  assert.equal(result.user.username, 'oauth_google_abc123');
  assert.match(result.token, /^token:user-\d+:user$/);
});

test('oauth login rejects invalid token', async () => {
  const userRepo = new InMemoryAuthUserRepository();
  const tokenService = new FakeTokenService();
  const useCase = new OAuthLoginUseCase(userRepo, tokenService, new RejectOAuthVerifier());

  await assert.rejects(
    async () =>
      useCase.execute({
        provider: 'google',
        accessToken: 'invalid'
      }),
    /Invalid OAuth token/
  );
});
