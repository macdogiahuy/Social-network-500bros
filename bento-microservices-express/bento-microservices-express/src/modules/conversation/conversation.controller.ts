import prisma from '@shared/components/prisma';
import crypto from 'crypto';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { singleton } from 'tsyringe';

@singleton()
export class ConversationController {
  constructor() {}

  async initiateConversation(req: Request, res: Response) {
    try {
      const { receiverId } = req.body;
      const senderId = res.locals.requester?.id;

      if (!senderId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: 'Unauthorized'
        });
      }

      if (!receiverId) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Receiver ID is required'
        });
      }

      // Check if conversation already exists
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          OR: [{ AND: [{ senderId }, { receiverId }] }, { AND: [{ senderId: receiverId }, { receiverId: senderId }] }]
        }
      });

      if (existingConversation) {
        return res.status(StatusCodes.OK).json({
          data: existingConversation
        });
      }

      // Create new conversation
      const conversation = await prisma.conversation.create({
        data: {
          id: crypto.randomUUID(),
          sender: { connect: { id: senderId } },
          receiver: { connect: { id: receiverId } }
        }
      });

      return res.status(StatusCodes.CREATED).json({
        data: conversation
      });
    } catch (error) {
      console.error('Error initiating conversation:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal server error'
      });
    }
  }
}
