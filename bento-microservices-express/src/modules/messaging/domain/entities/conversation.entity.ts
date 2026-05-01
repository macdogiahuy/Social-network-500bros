export type Conversation = {
  id: string;
  name: string | null;
  type: 'direct' | 'group';
  creatorId: string;
  createdAt: Date;
};

export type Message = {
  id: string;
  roomId: string;
  senderId: string | null;
  content: string | null;
  fileUrl: string | null;
  createdAt: Date;
};
