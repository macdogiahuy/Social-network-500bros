import { PrismaClient } from '@prisma/client';
import { IUserRepository, UserProfile } from '../../domain/interfaces/user.interfaces';

export class PrismaUserRepository implements IUserRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async exists(userId: string): Promise<boolean> {
    const found = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { id: true }
    });
    return found !== null;
  }

  public async getProfile(userId: string): Promise<UserProfile | null> {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatar: true,
        websiteUrl: true,
        followerCount: true,
        postCount: true
      }
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      bio: user.bio ?? null,
      avatar: user.avatar ?? null,
      cover: null,
      websiteUrl: user.websiteUrl ?? null,
      followerCount: user.followerCount ?? 0,
      postCount: user.postCount ?? 0
    };
  }

  public async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      bio?: string | null;
      avatar?: string | null;
      cover?: string | null;
      websiteUrl?: string | null;
    }
  ): Promise<boolean> {
    const result = await this.prisma.users.updateMany({
      where: { id: userId },
      data: {
        ...(data.firstName !== undefined ? { firstName: data.firstName } : {}),
        ...(data.lastName !== undefined ? { lastName: data.lastName } : {}),
        ...(data.bio !== undefined ? { bio: data.bio } : {}),
        ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
        ...(data.cover !== undefined ? { cover: data.cover } : {}),
        ...(data.websiteUrl !== undefined ? { websiteUrl: data.websiteUrl } : {})
      }
    });
    return result.count > 0;
  }
}
