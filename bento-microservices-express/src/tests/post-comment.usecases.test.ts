import test from 'node:test';
import assert from 'node:assert/strict';
import { DeletePostUseCase } from '../modules/post/application/use-cases/delete-post.usecase';
import { UpdatePostUseCase } from '../modules/post/application/use-cases/update-post.usecase';
import { DeleteCommentUseCase } from '../modules/comment/application/use-cases/delete-comment.usecase';
import { UpdateCommentUseCase } from '../modules/comment/application/use-cases/update-comment.usecase';
import { IPostRepository } from '../modules/post/domain/interfaces/post.interfaces';
import { PostProps } from '../modules/post/domain/entities/post.entity';
import { ICommentRepository } from '../modules/comment/domain/interfaces/comment.interfaces';
import { CommentProps } from '../modules/comment/domain/entities/comment.entity';

class FakePostRepository implements IPostRepository {
  public async create(_post: PostProps): Promise<void> {}
  public async findById(_id: string): Promise<PostProps | null> {
    return null;
  }
  public async findByIds(_ids: string[]): Promise<PostProps[]> {
    return [];
  }
  public async findRecentByAuthorIds(_authorIds: string[], _limit: number): Promise<PostProps[]> {
    return [];
  }
  public async search(_input: { keyword?: string; topicId?: string; limit: number }): Promise<PostProps[]> {
    return [];
  }
  public async updateByAuthor(
    id: string,
    authorId: string,
    _data: { content?: string; imageUrl?: string | null }
  ): Promise<boolean> {
    return id === 'p1' && authorId === 'u1';
  }
  public async deleteByAuthor(id: string, authorId: string): Promise<boolean> {
    return id === 'p1' && authorId === 'u1';
  }
  public async updateById(id: string, _data: { content?: string; imageUrl?: string | null }): Promise<boolean> {
    return id === 'p1';
  }
  public async deleteById(id: string): Promise<boolean> {
    return id === 'p1';
  }
}

class FakeCommentRepository implements ICommentRepository {
  public async create(_comment: CommentProps): Promise<void> {}
  public async listByPost(_postId: string, _limit: number): Promise<CommentProps[]> {
    return [];
  }
  public async findPostAuthorId(_postId: string): Promise<string | null> {
    return 'u1';
  }
  public async updateByAuthor(id: string, userId: string, _content: string): Promise<boolean> {
    return id === 'c1' && userId === 'u1';
  }
  public async deleteByAuthor(id: string, userId: string): Promise<boolean> {
    return id === 'c1' && userId === 'u1';
  }
  public async updateById(id: string, _content: string): Promise<boolean> {
    return id === 'c1';
  }
  public async deleteById(id: string): Promise<boolean> {
    return id === 'c1';
  }
}

test('post update/delete enforce ownership', async () => {
  const repo = new FakePostRepository();
  const updateUseCase = new UpdatePostUseCase(repo);
  const deleteUseCase = new DeletePostUseCase(repo);

  const updatedOwner = await updateUseCase.execute({
    id: 'p1',
    authorId: 'u1',
    role: 'user',
    content: 'updated'
  });
  const updatedOther = await updateUseCase.execute({
    id: 'p1',
    authorId: 'u2',
    role: 'user',
    content: 'updated'
  });
  const updatedAdmin = await updateUseCase.execute({
    id: 'p1',
    authorId: 'u2',
    role: 'admin',
    content: 'updated-by-admin'
  });
  const deletedOwner = await deleteUseCase.execute({ id: 'p1', authorId: 'u1', role: 'user' });
  const deletedOther = await deleteUseCase.execute({ id: 'p1', authorId: 'u2', role: 'user' });
  const deletedAdmin = await deleteUseCase.execute({ id: 'p1', authorId: 'u2', role: 'admin' });

  assert.equal(updatedOwner, true);
  assert.equal(updatedOther, false);
  assert.equal(updatedAdmin, true);
  assert.equal(deletedOwner, true);
  assert.equal(deletedOther, false);
  assert.equal(deletedAdmin, true);
});

test('comment update/delete enforce ownership', async () => {
  const repo = new FakeCommentRepository();
  const updateUseCase = new UpdateCommentUseCase(repo);
  const deleteUseCase = new DeleteCommentUseCase(repo);

  const updatedOwner = await updateUseCase.execute({
    id: 'c1',
    userId: 'u1',
    role: 'user',
    content: 'updated'
  });
  const updatedOther = await updateUseCase.execute({
    id: 'c1',
    userId: 'u2',
    role: 'user',
    content: 'updated'
  });
  const updatedAdmin = await updateUseCase.execute({
    id: 'c1',
    userId: 'u2',
    role: 'admin',
    content: 'updated-by-admin'
  });
  const deletedOwner = await deleteUseCase.execute({ id: 'c1', userId: 'u1', role: 'user' });
  const deletedOther = await deleteUseCase.execute({ id: 'c1', userId: 'u2', role: 'user' });
  const deletedAdmin = await deleteUseCase.execute({ id: 'c1', userId: 'u2', role: 'admin' });

  assert.equal(updatedOwner, true);
  assert.equal(updatedOther, false);
  assert.equal(updatedAdmin, true);
  assert.equal(deletedOwner, true);
  assert.equal(deletedOther, false);
  assert.equal(deletedAdmin, true);
});
