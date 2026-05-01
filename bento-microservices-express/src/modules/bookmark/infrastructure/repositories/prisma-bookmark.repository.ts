import { PrismaClient } from '@prisma/client';
import { IBookmarkRepository } from '../../domain/interfaces/bookmark.interfaces';

export class PrismaBookmarkRepository implements IBookmarkRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async savePost(userId: string, postId: string): Promise<boolean> {
    try {
      await this.prisma.postSaves.create({
        data: {
          userId,
          postId,
          createdAt: new Date()
        }
      });
      return true;
    } catch {
      return false;
    }
  }

  public async unsavePost(userId: string, postId: string): Promise<boolean> {
    const result = await this.prisma.postSaves.deleteMany({
      where: { userId, postId }
    });
    return result.count > 0;
  }

  public async listSavedPostIds(userId: string, limit: number): Promise<string[]> {
    const rows = await this.prisma.postSaves.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: Math.max(1, limit),
      select: { postId: true }
    });
    return rows.map((row) => row.postId);
  }
}
