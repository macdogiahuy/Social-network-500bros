export interface IBookmarkRepository {
  savePost(userId: string, postId: string): Promise<boolean>;
  unsavePost(userId: string, postId: string): Promise<boolean>;
  listSavedPostIds(userId: string, limit: number): Promise<string[]>;
}
