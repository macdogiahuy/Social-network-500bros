import axiosInstance, { endpoints } from '@/utils/axios';

import { IApiResponse } from '@/interfaces/api-response';
import { IPost } from '@/interfaces/post';
import { CreatePost, UpdatePost } from '@/schema/posts-schema';
import { isValidUUID } from '@/utils/uuid-validator';

//--------------------------------------------------------------------------------------------

export const getPosts = async (params?: {
  str?: string;
  limit?: number;
  userId?: string;
  type?: string;
}): Promise<IApiResponse<IPost[]>> => {
  const response = await axiosInstance.get<IApiResponse<IPost[]>>(
    endpoints.post.get,
    {
      params,
    }
  );
  return response.data;
};

export const getPostDetail = async (
  id: string
): Promise<IApiResponse<IPost>> => {
  if (!isValidUUID(id)) {
    throw new Error('Invalid post ID format');
  }
  const response = await axiosInstance.get(`${endpoints.post.get}/${id}`);
  return response.data;
};

export const createPost = async (
  data: CreatePost
): Promise<IApiResponse<string>> => {
  const { image, ...rest } = data;

  const response = await axiosInstance.post(
    endpoints.post.create,
    image ? data : rest
  );

  return response.data;
};

export const likePost = async (
  postId: string
): Promise<IApiResponse<string>> => {
  if (!isValidUUID(postId)) {
    throw new Error('Invalid post ID format');
  }
  const response = await axiosInstance.post(endpoints.post.like(postId));
  return response.data;
};

export const unlikePost = async (
  postId: string
): Promise<IApiResponse<string>> => {
  if (!isValidUUID(postId)) {
    throw new Error('Invalid post ID format');
  }
  const response = await axiosInstance.delete(endpoints.post.unlike(postId));
  return response.data;
};

export const savePost = async (
  postId: string
): Promise<IApiResponse<string>> => {
  if (!isValidUUID(postId)) {
    throw new Error('Invalid post ID format');
  }
  const response = await axiosInstance.post(endpoints.post.save(postId));
  return response.data;
};

export const unsavePost = async (
  postId: string
): Promise<IApiResponse<string>> => {
  if (!isValidUUID(postId)) {
    throw new Error('Invalid post ID format');
  }
  const response = await axiosInstance.post(endpoints.post.unsave(postId));
  return response.data;
};

export const updatePost = async (
  data: UpdatePost
): Promise<IApiResponse<string>> => {
  if (!data.id || !isValidUUID(data.id)) {
    throw new Error('Invalid post ID format');
  }
  const response = await axiosInstance.patch(
    endpoints.post.update(data.id as string),
    data
  );

  return response.data;
};

export const deletePost = async (id: string): Promise<IApiResponse<string>> => {
  if (!isValidUUID(id)) {
    throw new Error('Invalid post ID format');
  }
  const response = await axiosInstance.delete(endpoints.post.update(id));

  return response.data;
};
