export interface ILikeRepository {
  likePost(postId: string, userId: string): Promise<boolean>;
}

export interface ILikeReadRepository {
  findPostAuthorId(postId: string): Promise<string | null>;
}
