import { CommentProps } from '../entities/comment.entity';

export interface ICommentRepository {
  create(comment: CommentProps): Promise<void>;
  listByPost(postId: string, limit: number): Promise<CommentProps[]>;
  findPostAuthorId(postId: string): Promise<string | null>;
  updateByAuthor(id: string, userId: string, content: string): Promise<boolean>;
  deleteByAuthor(id: string, userId: string): Promise<boolean>;
  updateById(id: string, content: string): Promise<boolean>;
  deleteById(id: string): Promise<boolean>;
}
