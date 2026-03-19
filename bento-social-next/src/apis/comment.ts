import axiosInstance, { endpoints } from '@/utils/axios';

import { IApiResponse } from '@/interfaces/api-response';
import { IChildComment, ICommment } from '@/interfaces/comment';
import { isValidUUID } from '@/utils/uuid-validator';

//--------------------------------------------------------------------------------------------

export const getComments = async (
  postId: string
): Promise<IApiResponse<ICommment[]>> => {
  if (!isValidUUID(postId)) {
    throw new Error('ID bài viết không hợp lệ');
  }
  const response = await axiosInstance.get(
    endpoints.comment.getComments(postId)
  );
  return response.data;
};

export const getReplies = async (
  commentId: string
): Promise<IApiResponse<IChildComment[]>> => {
  if (!isValidUUID(commentId)) {
    throw new Error('ID comment không hợp lệ');
  }
  const response = await axiosInstance.get(
    endpoints.comment.getReplies(commentId)
  );
  return response.data;
};

export const createComment = async (
  postId: string,
  content: string
): Promise<IApiResponse<ICommment>> => {
  if (!isValidUUID(postId)) {
    throw new Error('ID bài viết không hợp lệ');
  }
  const response = await axiosInstance.post(endpoints.comment.create(postId), {
    content,
  });
  return response.data;
};

export const createReply = async (
  commentId: string,
  content: string
): Promise<IApiResponse<IChildComment>> => {
  if (!isValidUUID(commentId)) {
    throw new Error('ID comment không hợp lệ');
  }
  const response = await axiosInstance.post(
    endpoints.comment.reply(commentId),
    {
      content,
    }
  );
  return response.data;
};

export const updateComment = async (
  commentId: string,
  content: string
): Promise<IApiResponse<string>> => {
  if (!isValidUUID(commentId)) {
    throw new Error('ID comment không hợp lệ');
  }
  const response = await axiosInstance.patch(
    endpoints.comment.update(commentId),
    {
      content,
    }
  );
  return response.data;
};

export const deleteComment = async (
  commentId: string
): Promise<IApiResponse<string>> => {
  if (!isValidUUID(commentId)) {
    throw new Error('ID comment không hợp lệ');
  }
  const response = await axiosInstance.delete(
    endpoints.comment.delete(commentId)
  );
  return response.data;
};

export const likeComment = async (
  commentId: string
): Promise<IApiResponse<string>> => {
  if (!isValidUUID(commentId)) {
    throw new Error('ID comment không hợp lệ');
  }
  const response = await axiosInstance.post(endpoints.comment.like(commentId));
  return response.data;
};

export const unlikeComment = async (
  commentId: string
): Promise<IApiResponse<string>> => {
  if (!isValidUUID(commentId)) {
    throw new Error('ID comment không hợp lệ');
  }
  const response = await axiosInstance.delete(
    endpoints.comment.unlike(commentId)
  );
  return response.data;
};

export const getReplyComments = async (
  commentId: string
): Promise<IApiResponse<IChildComment[]>> => {
  if (!isValidUUID(commentId)) {
    throw new Error('ID comment không hợp lệ');
  }
  const response = await axiosInstance.get(
    endpoints.comment.getReplies(commentId)
  );
  return response.data;
};
