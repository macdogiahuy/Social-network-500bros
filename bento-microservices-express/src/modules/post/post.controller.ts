import { Prisma } from '@prisma/client';
import prisma from '@shared/components/prisma';
import Logger from '@shared/utils/logger';
import crypto from 'crypto';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { singleton } from 'tsyringe';

@singleton()
export class PostController {
  constructor() {}

  async createPost(req: Request, res: Response) {
    try {
      const userId = res.locals.requester?.sub;

      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: 'Unauthorized'
        });
      }

      const { content, image, topicId } = req.body;

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
      Logger.error(`Error creating post: ${error}`);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal server error'
      });
    }
  }

  async getPosts(req: Request, res: Response) {
    try {
      const { type, limit = '10', page = '1', str, userId } = req.query;

      const take = Math.min(Number(limit) || 10, 50);
      const currentPage = Math.max(Number(page) || 1, 1);
      const skip = (currentPage - 1) * take;

      const where: Prisma.PostsWhereInput = {
        ...(type === 'media' && { type: 'media' }),
        ...(str && { content: { contains: str as string } }),
        ...(userId && { authorId: userId as string })
      };

      const [posts, total] = await Promise.all([
        prisma.posts.findMany({
          where,
          take,
          skip,
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
            },
            _count: {
              select: {
                comments: true,
                likes: true
              }
            }
          }
        }),
        prisma.posts.count({ where })
      ]);

      const postsWithDetails = posts.map((post) => ({
        ...post,
        _count: {
          comments: post._count.comments,
          likes: post._count.likes
        }
      }));

      return res.status(StatusCodes.OK).json({
        data: postsWithDetails,
        paging: {
          page: currentPage,
          limit: take,
          total,
          totalPages: Math.ceil(total / take)
        }
      });
    } catch (error) {
      Logger.error(`Error getting posts: ${error}`);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal server error'
      });
    }
  }
}
