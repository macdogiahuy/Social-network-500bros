import prisma from '@shared/components/prisma';
import { ErrUserNotFound } from '@shared/utils/error';
import { IUserStatsUsecase } from '../interface';
import { UserStatsDTO } from '../model';

export class UserStatsUsecase implements IUserStatsUsecase {
  async getUserStats(userId: string): Promise<UserStatsDTO> {
    // Get the user
    const user = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw ErrUserNotFound;
    }

    const [followerCount, followingCount, postCount, posts] = await Promise.all([
      prisma.follow.count({
        where: { followingId: userId }
      }),
      prisma.follow.count({
        where: { followerId: userId }
      }),
      prisma.posts.count({
        where: { authorId: userId }
      }),
      prisma.posts.findMany({
        where: { authorId: userId },
        select: { id: true }
      })
    ]);

    const postIds = posts.map((post) => post.id);

    const totalLikes = postIds.length > 0
      ? await prisma.postLikes.count({
          where: {
            postId: { in: postIds }
          }
        })
      : 0;

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
