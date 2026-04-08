import { IConversationRepository } from '@modules/conversation/model';
import { IEventPublisher } from '@shared/components/redis-pubsub/interface';
import { AppEvent } from '@shared/model/event';
import {
  deleteCloudinaryAssetByUrl,
  uploadBufferToCloudinary
} from '@shared/services/cloudinary.service';
import { ErrNotFound } from '@shared/utils/error';

export class ConversationUseCase {
  constructor(
    private readonly repo: IConversationRepository,
    private readonly eventPublisher: IEventPublisher
  ) {}

  async getConversations(userId: string) {
    return this.repo.findRoomsByUserId(userId);
  }

  async initiateDirectConversation(creatorId: string, otherUserId: string) {
    const existing = await this.repo.findExistingDirectRoom(creatorId, otherUserId);
    if (existing) return { room: existing, isNew: false };

    const room = await this.repo.createDirectRoom(creatorId, otherUserId);
    return { room, isNew: true };
  }

  async initiateGroupConversation(
    creatorId: string,
    userIds: string[],
    name: string,
    file?: Express.Multer.File
  ) {
    let imageUrl: string | null = null;
    if (file) {
      const uploaded = await uploadBufferToCloudinary(file, {
        folder: 'social-network-500bros/conversations/groups',
        resourceType: 'image'
      });
      imageUrl = uploaded.secureUrl;
    }
    return this.repo.createGroupRoom(creatorId, userIds, name, imageUrl);
  }

  async getMessages(userId: string, roomId: string) {
    const inRoom = await this.repo.isUserInRoom(roomId, userId);
    if (!inRoom) throw ErrNotFound;

    return this.repo.findMessagesByRoomId(roomId);
  }

  async sendMessage(
    userId: string,
    roomId: string,
    content: string | null,
    file?: Express.Multer.File
  ) {
    const inRoom = await this.repo.isUserInRoom(roomId, userId);
    if (!inRoom) throw ErrNotFound;

    let fileUrl: string | null = null;
    let fileName: string | null = null;
    let fileSize: number | null = null;
    let fileType: string | null = null;

    if (file) {
      const uploaded = await uploadBufferToCloudinary(file, {
        folder: 'social-network-500bros/conversations/messages',
        resourceType: 'auto'
      });
      fileUrl = uploaded.secureUrl;
      fileName = file.originalname;
      fileSize = file.size;
      fileType = file.mimetype;
    }

    const message = await this.repo.createMessage({
      id: crypto.randomUUID(),
      content: content?.trim() || null,
      roomId,
      senderId: userId,
      fileUrl,
      fileName,
      fileSize,
      fileType
    });

    await this.repo.updateRoomTimestamp(roomId);

    const participantIds = await this.repo.getRoomParticipantIds(roomId);
    const recipients = participantIds.filter((id) => id !== userId);

    for (const receiverId of recipients) {
      await this.eventPublisher.publish(
        new AppEvent('NEW_MESSAGE', { receiverId, message: { ...message, reactions: [] } }, { senderId: userId })
      );
    }

    return message;
  }

  async deleteConversation(userId: string, roomId: string) {
    const inRoom = await this.repo.isUserInRoom(roomId, userId);
    if (!inRoom) throw ErrNotFound;

    await this.repo.deleteRoom(roomId);
  }

  async deleteMessage(userId: string, roomId: string, messageId: string) {
    const inRoom = await this.repo.isUserInRoom(roomId, userId);
    if (!inRoom) throw ErrNotFound;

    const message = await this.repo.findMessageById(messageId);
    if (!message || message.roomId !== roomId) throw ErrNotFound;

    if (message.senderId !== userId) {
      throw Object.assign(new Error('You can only delete your own messages'), { status: 403 });
    }

    await this.repo.deleteMessage(messageId);
    await this.repo.updateRoomTimestamp(roomId);

    if (message.fileUrl) {
      await deleteCloudinaryAssetByUrl(message.fileUrl);
    }

    const participantIds = await this.repo.getRoomParticipantIds(roomId);
    const recipients = participantIds.filter((id) => id !== userId);

    for (const receiverId of recipients) {
      await this.eventPublisher.publish(
        new AppEvent('MESSAGE_DELETED', { conversationId: roomId, messageId, receiverId }, { senderId: userId })
      );
    }
  }

  async reactToMessage(userId: string, roomId: string, messageId: string, emoji: string) {
    const inRoom = await this.repo.isUserInRoom(roomId, userId);
    if (!inRoom) throw ErrNotFound;

    const message = await this.repo.findMessageById(messageId);
    if (!message || message.roomId !== roomId) throw ErrNotFound;

    const existing = await this.repo.findReaction(messageId, userId);
    let action: string;
    let result: any;

    if (existing) {
      if (existing.emoji === emoji) {
        await this.repo.deleteReaction(existing.id);
        action = 'remove';
        result = { message: 'Reaction removed' };
      } else {
        result = await this.repo.updateReaction(existing.id, emoji);
        action = 'update';
      }
    } else {
      result = await this.repo.createReaction({
        id: crypto.randomUUID(),
        messageId,
        userId,
        emoji
      });
      action = 'add';
    }

    const participantIds = await this.repo.getRoomParticipantIds(roomId);
    const recipients = participantIds.filter((id) => id !== userId);

    for (const receiverId of recipients) {
      await this.eventPublisher.publish(
        new AppEvent(
          'MESSAGE_REACTION',
          { conversationId: roomId, messageId, userId, emoji: action === 'remove' ? existing?.emoji : emoji, action, receiverId },
          { senderId: userId }
        )
      );
    }

    return { action, result };
  }
}
