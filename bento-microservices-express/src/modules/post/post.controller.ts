import { Prisma } from '@prisma/client';
import prisma from '@shared/components/prisma';
import { RedisCache } from '@shared/components/redis-cache';
import crypto from 'crypto';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { singleton } from 'tsyringe';

@singleton()
export class PostController {
  constructor() {}

  async createPost(req: Request, res: Response) {
    try {
      console.log('Request headers:', req.headers);
      console.log('Requester:', res.locals.requester);

      const userId = res.locals.requester?.sub;
      console.log('User ID from token:', userId);

      if (!userId) {
        console.log('Unauthorized: No user ID found in token');
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: 'Unauthorized'
        });
      }

      const { content, image, topicId } = req.body;
      console.log('Request body:', { content, image, topicId });

      if (!content?.trim()) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Content is required'
        });
      }

      if (!topicId) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Topic is required'
        });
      }

      const post = await prisma.posts.create({
        data: {
          id: crypto.randomUUID(),
          content: content.trim(),
          image: image || null,
          authorId: userId,
          topicId,
          type: image ? 'media' : 'text'
        },
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

      // Invalidate post list cache
      await RedisCache.getInstance().delPattern('posts:*');

      // Get the topic separately since it's not directly included in the Posts model
      const topic = await prisma.topics.findUnique({
        where: { id: topicId }
      });

      return res.status(StatusCodes.CREATED).json({
        data: {
          ...post,
          topic
        }
      });
    } catch (error) {
      console.error('Error creating post:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal server error'
      });
    }
  }

  async getPosts(req: Request, res: Response) {
    try {
      const { type, limit = 10, str, userId } = req.query;

      // Generate cache key
      const cacheKey = `posts:${type || 'all'}:${limit}:${str || ''}:${userId || ''}`;
      
      // Try to get from cache first
      const cached = await RedisCache.getInstance().get(cacheKey);
      if (cached) {
        return res.status(StatusCodes.OK).json(cached);
      }

      const where: Prisma.PostsWhereInput = {
        ...(type === 'media' && { type: 'media' }),
        ...(str && { content: { contains: str as string } }),
        ...(userId && { authorId: userId as string })
      };

      const posts = await prisma.posts.findMany({
        where,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
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

      const result = {
        data: posts.map(post => ({
          ...post,
          _count: {
            comments: post.commentCount || 0,
            likes: post.likedCount || 0
          }
        }))
      };

      // Cache result for 5 minutes (300 seconds)
      await RedisCache.getInstance().set(cacheKey, result, 300);

      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      console.error('Error getting posts:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal server error'
      });
    }
  }
}
