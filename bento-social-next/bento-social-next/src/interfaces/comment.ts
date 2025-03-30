import { IUserSimple } from './user';

export interface ICommment {
  id: string;
  content: string;
  author: IUserSimple;
  createdAt: string;
  likedCount: number;
  hasLiked: boolean;
  replyCount: number;
  replies?: IChildComment[];
}

export interface IChildComment {
  id: string;
  content: string;
  author: IUserSimple;
  createdAt: string;
  parentId: string;
  likedCount: number;
  hasLiked: boolean;
}

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
