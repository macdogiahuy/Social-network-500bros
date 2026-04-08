import { jwtProvider } from '@shared/components/jwt';
import prisma from '@shared/components/prisma';
import { RedisCache } from '@shared/components/redis-cache';
import { uploadBufferToCloudinary } from '@shared/services/cloudinary.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { singleton } from 'tsyringe';

@singleton()
export class UserController {
  constructor() {}

  async getProfile(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: 'Access token is missing'
        });
      }

      const payload = await jwtProvider.verifyToken(token);
      if (!payload) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: 'Invalid token'
        });
      }

      const { sub } = payload;
      
      // Try cache first
      const cacheKey = `user:profile:${sub}`;
      const cached = await RedisCache.getInstance().get(cacheKey);
      if (cached) {
        return res.status(StatusCodes.OK).json({ data: cached });
      }

      const user = await prisma.users.findUnique({ where: { id: sub } });

      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({
          error: 'User not found'
        });
      }

      // Remove sensitive data
      const { password, salt, ...userData } = user;

      // Cache for 10 minutes
      await RedisCache.getInstance().set(cacheKey, userData, 600);

      return res.status(StatusCodes.OK).json({
        data: userData
      });
    } catch (error) {
      console.error('Error getting profile:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal server error'
      });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: 'Access token is missing'
        });
      }

      const payload = await jwtProvider.verifyToken(token);
      if (!payload) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: 'Invalid token'
        });
      }

      const { sub } = payload;
      const user = await prisma.users.findUnique({ where: { id: sub } });

      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({
          error: 'User not found'
        });
      }

      // Extract profile data from request
      const { firstName, lastName } = req.body;

      // Update user profile
      const updatedUser = await prisma.users.update({
        where: { id: sub },
        data: {
          firstName: firstName || user.firstName,
          lastName: lastName || user.lastName,
          updatedAt: new Date()
        }
      });

      // Invalidate user cache
      await RedisCache.getInstance().del(`user:profile:${sub}`);

      // Remove sensitive data
      const { password, salt, ...userData } = updatedUser;

      return res.status(StatusCodes.OK).json({
        data: userData,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal server error'
      });
    }
  }

  async updateAvatar(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: 'Access token is missing'
        });
      }

      const payload = await jwtProvider.verifyToken(token);
      if (!payload) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: 'Invalid token'
        });
      }

      const { sub } = payload;
      const file = req.file;

      if (!file) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'No file uploaded'
        });
      }

      const uploadedAvatar = await uploadBufferToCloudinary(file, {
        folder: 'social-network-500bros/users/avatars',
        resourceType: 'image'
      });

      // Update user's avatar in database
      const updatedUser = await prisma.users.update({
        where: { id: sub },
        data: {
          avatar: uploadedAvatar.secureUrl,
          updatedAt: new Date()
        }
      });

      // Invalidate user cache
      await RedisCache.getInstance().del(`user:profile:${sub}`);

      // Remove sensitive data
      const { password, salt, ...userData } = updatedUser;

      return res.status(StatusCodes.OK).json({
        data: userData,
        message: 'Avatar updated successfully'
      });
    } catch (error) {
      console.error('Error updating avatar:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal server error'
      });
    }
  }
  async getUsers(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: 'Access token is missing'
        });
      }

      const payload = await jwtProvider.verifyToken(token);
      if (!payload) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: 'Invalid token'
        });
      }

      const { sub } = payload;
      const { search } = req.query;

      const users = await prisma.users.findMany({
        where: {
          id: { not: sub },
          ...(search && {
            OR: [
              { username: { contains: search as string } },
              { firstName: { contains: search as string } },
              { lastName: { contains: search as string } }
            ]
          })
        },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true
        }
      });

      return res.status(StatusCodes.OK).json({
        data: users
      });
    } catch (error) {
      console.error('Error getting users:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal server error'
      });
    }
  }
}
