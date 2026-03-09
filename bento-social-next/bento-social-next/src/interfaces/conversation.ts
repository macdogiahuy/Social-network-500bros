import { IUserSimple } from './user';

export interface IMessage {
  id: string;
  content: string;
  conversationId: string;
  senderId: string;
  sender?: IUserSimple;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  createdAt: string;
  updatedAt: string;
  reactions?: {
    id: string;
    userId: string;
    emoji: string;
    user?: IUserSimple;
  }[];
}

export interface IConversation {
  id: string;
  senderId: string;
  receiverId?: string;
  sender: IUserSimple;
  receiver?: IUserSimple;
  messages?: IMessage[];
  createdAt: string;
  updatedAt: string;
  type?: 'DIRECT' | 'GROUP';
  name?: string;
  image?: string;
  participants?: {
    userId: string;
    user: IUserSimple;
  }[];
}
