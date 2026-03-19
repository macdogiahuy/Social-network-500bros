import { posts_type } from '@prisma/client';
import prisma from '@shared/components/prisma';
import { Paginated, PagingDTO } from '@shared/model';

export interface TrendingPost {
  id: string;
  content: string;
  image?: string | null;
  authorId: string;
  topicId: string;
  likedCount: number;
  commentCount: number;
  type: posts_type;
  createdAt: Date;
  author: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
  };
  topic: {
    id: string;
    name: string;
    color: string;
  };
}

export interface IFeedUsecase {
  getTrendingPosts(paging: PagingDTO): Promise<Paginated<TrendingPost>>;
  getLatestPostsByTopic(topicId: string, paging: PagingDTO): Promise<Paginated<TrendingPost>>;
}

export class FeedUsecase implements IFeedUsecase {
  async getTrendingPosts(paging: PagingDTO): Promise<Paginated<TrendingPost>> {
    const skip = (paging.page - 1) * paging.limit;

    const total = await prisma.posts.count();

    const posts = await prisma.posts.findMany({
      where: {
        // Only get posts from the past week
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: [{ likedCount: 'desc' }, { commentCount: 'desc' }, { createdAt: 'desc' }],
      take: paging.limit,
      skip,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    // Get topics for all posts in a single query
    const topicIds = posts.map((post) => post.topicId);
    const topics = await prisma.topics.findMany({
      where: {
        id: {
          in: topicIds
        }
      }
    });

    // Map topics to posts
    const topicsMap = topics.reduce(
      (acc, topic) => {
        acc[topic.id] = topic;
        return acc;
      },
      {} as Record<string, any>
    );

    const trendingPosts = posts.map((post) => ({
      ...post,
      topic: {
        id: topicsMap[post.topicId].id,
        name: topicsMap[post.topicId].name,
        color: topicsMap[post.topicId].color
      }
    })) as TrendingPost[];

    return {
      data: trendingPosts,
      paging,
      total
    };
  }

  async getLatestPostsByTopic(topicId: string, paging: PagingDTO): Promise<Paginated<TrendingPost>> {
    const skip = (paging.page - 1) * paging.limit;

    const total = await prisma.posts.count({
      where: { topicId }
    });

    const posts = await prisma.posts.findMany({
      where: { topicId },
      orderBy: { createdAt: 'desc' },
      take: paging.limit,
      skip,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    // Get the topic
    const topic = await prisma.topics.findUnique({
      where: { id: topicId }
    });

    const topicPosts = posts.map((post) => ({
      ...post,
      topic: {
        id: topic?.id || '',
        name: topic?.name || '',
        color: topic?.color || '#000000'
      }
    })) as TrendingPost[];

    return {
      data: topicPosts,
      paging,
      total
    };
  }
}
