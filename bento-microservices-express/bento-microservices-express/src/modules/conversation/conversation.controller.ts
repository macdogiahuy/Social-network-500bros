import prisma from '@shared/components/prisma';
import crypto from 'crypto';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { singleton } from 'tsyringe';

@singleton()
export class ConversationController {
  constructor() {}

  async getConversations(req: Request, res: Response) {
    try {
      const userId = res.locals.requester?.sub;

      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: 'Unauthorized'
        });
      }

      const conversations = await prisma.conversation.findMany({
        where: {
          OR: [{ senderId: userId }, { receiverId: userId }]
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          },
          receiver: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          },
          messages: {
            take: 1,
            orderBy: {
              createdAt: 'desc'
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });

      return res.status(StatusCodes.OK).json({
        data: conversations
      });
    } catch (error) {
      console.error('Error getting conversations:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal server error'
      });
    }
  }

  async initiateConversation(req: Request, res: Response) {
    try {
      console.log('Initiating conversation with request body:', req.body);
      const { receiverId } = req.body;
      const senderId = res.locals.requester?.sub;

      console.log('Sender ID:', senderId);
      console.log('Receiver ID:', receiverId);

      if (!senderId) {
        console.error('Unauthorized: No sender ID found in request');
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: 'Unauthorized'
        });
      }

      if (!receiverId) {
        console.error('Bad Request: No receiver ID provided');
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Receiver ID is required'
        });
      }

      // Check if conversation already exists
      console.log('Checking for existing conversation...');
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          OR: [{ AND: [{ senderId }, { receiverId }] }, { AND: [{ senderId: receiverId }, { receiverId: senderId }] }]
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          },
          receiver: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          },
          messages: {
            take: 20,
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      if (existingConversation) {
        console.log('Found existing conversation:', existingConversation.id);
        return res.status(StatusCodes.OK).json({
          data: existingConversation
        });
      }

      console.log('Creating new conversation...');
      // Create new conversation
      const conversation = await prisma.conversation.create({
        data: {
          id: crypto.randomUUID(),
          sender: { connect: { id: senderId } },
          receiver: { connect: { id: receiverId } }
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          },
          receiver: {
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

      console.log('Created new conversation:', conversation.id);
      return res.status(StatusCodes.CREATED).json({
        data: conversation
      });
    } catch (error) {
      console.error('Error in initiateConversation:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal server error'
      });
    }
  }

  async getMessages(req: Request, res: Response) {
    try {
      const userId = res.locals.requester?.sub;
      const { conversationId } = req.params;

      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: 'Unauthorized'
        });
      }

      // Verify user has access to this conversation
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [{ senderId: userId }, { receiverId: userId }]
        }
      });

      if (!conversation) {
        return res.status(StatusCodes.NOT_FOUND).json({
          error: 'Conversation not found'
        });
      }

      const messages = await prisma.message.findMany({
        where: {
          conversationId
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      return res.status(StatusCodes.OK).json({
        data: messages
      });
    } catch (error) {
      console.error('Error getting messages:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal server error'
      });
    }
  }

  async sendMessage(req: Request, res: Response) {
    try {
      const userId = res.locals.requester?.sub;
      const { conversationId } = req.params;
      const { content } = req.body;
      const file = req.file;

      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: 'Unauthorized'
        });
      }

      if (!content?.trim() && !file) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Message content or file is required'
        });
      }

      // Verify user has access to this conversation
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [{ senderId: userId }, { receiverId: userId }]
        }
      });

      if (!conversation) {
        return res.status(StatusCodes.NOT_FOUND).json({
          error: 'Conversation not found'
        });
      }

      // Create the message
      const message = await prisma.message.create({
        data: {
          id: crypto.randomUUID(),
          content: content?.trim(),
          conversation: { connect: { id: conversationId } },
          sender: { connect: { id: userId } },
          ...(file && {
            fileUrl: `/uploads/${file.filename}`,
            fileName: file.originalname,
            fileSize: file.size,
            fileType: file.mimetype
          })
        },
        include: {
          sender: {
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

      // Update conversation's updatedAt
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
      });

      return res.status(StatusCodes.CREATED).json({
        data: message
      });
    } catch (error) {
      console.error('Error sending message:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal server error'
      });
    }
  }
}
