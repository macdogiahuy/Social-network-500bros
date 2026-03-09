import { IConversation, IMessage } from '@/interfaces/conversation';
import axios from 'axios';
import axiosInstance from '../utils/axios';

const VERSION_PREFIX = '/v1';

export const initiateConversation = async (data: {
  receiverId?: string;
  userIds?: string[];
  name?: string;
  image?: string;
}): Promise<{ data: IConversation }> => {
  console.log('Initiating conversation with data:', data);
  console.log('Current token:', sessionStorage.getItem('token'));
  console.log(
    'Current Authorization header:',
    axiosInstance.defaults.headers.common['Authorization']
  );

  try {
    const response = await axiosInstance.post(
      `${VERSION_PREFIX}/conversations/initiate`,
      data
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
  content: string,
  file?: File
): Promise<{ data: IMessage }> => {
  let response;

  if (file) {
    const formData = new FormData();
    formData.append('content', content || '');
    formData.append('file', file);

    response = await axiosInstance.post(
      `${VERSION_PREFIX}/conversations/${conversationId}/messages`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  } else {
    response = await axiosInstance.post(
      `${VERSION_PREFIX}/conversations/${conversationId}/messages`,
      {
        content,
      }
    );
  }
  return response.data;
};

export const reactToMessage = async (
  conversationId: string,
  messageId: string,
  emoji: string
) => {
  const response = await axiosInstance.post(
    `${VERSION_PREFIX}/conversations/${conversationId}/messages/${messageId}/reactions`,
    {
      emoji,
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

export const deleteConversation = async (
  conversationId: string
): Promise<void> => {
  await axiosInstance.delete(
    `${VERSION_PREFIX}/conversations/${conversationId}`
  );
};
