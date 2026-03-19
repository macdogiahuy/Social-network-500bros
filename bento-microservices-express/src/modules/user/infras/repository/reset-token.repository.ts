import { v7 } from 'uuid';
import { CreateResetTokenDTO, ResetToken } from '../../model/reset-password';

export interface IResetTokenRepository {
  createToken(data: CreateResetTokenDTO): Promise<ResetToken>;
  findByToken(token: string): Promise<ResetToken | null>;
  markAsUsed(id: string): Promise<boolean>;
  invalidateUserTokens(userId: string): Promise<boolean>;
}

export class PrismaResetTokenRepository implements IResetTokenRepository {
  // This would normally use a Prisma model for reset tokens
  // Since we don't have the model in the schema, we'll simulate it with a mock implementation
  private tokens: ResetToken[] = [];

  async createToken(data: CreateResetTokenDTO): Promise<ResetToken> {
    // In a real implementation, we would use Prisma to create a token
    // await prisma.passwordResetTokens.create({ data });

    const newToken: ResetToken = {
      id: v7(),
      userId: data.userId,
      token: data.token,
      expiresAt: data.expiresAt,
      createdAt: new Date(),
      isUsed: false
    };

    // Invalidate existing tokens for this user
    await this.invalidateUserTokens(data.userId);

    this.tokens.push(newToken);
    return newToken;
  }

  async findByToken(token: string): Promise<ResetToken | null> {
    // In a real implementation, we would use Prisma to find a token
    // return await prisma.passwordResetTokens.findUnique({ where: { token } });

    const resetToken = this.tokens.find((t) => t.token === token);
    return resetToken || null;
  }

  async markAsUsed(id: string): Promise<boolean> {
    // In a real implementation, we would use Prisma to update a token
    // await prisma.passwordResetTokens.update({
    //   where: { id },
    //   data: { isUsed: true }
    // });

    const tokenIndex = this.tokens.findIndex((t) => t.id === id);
    if (tokenIndex !== -1) {
      this.tokens[tokenIndex].isUsed = true;
      return true;
    }
    return false;
  }

  async invalidateUserTokens(userId: string): Promise<boolean> {
    // In a real implementation, we would use Prisma to update all tokens for a user
    // await prisma.passwordResetTokens.updateMany({
    //   where: { userId, isUsed: false },
    //   data: { isUsed: true }
    // });

    this.tokens = this.tokens.map((token) => {
      if (token.userId === userId && !token.isUsed) {
        return { ...token, isUsed: true };
      }
      return token;
    });

    return true;
  }
}
