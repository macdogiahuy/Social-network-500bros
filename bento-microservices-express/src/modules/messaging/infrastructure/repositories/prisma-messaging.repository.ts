import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { Conversation, Message } from '../../domain/entities/conversation.entity';
import { IMessagingRepository } from '../../domain/interfaces/messaging.interfaces';

type ConversationRow = {
  id: string;
  name: string | null;
  type: 'direct' | 'group';
  creatorId: string;
  createdAt: Date;
};

type MessageRow = {
  id: string;
  roomId: string;
  senderId: string | null;
  content: string | null;
  fileUrl: string | null;
  createdAt: Date;
};

export class PrismaMessagingRepository implements IMessagingRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async listConversations(userId: string, limit: number): Promise<Conversation[]> {
    const rows = await this.prisma.$queryRaw<ConversationRow[]>`
      SELECT r.id, r.name, r.type, r.creator_id as creatorId, r.created_at as createdAt
      FROM chat_rooms r
      INNER JOIN chat_room_participants p ON p.chat_rooms_id = r.id
      WHERE p.users_id = ${userId}
      ORDER BY r.updated_at DESC
      LIMIT ${Math.max(1, limit)}
    `;
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      creatorId: row.creatorId,
      createdAt: new Date(row.createdAt)
    }));
  }

  public async createDirectConversation(creatorId: string, participantId: string): Promise<string> {
    const roomId = randomUUID();
    await this.prisma.$transaction([
      this.prisma.$executeRaw`
        INSERT INTO chat_rooms (id, type, status, creator_id, created_at, updated_at)
        VALUES (${roomId}, 'direct', 'active', ${creatorId}, NOW(), NOW())
      `,
      this.prisma.$executeRaw`
        INSERT INTO chat_room_participants (chat_rooms_id, users_id, role, joined_at)
        VALUES (${roomId}, ${creatorId}, 'ADMIN', NOW())
      `,
      this.prisma.$executeRaw`
        INSERT INTO chat_room_participants (chat_rooms_id, users_id, role, joined_at)
        VALUES (${roomId}, ${participantId}, 'MEMBER', NOW())
      `
    ]);
    return roomId;
  }

  public async ensureParticipant(roomId: string, userId: string): Promise<boolean> {
    const rows = await this.prisma.$queryRaw<Array<{ usersId: string }>>`
      SELECT users_id as usersId
      FROM chat_room_participants
      WHERE chat_rooms_id = ${roomId} AND users_id = ${userId}
      LIMIT 1
    `;
    return rows.length > 0;
  }

  public async sendMessage(input: {
    roomId: string;
    senderId: string;
    content?: string;
    fileUrl?: string;
  }): Promise<Message> {
    const id = randomUUID();
    await this.prisma.$executeRaw`
      INSERT INTO chat_messages (id, content, file_url, room_id, sender_id, created_at, updated_at)
      VALUES (${id}, ${input.content ?? null}, ${input.fileUrl ?? null}, ${input.roomId}, ${input.senderId}, NOW(), NOW())
    `;

    const rows = await this.prisma.$queryRaw<MessageRow[]>`
      SELECT id, room_id as roomId, sender_id as senderId, content, file_url as fileUrl, created_at as createdAt
      FROM chat_messages
      WHERE id = ${id}
      LIMIT 1
    `;
    const row = rows[0];
    if (!row) {
      throw new Error('Failed to persist message');
    }
    return {
      id: row.id,
      roomId: row.roomId,
      senderId: row.senderId,
      content: row.content,
      fileUrl: row.fileUrl,
      createdAt: new Date(row.createdAt)
    };
  }

  public async setReaction(input: { messageId: string; userId: string; emoji: string }): Promise<boolean> {
    const existed = await this.prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM chat_message_reactions
      WHERE message_id = ${input.messageId} AND user_id = ${input.userId}
      LIMIT 1
    `;

    if (existed.length > 0) {
      await this.prisma.$executeRaw`
        UPDATE chat_message_reactions
        SET emoji = ${input.emoji}
        WHERE id = ${existed[0].id}
      `;
      return true;
    }

    await this.prisma.$executeRaw`
      INSERT INTO chat_message_reactions (id, emoji, created_at, message_id, user_id)
      VALUES (${randomUUID()}, ${input.emoji}, NOW(), ${input.messageId}, ${input.userId})
    `;
    return true;
  }

  public async removeMessageByOwner(messageId: string, userId: string): Promise<boolean> {
    const result = await this.prisma.$executeRaw`
      DELETE FROM chat_messages
      WHERE id = ${messageId} AND sender_id = ${userId}
    `;
    return Number(result) > 0;
  }

  public async removeMessageById(messageId: string): Promise<boolean> {
    const result = await this.prisma.$executeRaw`
      DELETE FROM chat_messages
      WHERE id = ${messageId}
    `;
    return Number(result) > 0;
  }

  public async removeRoomByCreator(roomId: string, userId: string): Promise<boolean> {
    const result = await this.prisma.$executeRaw`
      DELETE FROM chat_rooms
      WHERE id = ${roomId} AND creator_id = ${userId}
    `;
    return Number(result) > 0;
  }

  public async removeRoomById(roomId: string): Promise<boolean> {
    const result = await this.prisma.$executeRaw`
      DELETE FROM chat_rooms
      WHERE id = ${roomId}
    `;
    return Number(result) > 0;
  }
}
