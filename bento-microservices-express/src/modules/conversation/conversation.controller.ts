import prisma from '@shared/components/prisma';
import { RedisClient } from '@shared/components/redis-pubsub/redis';
import { AppEvent } from '@shared/model/event';
import {
  deleteCloudinaryAssetByUrl,
  uploadBufferToCloudinary,
} from '@shared/services/cloudinary.service';
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
          OR: [{ senderId: userId }, { receiverId: userId }, { participants: { some: { userId } } }]
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
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  avatar: true
                }
              }
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
      const { receiverId, userIds, name } = req.body;
      const senderId = res.locals.requester?.sub;
      const file = req.file;

      console.log('Sender ID:', senderId);

      if (!senderId) {
        console.error('Unauthorized: No sender ID found in request');
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: 'Unauthorized'
        });
      }

      // GROUP CHAT
      if (userIds && Array.isArray(userIds) && userIds.length > 0) {
        console.log('Creating group conversation...');
        const uploadedGroupImage = file
          ? await uploadBufferToCloudinary(file, {
              folder: 'social-network-500bros/conversations/groups',
              resourceType: 'image'
            })
          : null;
        const conversation = await prisma.conversation.create({
          data: {
            id: crypto.randomUUID(),
            type: 'GROUP',
            name: name || 'New Group',
            image: uploadedGroupImage?.secureUrl || null,
            participants: {
              create: [{ userId: senderId }, ...userIds.map((id: string) => ({ userId: id }))]
            }
          },
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    avatar: true
                  }
                }
              }
            }
          }
        });
        return res.status(StatusCodes.CREATED).json({ data: conversation });
      }

      // DIRECT CHAT
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
          type: 'DIRECT',
          sender: { connect: { id: senderId } },
          receiver: { connect: { id: receiverId } },
          participants: {
            create: [{ userId: senderId }, { userId: receiverId }]
          }
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
          OR: [{ senderId: userId }, { receiverId: userId }, { participants: { some: { userId } } }]
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
          },
          reactions: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true
                }
              }
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
          OR: [{ senderId: userId }, { receiverId: userId }, { participants: { some: { userId } } }]
        },
        include: {
          participants: true
        }
      });

      if (!conversation) {
        return res.status(StatusCodes.NOT_FOUND).json({
          error: 'Conversation not found'
        });
      }

      const uploadedFile = file
        ? await uploadBufferToCloudinary(file, {
            folder: 'social-network-500bros/conversations/messages',
            resourceType: 'auto'
          })
        : null;

      // Create the message
      const message = await prisma.message.create({
        data: {
          id: crypto.randomUUID(),
          content: content?.trim(),
          conversation: { connect: { id: conversationId } },
          sender: { connect: { id: userId } },
          ...(file && uploadedFile && {
            fileUrl: uploadedFile.secureUrl,
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

      // Publish event to Redis
      const redis = RedisClient.getInstance();

      if (conversation.participants && conversation.participants.length > 0) {
        const recipients = conversation.participants.filter((p) => p.userId !== userId);
        for (const recipient of recipients) {
          await redis.publish(
            new AppEvent(
              'NEW_MESSAGE',
              {
                receiverId: recipient.userId,
                message: {
                  ...message,
                  reactions: []
                }
              },
              { senderId: userId }
            )
          );
        }
      } else {
        // Fallback for legacy direct messages
        const receiverId = conversation.senderId === userId ? conversation.receiverId : conversation.senderId;
        if (receiverId) {
          await redis.publish(
            new AppEvent(
              'NEW_MESSAGE',
              {
                receiverId,
                message: {
                  ...message,
                  reactions: []
                }
              },
              { senderId: userId }
            )
          );
        }
      }

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

  async deleteConversation(req: Request, res: Response) {
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
          OR: [{ senderId: userId }, { receiverId: userId }, { participants: { some: { userId } } }]
        }
      });

      if (!conversation) {
        return res.status(StatusCodes.NOT_FOUND).json({
          error: 'Conversation not found'
        });
      }

      // Delete the conversation and related records
      await prisma.$transaction([
        prisma.message.deleteMany({
          where: { conversationId }
        }),
        prisma.conversationParticipant.deleteMany({
          where: { conversationId }
        }),
        prisma.conversation.delete({
          where: { id: conversationId }
        })
      ]);

      return res.status(StatusCodes.OK).json({
        message: 'Conversation deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal server error'
      });
    }
  }

  async deleteMessage(req: Request, res: Response) {
    try {
      const userId = res.locals.requester?.sub;
      const { conversationId, messageId } = req.params;

      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: 'Unauthorized'
        });
      }

      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [{ senderId: userId }, { receiverId: userId }, { participants: { some: { userId } } }]
        },
        include: {
          participants: true
        }
      });

      if (!conversation) {
        return res.status(StatusCodes.NOT_FOUND).json({
          error: 'Conversation not found'
        });
      }

      const message = await prisma.message.findFirst({
        where: {
          id: messageId,
          conversationId
        }
      });

      if (!message) {
        return res.status(StatusCodes.NOT_FOUND).json({
          error: 'Message not found'
        });
      }

      if (message.senderId !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({
          error: 'You can only delete your own messages'
        });
      }

      await prisma.$transaction([
        prisma.messageReaction.deleteMany({
          where: { messageId }
        }),
        prisma.message.delete({
          where: { id: messageId }
        }),
        prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() }
        })
      ]);

      if (message.fileUrl) {
        await deleteCloudinaryAssetByUrl(message.fileUrl);
      }

      const redis = RedisClient.getInstance();
      const eventPayload = {
        conversationId,
        messageId
      };

      if (conversation.participants && conversation.participants.length > 0) {
        const recipients = conversation.participants.filter((p) => p.userId !== userId);
        for (const recipient of recipients) {
          await redis.publish(
            new AppEvent(
              'MESSAGE_DELETED',
              { ...eventPayload, receiverId: recipient.userId },
              { senderId: userId }
            )
          );
        }
      } else {
        const receiverId =
          conversation.senderId === userId ? conversation.receiverId : conversation.senderId;
        if (receiverId) {
          await redis.publish(
            new AppEvent(
              'MESSAGE_DELETED',
              { ...eventPayload, receiverId },
              { senderId: userId }
            )
          );
        }
      }

      return res.status(StatusCodes.OK).json({
        message: 'Message deleted successfully',
        data: { id: messageId }
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal server error'
      });
    }
  }

  async reactToMessage(req: Request, res: Response) {
    try {
      const userId = res.locals.requester?.sub;
      const { conversationId, messageId } = req.params;
      const { emoji } = req.body;

      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: 'Unauthorized'
        });
      }

      if (!emoji) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Emoji is required'
        });
      }

      // Check if conversation exists and user is participant
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [{ senderId: userId }, { receiverId: userId }, { participants: { some: { userId } } }]
        },
        include: { participants: true }
      });

      if (!conversation) {
        // Fallback check separated to ensure participant access
        return res.status(StatusCodes.NOT_FOUND).json({ error: 'Conversation not found or access denied' });
      }

      // Check if message exists in conversation
      const message = await prisma.message.findFirst({
        where: { id: messageId, conversationId }
      });

      if (!message) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: 'Message not found' });
      }

      // Check for existing reaction
      const existingReaction = await prisma.messageReaction.findFirst({
        where: {
          messageId,
          userId
        }
      });

      const redis = RedisClient.getInstance();
      let result;
      let action = 'add';

      if (existingReaction) {
        if (existingReaction.emoji === emoji) {
          // Toggle off (remove)
          await prisma.messageReaction.delete({
            where: { id: existingReaction.id }
          });
          action = 'remove';
          result = { message: 'Reaction removed' };
        } else {
          // Update
          const updated = await prisma.messageReaction.update({
            where: { id: existingReaction.id },
            data: { emoji }
          });
          action = 'update';
          result = { data: updated };
        }
      } else {
        // Create
        const newReaction = await prisma.messageReaction.create({
          data: {
            id: crypto.randomUUID(),
            messageId,
            userId,
            emoji
          }
        });
        result = { data: newReaction };
      }

      // Publish event
      const eventPayload = {
        conversationId,
        messageId,
        userId,
        emoji: action === 'remove' ? existingReaction?.emoji : emoji,
        action // 'add', 'remove', 'update'
      };

      if (conversation.participants && conversation.participants.length > 0) {
        const recipients = conversation.participants.filter((p) => p.userId !== userId);
        for (const recipient of recipients) {
          await redis.publish(
            new AppEvent('MESSAGE_REACTION', { ...eventPayload, receiverId: recipient.userId }, { senderId: userId })
          );
        }
      } else {
        const receiverId = conversation.senderId === userId ? conversation.receiverId : conversation.senderId;
        if (receiverId) {
          await redis.publish(new AppEvent('MESSAGE_REACTION', { ...eventPayload, receiverId }, { senderId: userId }));
        }
      }

      // Also publish back to sender for optimistic UI confirmation if needed, but usually frontend handles it.
      // However, for consistency in multi-device, good to publish to sender too? usually loopback is handled by FE or skipped.

      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      console.error('Error reacting to message:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
  }
}
