export type TokenPayload = {
  sub: string;
  role: 'user' | 'admin';
};

export interface ITokenService {
  generate(payload: TokenPayload): Promise<string>;
  verify(token: string): Promise<TokenPayload | null>;
}
