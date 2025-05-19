import { IUserSimple } from './user';

export interface IMessage {
  id: string;
  content: string;
  conversationId: string;
  senderId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IConversation {
  id: string;
  senderId: string;
  receiverId: string;
  sender: IUserSimple;
  receiver: IUserSimple;
  messages?: IMessage[];
  createdAt: string;
  updatedAt: string;
}
