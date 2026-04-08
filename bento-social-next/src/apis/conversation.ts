import axiosInstance, { endpoints } from '@/utils/axios';
import { IApiResponse } from '@/interfaces/api-response';

//--------------------------------------------------------------------------------------------

export interface IChatRoom {
  id: string;
  name: string | null;
  image: string | null;
  type: 'direct' | 'group';
  status: string;
  createdAt: string;
  updatedAt: string;
  participants: IChatParticipant[];
  messages?: IChatMessage[];
}

export interface IChatParticipant {
  usersId: string;
  chatRoomsId: string;
  role: string;
  joinedAt: string;
  users: IChatUser;
}

export interface IChatUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
}

export interface IChatMessage {
  id: string;
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  fileType: string | null;
  roomId: string;
  senderId: string | null;
  createdAt: string;
  updatedAt: string;
  sender?: IChatUser;
  reactions?: IChatReaction[];
}

export interface IChatReaction {
  id: string;
  emoji: string;
  messageId: string;
  userId: string;
  user?: IChatUser;
}

export const getConversations = async (): Promise<IApiResponse<IChatRoom[]>> => {
  const { data } = await axiosInstance.get(endpoints.conversation.get);
  return data;
};

export const initiateConversation = async (payload: {
  receiverId?: string;
  userIds?: string[];
  name?: string;
}): Promise<IApiResponse<IChatRoom>> => {
  const { data } = await axiosInstance.post(endpoints.conversation.initiate, payload);
  return data;
};

export const getMessages = async (roomId: string): Promise<IApiResponse<IChatMessage[]>> => {
  const { data } = await axiosInstance.get(endpoints.conversation.messages(roomId));
  return data;
};

export const sendMessage = async (
  roomId: string,
  payload: { content?: string },
  file?: File
): Promise<IApiResponse<IChatMessage>> => {
  if (file) {
    const formData = new FormData();
    if (payload.content) formData.append('content', payload.content);
    formData.append('file', file);
    const { data } = await axiosInstance.post(endpoints.conversation.messages(roomId), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }
  const { data } = await axiosInstance.post(endpoints.conversation.messages(roomId), payload);
  return data;
};

export const deleteConversation = async (roomId: string): Promise<IApiResponse<void>> => {
  const { data } = await axiosInstance.delete(endpoints.conversation.deleteRoom(roomId));
  return data;
};

export const deleteMessage = async (roomId: string, messageId: string): Promise<IApiResponse<void>> => {
  const { data } = await axiosInstance.delete(endpoints.conversation.deleteMessage(roomId, messageId));
  return data;
};

export const reactToMessage = async (
  roomId: string,
  messageId: string,
  emoji: string
): Promise<IApiResponse<IChatReaction>> => {
  const { data } = await axiosInstance.post(endpoints.conversation.reactToMessage(roomId, messageId), { emoji });
  return data;
};
