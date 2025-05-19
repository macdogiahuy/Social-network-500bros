import { IConversation, IMessage } from '@/interfaces/conversation';
import { axiosInstance } from './axios-instance';

export const initiateConversation = async (
  receiverId: string,
): Promise<{ data: IConversation }> => {
  const response = await axiosInstance.post('/conversations/initiate', {
    receiverId,
  });
  return response.data;
};

export const sendMessage = async (
  conversationId: string,
  content: string,
): Promise<{ data: IMessage }> => {
  const response = await axiosInstance.post(
    `/conversations/${conversationId}/messages`,
    {
      content,
    },
  );
  return response.data;
};

export const getConversations = async (): Promise<{
  data: IConversation[];
}> => {
  const response = await axiosInstance.get('/conversations');
  return response.data;
};

export const getConversationMessages = async (
  conversationId: string,
): Promise<{ data: IMessage[] }> => {
  const response = await axiosInstance.get(
    `/conversations/${conversationId}/messages`,
  );
  return response.data;
};
