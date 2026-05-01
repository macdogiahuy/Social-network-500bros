import {
  IOAuthProviderVerifier,
  OAuthIdentity,
  OAuthProvider
} from '../../domain/interfaces/oauth-provider.interface';

export class DevOAuthProviderVerifierService implements IOAuthProviderVerifier {
  public constructor(private readonly envName: string | undefined) {}

  public async verify(input: {
    provider: OAuthProvider;
    accessToken: string;
  }): Promise<OAuthIdentity | null> {
    // Production must use real provider verification implementation.
    if (this.envName === 'production') {
      return null;
    }

    const expectedPrefix = `dev-${input.provider}:`;
    if (!input.accessToken.startsWith(expectedPrefix)) {
      return null;
    }

    const payload = input.accessToken.slice(expectedPrefix.length);
    const [subjectRaw, emailRaw, firstNameRaw, lastNameRaw] = payload.split(':');
    if (!subjectRaw) {
      return null;
    }

    return {
      provider: input.provider,
      subject: decodeURIComponent(subjectRaw),
      email: emailRaw ? decodeURIComponent(emailRaw) : null,
      firstName: firstNameRaw ? decodeURIComponent(firstNameRaw) : null,
      lastName: lastNameRaw ? decodeURIComponent(lastNameRaw) : null
    };
  }
}
