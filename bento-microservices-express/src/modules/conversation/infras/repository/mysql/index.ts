import { IConversationRepository } from '@modules/conversation/model';
import prisma from '@shared/components/prisma';

const USER_SELECT = {
  id: true,
  username: true,
  firstName: true,
  lastName: true,
  avatar: true
};

export class MysqlConversationRepository implements IConversationRepository {
  async findRoomsByUserId(userId: string) {
    return prisma.chatRooms.findMany({
      where: {
        participants: { some: { usersId: userId } }
      },
      include: {
        participants: {
          include: { users: { select: USER_SELECT } }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: { sender: { select: USER_SELECT } }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async findRoomById(roomId: string) {
    return prisma.chatRooms.findUnique({
      where: { id: roomId },
      include: {
        participants: {
          include: { users: { select: USER_SELECT } }
        }
      }
    });
  }

  async isUserInRoom(roomId: string, userId: string): Promise<boolean> {
    const participant = await prisma.chatRoomParticipants.findUnique({
      where: { chatRoomsId_usersId: { chatRoomsId: roomId, usersId: userId } }
    });
    return !!participant;
  }

  async findExistingDirectRoom(userA: string, userB: string) {
    const rooms = await prisma.chatRooms.findMany({
      where: {
        type: 'direct',
        AND: [
          { participants: { some: { usersId: userA } } },
          { participants: { some: { usersId: userB } } }
        ]
      },
      include: {
        participants: {
          include: { users: { select: USER_SELECT } }
        },
        messages: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: { select: USER_SELECT },
            reactions: {
              include: { user: { select: USER_SELECT } }
            }
          }
        }
      }
    });
    return rooms[0] || null;
  }

  async createDirectRoom(creatorId: string, otherUserId: string) {
    return prisma.chatRooms.create({
      data: {
        id: crypto.randomUUID(),
        type: 'direct',
        status: 'active',
        creatorId,
        participants: {
          create: [{ usersId: creatorId }, { usersId: otherUserId }]
        }
      },
      include: {
        participants: {
          include: { users: { select: USER_SELECT } }
        }
      }
    });
  }

  async createGroupRoom(creatorId: string, userIds: string[], name: string, image: string | null) {
    const allUserIds = [creatorId, ...userIds];
    return prisma.chatRooms.create({
      data: {
        id: crypto.randomUUID(),
        type: 'group',
        status: 'active',
        name,
        image,
        creatorId,
        participants: {
          create: allUserIds.map((uid, idx) => ({
            usersId: uid,
            role: uid === creatorId ? 'ADMIN' : 'MEMBER'
          }))
        }
      },
      include: {
        participants: {
          include: { users: { select: USER_SELECT } }
        }
      }
    });
  }

  async deleteRoom(roomId: string) {
    await prisma.$transaction([
      prisma.chatMessageReactions.deleteMany({
        where: { message: { roomId } }
      }),
      prisma.chatMessages.deleteMany({ where: { roomId } }),
      prisma.chatRoomParticipants.deleteMany({ where: { chatRoomsId: roomId } }),
      prisma.chatRooms.delete({ where: { id: roomId } })
    ]);
  }

  async findMessagesByRoomId(roomId: string) {
    return prisma.chatMessages.findMany({
      where: { roomId },
      include: {
        sender: { select: USER_SELECT },
        reactions: {
          include: { user: { select: USER_SELECT } }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  async findMessageById(messageId: string) {
    return prisma.chatMessages.findUnique({
      where: { id: messageId }
    });
  }

  async createMessage(data: {
    id: string;
    content: string | null;
    roomId: string;
    senderId: string;
    fileUrl?: string | null;
    fileName?: string | null;
    fileSize?: number | null;
    fileType?: string | null;
  }) {
    return prisma.chatMessages.create({
      data: {
        id: data.id,
        content: data.content,
        roomId: data.roomId,
        senderId: data.senderId,
        fileUrl: data.fileUrl ?? null,
        fileName: data.fileName ?? null,
        fileSize: data.fileSize ?? null,
        fileType: data.fileType ?? null
      },
      include: {
        sender: { select: USER_SELECT }
      }
    });
  }

  async deleteMessage(messageId: string) {
    await prisma.$transaction([
      prisma.chatMessageReactions.deleteMany({ where: { messageId } }),
      prisma.chatMessages.delete({ where: { id: messageId } })
    ]);
  }

  async findReaction(messageId: string, userId: string) {
    return prisma.chatMessageReactions.findFirst({
      where: { messageId, userId }
    });
  }

  async createReaction(data: { id: string; messageId: string; userId: string; emoji: string }) {
    return prisma.chatMessageReactions.create({ data });
  }

  async updateReaction(reactionId: string, emoji: string) {
    return prisma.chatMessageReactions.update({
      where: { id: reactionId },
      data: { emoji }
    });
  }

  async deleteReaction(reactionId: string) {
    await prisma.chatMessageReactions.delete({ where: { id: reactionId } });
  }

  async deleteReactionsByMessageId(messageId: string) {
    await prisma.chatMessageReactions.deleteMany({ where: { messageId } });
  }

  async updateRoomTimestamp(roomId: string) {
    await prisma.chatRooms.update({
      where: { id: roomId },
      data: { updatedAt: new Date() }
    });
  }

  async getRoomParticipantIds(roomId: string): Promise<string[]> {
    const participants = await prisma.chatRoomParticipants.findMany({
      where: { chatRoomsId: roomId },
      select: { usersId: true }
    });
    return participants.map((p) => p.usersId);
  }
}
