import jwt from 'jsonwebtoken';
import { ITokenService, TokenPayload } from '../../domain/interfaces/token-service.interface';

export class JwtTokenService implements ITokenService {
  public constructor(private readonly secret: string) {}

  public async generate(payload: TokenPayload): Promise<string> {
    return jwt.sign(payload, this.secret, {
      expiresIn: '7d'
    });
  }

  public async verify(token: string): Promise<TokenPayload | null> {
    try {
      const decoded = jwt.verify(token, this.secret) as Partial<TokenPayload>;
      if (!decoded.sub || (decoded.role !== 'user' && decoded.role !== 'admin')) {
        return null;
      }
      return { sub: decoded.sub, role: decoded.role };
    } catch {
      return null;
    }
  }
}
