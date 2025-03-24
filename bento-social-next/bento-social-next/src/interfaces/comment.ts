import { User } from './user';

export interface ICommment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  likedCount: number;
  hasLiked: boolean;
  replyCount: number;
  replies: IChilrenComment[];
}

export interface IChilrenComment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  parentId: string;
  likedCount: number;
  hasLiked: boolean;
}
