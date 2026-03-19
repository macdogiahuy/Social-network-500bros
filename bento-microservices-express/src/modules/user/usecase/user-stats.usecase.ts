import prisma from '@shared/components/prisma';
import { AppError } from '@shared/utils/error';

const ErrUserNotFound = AppError.from(new Error('User not found'), 404);

export interface UserStats {
  id: string;
  username: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
  totalLikes: number;
}

export interface IUserStatsUsecase {
  getUserStats(userId: string): Promise<UserStats>;
}

export class UserStatsUsecase implements IUserStatsUsecase {
  async getUserStats(userId: string): Promise<UserStats> {
    // Get the user
    const user = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw ErrUserNotFound;
    }

    // Get the count of users who follow this user
    const followerCount = await prisma.followers.count({
      where: { followingId: userId }
    });

    // Get the count of users this user follows
    const followingCount = await prisma.followers.count({
      where: { followerId: userId }
    });

    // Get the count of posts by this user
    const postCount = await prisma.posts.count({
      where: { authorId: userId }
    });

    // Get the total number of likes received on all posts
    const posts = await prisma.posts.findMany({
      where: { authorId: userId },
      select: { id: true }
    });

    const postIds = posts.map((post) => post.id);

    const totalLikes = await prisma.postLikes.count({
      where: {
        postId: {
          in: postIds
        }
      }
    });

    return {
      id: user.id,
      username: user.username,
      followerCount,
      followingCount,
      postCount,
      totalLikes
    };
  }
}
