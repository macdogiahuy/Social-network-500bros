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
  try {
    const response = await axiosInstance.post(
      `${VERSION_PREFIX}/conversations/initiate`,
      data
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error('Messaging is not available on this deployment yet.');
      }

      throw new Error(error.response?.data?.message || 'Failed to start conversation.');
    } else {
      throw error;
    }
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
