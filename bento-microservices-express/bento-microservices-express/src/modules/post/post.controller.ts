import { Prisma } from '@prisma/client';
import prisma from '@shared/components/prisma';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { singleton } from 'tsyringe';

@singleton()
export class PostController {
  constructor() {}

  async createPost(req: Request, res: Response) {
    try {
      const userId = res.locals.requester?.id;
      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: 'Unauthorized'
        });
      }

      // Implement create post logic
      return res.status(StatusCodes.NOT_IMPLEMENTED).json({
        error: 'Not implemented'
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
      const { type, limit = 10, str } = req.query;

      const where: Prisma.PostsWhereInput = {
        ...(type === 'media' && { type: 'media' }),
        ...(str && { content: { contains: str as string } })
      };

      const posts = await prisma.posts.findMany({
        where,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      });

      // Get author details and counts separately
      const postsWithDetails = await Promise.all(
        posts.map(async (post) => {
          const [author, commentCount, likeCount] = await Promise.all([
            prisma.users.findUnique({
              where: { id: post.authorId },
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }),
            prisma.comments.count({
              where: { postId: post.id }
            }),
            prisma.postLikes.count({
              where: { postId: post.id }
            })
          ]);

          return {
            ...post,
            author,
            _count: {
              comments: commentCount,
              likes: likeCount
            }
          };
        })
      );

      return res.status(StatusCodes.OK).json({
        data: postsWithDetails
      });
    } catch (error) {
      console.error('Error getting posts:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal server error'
      });
    }
  }
}
