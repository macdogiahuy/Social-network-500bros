import { IConversation, IMessage } from '@/interfaces/conversation';
import axios from 'axios';
import axiosInstance from '../utils/axios';

const VERSION_PREFIX = '/v1';

export const initiateConversation = async (
  receiverId: string
): Promise<{ data: IConversation }> => {
  console.log('Initiating conversation with receiverId:', receiverId);
  console.log('Current token:', sessionStorage.getItem('token'));
  console.log(
    'Current Authorization header:',
    axiosInstance.defaults.headers.common['Authorization']
  );

  try {
    const response = await axiosInstance.post(
      `${VERSION_PREFIX}/conversations/initiate`,
      {
        receiverId,
      }
    );
    console.log('Conversation initiation response:', response);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Conversation initiation error:', error);
      console.error('Error response:', error.response?.data);
    } else {
      console.error('Unknown error:', error);
    }
    throw error;
  }
};

export const sendMessage = async (
  conversationId: string,
  content: string
): Promise<{ data: IMessage }> => {
  const response = await axiosInstance.post(
    `${VERSION_PREFIX}/conversations/${conversationId}/messages`,
    {
      content,
    }
  );
  return response.data;
};

export const getConversations = async (): Promise<{
  data: IConversation[];
}> => {
  const response = await axiosInstance.get(`${VERSION_PREFIX}/conversations`);
  return response.data;
};

export const getConversationMessages = async (
  conversationId: string
): Promise<{ data: IMessage[] }> => {
  const response = await axiosInstance.get(
    `${VERSION_PREFIX}/conversations/${conversationId}/messages`
  );
  return response.data;
};
