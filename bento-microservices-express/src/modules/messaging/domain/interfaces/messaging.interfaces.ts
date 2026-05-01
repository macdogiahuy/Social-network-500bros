import { Conversation, Message } from '../entities/conversation.entity';

export interface IMessagingRepository {
  listConversations(userId: string, limit: number): Promise<Conversation[]>;
  createDirectConversation(creatorId: string, participantId: string): Promise<string>;
  ensureParticipant(roomId: string, userId: string): Promise<boolean>;
  sendMessage(input: {
    roomId: string;
    senderId: string;
    content?: string;
    fileUrl?: string;
  }): Promise<Message>;
  setReaction(input: { messageId: string; userId: string; emoji: string }): Promise<boolean>;
  removeMessageByOwner(messageId: string, userId: string): Promise<boolean>;
  removeMessageById(messageId: string): Promise<boolean>;
  removeRoomByCreator(roomId: string, userId: string): Promise<boolean>;
  removeRoomById(roomId: string): Promise<boolean>;
}
