import { ITokenProvider, TokenPayload } from "@shared/interface";

import jwt from 'jsonwebtoken';
import { config } from "./config";


class JwtTokenService implements ITokenProvider {
  private readonly secretKey: string;
  private readonly expiresIn: string | number;

  constructor(secretKey: string, expiresIn: string | number) {
    this.secretKey = secretKey;
    this.expiresIn = expiresIn;
  }

  async generateToken(payload: TokenPayload): Promise<string> {
    // const payload = { userId };
    return jwt.sign(payload, this.secretKey, { expiresIn: this.expiresIn });
  }

  async verifyToken(token: string): Promise<TokenPayload | null> {
    try {
      const decoded = jwt.verify(token, this.secretKey) as TokenPayload;
      if (!decoded || !decoded.sub || !decoded.role) {
        return null;
      }
      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        console.error('JWT Verification Error:', error.message);
      }
      return null;
    }
  }
}

export const jwtProvider = new JwtTokenService(config.rpc.jwtSecret, '7d');
