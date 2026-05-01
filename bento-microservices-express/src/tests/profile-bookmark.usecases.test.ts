import test from 'node:test';
import assert from 'node:assert/strict';
import { ListSavedPostsUseCase } from '../modules/bookmark/application/use-cases/list-saved-posts.usecase';
import { SavePostUseCase } from '../modules/bookmark/application/use-cases/save-post.usecase';
import { UnsavePostUseCase } from '../modules/bookmark/application/use-cases/unsave-post.usecase';
import { IBookmarkRepository } from '../modules/bookmark/domain/interfaces/bookmark.interfaces';
import { PostProps } from '../modules/post/domain/entities/post.entity';
import { IPostRepository } from '../modules/post/domain/interfaces/post.interfaces';
import { UpdateProfileUseCase } from '../modules/user/application/use-cases/update-profile.usecase';
import { IUserRepository } from '../modules/user/domain/interfaces/user.interfaces';

class FakeBookmarkRepository implements IBookmarkRepository {
  public async savePost(_userId: string, _postId: string): Promise<boolean> {
    return true;
  }
  public async unsavePost(_userId: string, _postId: string): Promise<boolean> {
    return true;
  }
  public async listSavedPostIds(_userId: string, _limit: number): Promise<string[]> {
    return ['p1'];
  }
}

class FakePostRepository implements IPostRepository {
  public async create(_post: PostProps): Promise<void> {}
  public async findById(_id: string): Promise<PostProps | null> {
    return null;
  }
  public async findByIds(ids: string[]): Promise<PostProps[]> {
    return ids.map((id) => ({
      id,
      authorId: 'u1',
      topicId: 't1',
      content: 'saved post',
      imageUrl: null,
      createdAt: new Date()
    }));
  }
  public async findRecentByAuthorIds(_authorIds: string[], _limit: number): Promise<PostProps[]> {
    return [];
  }
  public async search(_input: { keyword?: string; topicId?: string; limit: number }): Promise<PostProps[]> {
    return [];
  }
  public async updateByAuthor(
    _id: string,
    _authorId: string,
    _data: { content?: string; imageUrl?: string | null }
  ): Promise<boolean> {
    return false;
  }
  public async deleteByAuthor(_id: string, _authorId: string): Promise<boolean> {
    return false;
  }
  public async updateById(
    _id: string,
    _data: { content?: string; imageUrl?: string | null }
  ): Promise<boolean> {
    return false;
  }
  public async deleteById(_id: string): Promise<boolean> {
    return false;
  }
}

class FakeUserRepository implements IUserRepository {
  public async exists(_userId: string): Promise<boolean> {
    return true;
  }
  public async getProfile(_userId: string): Promise<{
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    bio: string | null;
    avatar: string | null;
    cover: string | null;
    websiteUrl: string | null;
    followerCount: number;
    postCount: number;
  } | null> {
    return {
      id: 'u1',
      username: 'alice',
      firstName: 'Alice',
      lastName: 'Nguyen',
      bio: null,
      avatar: null,
      cover: null,
      websiteUrl: null,
      followerCount: 0,
      postCount: 0
    };
  }
  public async updateProfile(
    _userId: string,
    _data: {
      firstName?: string;
      lastName?: string;
      bio?: string | null;
      avatar?: string | null;
      cover?: string | null;
      websiteUrl?: string | null;
    }
  ): Promise<boolean> {
    return true;
  }
}

test('bookmark save/list/unsave flow works', async () => {
  const bookmarkRepo = new FakeBookmarkRepository();
  const postRepo = new FakePostRepository();

  const saveUseCase = new SavePostUseCase(bookmarkRepo);
  const listUseCase = new ListSavedPostsUseCase(bookmarkRepo, postRepo);
  const unsaveUseCase = new UnsavePostUseCase(bookmarkRepo);

  const saved = await saveUseCase.execute({ userId: 'u1', postId: 'p1' });
  const list = await listUseCase.execute({ userId: 'u1', limit: 10 });
  const unsaved = await unsaveUseCase.execute({ userId: 'u1', postId: 'p1' });

  assert.equal(saved, true);
  assert.equal(list.length, 1);
  assert.equal(list[0]?.id, 'p1');
  assert.equal(unsaved, true);
});

test('update profile usecase delegates to repository', async () => {
  const useCase = new UpdateProfileUseCase(new FakeUserRepository());
  const updated = await useCase.execute({
    userId: 'u1',
    firstName: 'Alice',
    bio: 'hello world'
  });
  assert.equal(updated, true);
});
