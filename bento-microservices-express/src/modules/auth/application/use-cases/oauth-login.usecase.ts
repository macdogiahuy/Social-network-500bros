import { randomUUID } from 'node:crypto';
import { IAuthUserRepository } from '../../domain/interfaces/auth-user-repository.interface';
import { IOAuthProviderVerifier, OAuthProvider } from '../../domain/interfaces/oauth-provider.interface';
import { ITokenService } from '../../domain/interfaces/token-service.interface';

export class OAuthLoginUseCase {
  public constructor(
    private readonly authUserRepository: IAuthUserRepository,
    private readonly tokenService: ITokenService,
    private readonly oauthVerifier: IOAuthProviderVerifier
  ) {}

  public async execute(input: { provider: OAuthProvider; accessToken: string }): Promise<{
    token: string;
    user: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
      role: 'user' | 'admin';
    };
  }> {
    const identity = await this.oauthVerifier.verify(input);
    if (!identity) {
      throw new Error('Invalid OAuth token');
    }

    const username = this.buildUsername(identity.provider, identity.subject);
    let user = await this.authUserRepository.findByUsername(username);
    if (!user) {
      user = await this.authUserRepository.create({
        username,
        firstName: identity.firstName?.trim() || 'OAuth',
        lastName: identity.lastName?.trim() || 'User',
        // Local password is not used for OAuth accounts.
        passwordHash: randomUUID(),
        salt: randomUUID()
      });
    }

    const token = await this.tokenService.generate({
      sub: user.id,
      role: user.role
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    };
  }

  private buildUsername(provider: OAuthProvider, subject: string): string {
    const normalized = subject.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    return `oauth_${provider}_${normalized}`;
  }
}
