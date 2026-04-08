export interface ChatRoom {
  id: string;
  name: string | null;
  image: string | null;
  type: 'direct' | 'group';
  status: 'pending' | 'active' | 'deleted';
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface ChatMessage {
  id: string;
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  fileType: string | null;
  roomId: string;
  senderId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessageReaction {
  id: string;
  emoji: string;
  messageId: string;
  userId: string;
  createdAt: Date;
}

export interface IConversationRepository {
  findRoomsByUserId(userId: string): Promise<any[]>;
  findRoomById(roomId: string): Promise<any | null>;
  isUserInRoom(roomId: string, userId: string): Promise<boolean>;
  createDirectRoom(creatorId: string, otherUserId: string): Promise<any>;
  createGroupRoom(creatorId: string, userIds: string[], name: string, image: string | null): Promise<any>;
  findExistingDirectRoom(userA: string, userB: string): Promise<any | null>;
  deleteRoom(roomId: string): Promise<void>;

  findMessagesByRoomId(roomId: string): Promise<any[]>;
  findMessageById(messageId: string): Promise<any | null>;
  createMessage(data: {
    id: string;
    content: string | null;
    roomId: string;
    senderId: string;
    fileUrl?: string | null;
    fileName?: string | null;
    fileSize?: number | null;
    fileType?: string | null;
  }): Promise<any>;
  deleteMessage(messageId: string): Promise<void>;

  findReaction(messageId: string, userId: string): Promise<any | null>;
  createReaction(data: { id: string; messageId: string; userId: string; emoji: string }): Promise<any>;
  updateReaction(reactionId: string, emoji: string): Promise<any>;
  deleteReaction(reactionId: string): Promise<void>;
  deleteReactionsByMessageId(messageId: string): Promise<void>;

  updateRoomTimestamp(roomId: string): Promise<void>;
  getRoomParticipantIds(roomId: string): Promise<string[]>;
}
