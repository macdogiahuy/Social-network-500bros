import { PrismaClient } from '@prisma/client';
import { injectable } from 'tsyringe';

@injectable()
export class ConversationService {
  constructor(private readonly prisma: PrismaClient) {}

  async initiateConversation(senderId: string, receiverId: string) {
    // Check if conversation already exists
    const existingConversation = await this.prisma.conversation.findFirst({
      where: {
        OR: [
          {
            AND: [{ senderId }, { receiverId }]
          },
          {
            AND: [{ senderId: receiverId }, { receiverId: senderId }]
          }
        ]
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
      return existingConversation;
    }

    // Create new conversation
    return this.prisma.conversation.create({
      data: {
        senderId,
        receiverId
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
  }
}
