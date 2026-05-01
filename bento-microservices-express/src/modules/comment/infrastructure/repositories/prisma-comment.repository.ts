import { PrismaClient } from '@prisma/client';
import { CommentProps } from '../../domain/entities/comment.entity';
import { ICommentRepository } from '../../domain/interfaces/comment.interfaces';

export class PrismaCommentRepository implements ICommentRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async create(comment: CommentProps): Promise<void> {
    await this.prisma.comments.create({
      data: {
        id: comment.id,
        content: comment.content,
        userId: comment.userId,
        postId: comment.postId,
        parentId: comment.parentId,
        createdAt: comment.createdAt
      }
    });
  }

  public async listByPost(postId: string, limit: number): Promise<CommentProps[]> {
    const rows = await this.prisma.comments.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
      take: Math.max(1, limit)
    });

    return rows.map((row) => ({
      id: row.id,
      content: row.content,
      userId: row.userId,
      postId: row.postId,
      parentId: row.parentId,
      createdAt: row.createdAt
    }));
  }

  public async findPostAuthorId(postId: string): Promise<string | null> {
    const post = await this.prisma.posts.findUnique({
      where: { id: postId },
      select: { authorId: true }
    });
    return post?.authorId ?? null;
  }

  public async updateByAuthor(id: string, userId: string, content: string): Promise<boolean> {
    const result = await this.prisma.comments.updateMany({
      where: { id, userId },
      data: { content }
    });
    return result.count > 0;
  }

  public async deleteByAuthor(id: string, userId: string): Promise<boolean> {
    const result = await this.prisma.comments.deleteMany({
      where: { id, userId }
    });
    return result.count > 0;
  }

  public async updateById(id: string, content: string): Promise<boolean> {
    const result = await this.prisma.comments.updateMany({
      where: { id },
      data: { content }
    });
    return result.count > 0;
  }

  public async deleteById(id: string): Promise<boolean> {
    const result = await this.prisma.comments.deleteMany({
      where: { id }
    });
    return result.count > 0;
  }
}
