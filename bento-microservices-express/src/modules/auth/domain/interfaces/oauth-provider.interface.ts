export type OAuthProvider = 'google' | 'github';

export type OAuthIdentity = {
  provider: OAuthProvider;
  subject: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
};

export interface IOAuthProviderVerifier {
  verify(input: { provider: OAuthProvider; accessToken: string }): Promise<OAuthIdentity | null>;
}
