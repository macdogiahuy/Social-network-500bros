import prisma from '@shared/components/prisma';
import Logger from '@shared/utils/logger';
import { pickParam } from '@shared/utils/request';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { singleton } from 'tsyringe';

@singleton()
export class NotificationController {
  constructor() {}

  async getNotifications(req: Request, res: Response) {
    try {
      const userId = res.locals.requester?.id;
      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: 'Unauthorized'
        });
      }

      const notifications = await prisma.notifications.findMany({
        where: {
          receiverId: userId,
          isRead: false
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return res.status(StatusCodes.OK).json({
        data: notifications
      });
    } catch (error) {
      Logger.error(`Error getting notifications: ${error}`);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal server error'
      });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const id = pickParam(req.params.id);
      const userId = res.locals.requester?.id;

      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: 'Unauthorized'
        });
      }

      await prisma.notifications.update({
        where: {
          id,
          receiverId: userId
        },
        data: {
          isRead: true
        }
      });

      return res.status(StatusCodes.OK).json({
        message: 'Notification marked as read'
      });
    } catch (error) {
      Logger.error(`Error marking notification as read: ${error}`);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal server error'
      });
    }
  }
}
