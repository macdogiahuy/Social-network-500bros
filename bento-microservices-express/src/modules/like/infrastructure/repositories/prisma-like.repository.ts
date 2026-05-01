import { PrismaClient } from '@prisma/client';
import { ILikeReadRepository, ILikeRepository } from '../../domain/interfaces/like.interfaces';

export class PrismaLikeRepository implements ILikeRepository, ILikeReadRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async likePost(postId: string, userId: string): Promise<boolean> {
    try {
      await this.prisma.postLikes.create({
        data: {
          postId,
          userId,
          createdAt: new Date()
        }
      });
      return true;
    } catch {
      return false;
    }
  }

  public async findPostAuthorId(postId: string): Promise<string | null> {
    const post = await this.prisma.posts.findUnique({
      where: { id: postId },
      select: { authorId: true }
    });
    return post?.authorId ?? null;
  }
}
