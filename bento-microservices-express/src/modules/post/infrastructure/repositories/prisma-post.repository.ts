import { PrismaClient } from '@prisma/client';
import { PostProps } from '../../domain/entities/post.entity';
import { IPostRepository, IUserFollowRepository } from '../../domain/interfaces/post.interfaces';

export class PrismaPostRepository implements IPostRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async create(post: PostProps): Promise<void> {
    await this.prisma.posts.create({
      data: {
        id: post.id,
        authorId: post.authorId,
        topicId: post.topicId,
        content: post.content,
        image: post.imageUrl
      }
    });
  }

  public async findById(id: string): Promise<PostProps | null> {
    const post = await this.prisma.posts.findUnique({ where: { id } });
    if (!post) {
      return null;
    }

    return {
      id: post.id,
      authorId: post.authorId,
      topicId: post.topicId,
      content: post.content,
      imageUrl: post.image,
      createdAt: post.createdAt
    };
  }

  public async findByIds(ids: string[]): Promise<PostProps[]> {
    if (ids.length === 0) {
      return [];
    }

    const rank = new Map(ids.map((id, index) => [id, index]));
    const posts = await this.prisma.posts.findMany({
      where: { id: { in: ids } }
    });

    return posts
      .map((post) => ({
        id: post.id,
        authorId: post.authorId,
        topicId: post.topicId,
        content: post.content,
        imageUrl: post.image,
        createdAt: post.createdAt
      }))
      .sort((left, right) => (rank.get(left.id) ?? 0) - (rank.get(right.id) ?? 0));
  }

  public async findRecentByAuthorIds(authorIds: string[], limit: number): Promise<PostProps[]> {
    if (authorIds.length === 0 || limit <= 0) {
      return [];
    }

    const posts = await this.prisma.posts.findMany({
      where: { authorId: { in: authorIds } },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return posts.map((post) => ({
      id: post.id,
      authorId: post.authorId,
      topicId: post.topicId,
      content: post.content,
      imageUrl: post.image,
      createdAt: post.createdAt
    }));
  }

  public async search(input: { keyword?: string; topicId?: string; limit: number }): Promise<PostProps[]> {
    const posts = await this.prisma.posts.findMany({
      where: {
        ...(input.topicId ? { topicId: input.topicId } : {}),
        ...(input.keyword
          ? {
              content: {
                contains: input.keyword
              }
            }
          : {})
      },
      orderBy: { createdAt: 'desc' },
      take: Math.max(1, input.limit)
    });

    return posts.map((post) => ({
      id: post.id,
      authorId: post.authorId,
      topicId: post.topicId,
      content: post.content,
      imageUrl: post.image,
      createdAt: post.createdAt
    }));
  }

  public async updateByAuthor(
    id: string,
    authorId: string,
    data: { content?: string; imageUrl?: string | null }
  ): Promise<boolean> {
    const result = await this.prisma.posts.updateMany({
      where: { id, authorId },
      data: {
        ...(data.content !== undefined ? { content: data.content } : {}),
        ...(data.imageUrl !== undefined ? { image: data.imageUrl } : {})
      }
    });
    return result.count > 0;
  }

  public async deleteByAuthor(id: string, authorId: string): Promise<boolean> {
    const result = await this.prisma.posts.deleteMany({
      where: { id, authorId }
    });
    return result.count > 0;
  }

  public async updateById(
    id: string,
    data: { content?: string; imageUrl?: string | null }
  ): Promise<boolean> {
    const result = await this.prisma.posts.updateMany({
      where: { id },
      data: {
        ...(data.content !== undefined ? { content: data.content } : {}),
        ...(data.imageUrl !== undefined ? { image: data.imageUrl } : {})
      }
    });
    return result.count > 0;
  }

  public async deleteById(id: string): Promise<boolean> {
    const result = await this.prisma.posts.deleteMany({
      where: { id }
    });
    return result.count > 0;
  }
}

export class PrismaUserFollowRepository implements IUserFollowRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async follow(followerId: string, followingId: string): Promise<boolean> {
    try {
      await this.prisma.followers.create({
        data: {
          followerId,
          followingId,
          createdAt: new Date()
        }
      });
      return true;
    } catch {
      return false;
    }
  }

  public async unfollow(followerId: string, followingId: string): Promise<boolean> {
    const result = await this.prisma.followers.deleteMany({
      where: {
        followerId,
        followingId
      }
    });
    return result.count > 0;
  }

  public async getFollowerIds(userId: string): Promise<string[]> {
    const rows = await this.prisma.followers.findMany({
      where: { followingId: userId },
      select: { followerId: true }
    });
    return rows.map((row) => row.followerId);
  }

  public async getFollowingIds(userId: string): Promise<string[]> {
    const rows = await this.prisma.followers.findMany({
      where: { followerId: userId },
      select: { followingId: true }
    });
    return rows.map((row) => row.followingId);
  }
}
