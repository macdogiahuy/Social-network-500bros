import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { AddressInfo } from 'node:net';
import { buildRequireAuthMiddleware } from '../infrastructure/http/auth.middleware';
import { traceMiddleware } from '../infrastructure/http/trace.middleware';
import { buildAuthRouter } from '../modules/auth/interfaces/http/auth.routes';
import { AuthController } from '../modules/auth/interfaces/http/auth.controller';
import { buildPostRouter } from '../modules/post/interfaces/http/post.routes';
import { PostController } from '../modules/post/interfaces/http/post.controller';
import { ITokenService, TokenPayload } from '../modules/auth/domain/interfaces/token-service.interface';
import { buildBookmarkRouter } from '../modules/bookmark/interfaces/http/bookmark.routes';
import { BookmarkController } from '../modules/bookmark/interfaces/http/bookmark.controller';
import { buildProfileRouter } from '../modules/user/interfaces/http/profile.routes';
import { ProfileController } from '../modules/user/interfaces/http/profile.controller';
import { buildNotificationRouter } from '../modules/notification/interfaces/http/notification.routes';
import { NotificationController } from '../modules/notification/interfaces/http/notification.controller';
import { buildMessagingRouter } from '../modules/messaging/interfaces/http/messaging.routes';
import { MessagingController } from '../modules/messaging/interfaces/http/messaging.controller';

class FakeTokenService implements ITokenService {
  public async generate(payload: TokenPayload): Promise<string> {
    return `token:${payload.sub}:${payload.role}`;
  }

  public async verify(token: string): Promise<TokenPayload | null> {
    if (token === 'valid-token') {
      return {
        sub: 'u1',
        role: 'user'
      };
    }
    return null;
  }
}

class FakeRegisterUseCase {
  public async execute(): Promise<{
    token: string;
    user: { id: string; username: string; firstName: string; lastName: string; role: 'user' | 'admin' };
  }> {
    return {
      token: 'token:u1:user',
      user: {
        id: 'u1',
        username: 'alice',
        firstName: 'Alice',
        lastName: 'Nguyen',
        role: 'user'
      }
    };
  }
}

class FakeLoginUseCase {
  public async execute(): Promise<{
    token: string;
    user: { id: string; username: string; firstName: string; lastName: string; role: 'user' | 'admin' };
  }> {
    return {
      token: 'token:u1:user',
      user: {
        id: 'u1',
        username: 'alice',
        firstName: 'Alice',
        lastName: 'Nguyen',
        role: 'user'
      }
    };
  }
}

class FakeIntrospectUseCase {
  public async execute(): Promise<{ isValid: boolean; payload: TokenPayload | null }> {
    return {
      isValid: true,
      payload: { sub: 'u1', role: 'user' }
    };
  }
}

class FakeOAuthLoginUseCase {
  public async execute(): Promise<{
    token: string;
    user: { id: string; username: string; firstName: string; lastName: string; role: 'user' | 'admin' };
  }> {
    return {
      token: 'token:u1:user',
      user: {
        id: 'u1',
        username: 'oauth_google_abc123',
        firstName: 'Alice',
        lastName: 'Nguyen',
        role: 'user'
      }
    };
  }
}

class FakeCreatePostUseCase {
  public async execute(): Promise<string> {
    return 'p1';
  }
}

class FakeGetFeedUseCase {
  public async execute(): Promise<Array<{ id: string }>> {
    return [{ id: 'p1' }];
  }
}

class FakeGetPostDetailUseCase {
  public async execute(): Promise<null> {
    return null;
  }
}

class FakeExplorePostsUseCase {
  public async execute(): Promise<[]> {
    return [];
  }
}

class FakeUpdatePostUseCase {
  public async execute(): Promise<boolean> {
    return true;
  }
}

class FakeDeletePostUseCase {
  public async execute(): Promise<boolean> {
    return true;
  }
}

class FakeSavePostUseCase {
  public async execute(): Promise<boolean> {
    return true;
  }
}

class FakeUnsavePostUseCase {
  public async execute(): Promise<boolean> {
    return true;
  }
}

class FakeListSavedPostsUseCase {
  public async execute(): Promise<Array<{ id: string }>> {
    return [{ id: 'p1' }];
  }
}

class FakeUpdateProfileUseCase {
  public async execute(): Promise<boolean> {
    return true;
  }
}

class FakeGetProfileUseCase {
  public async execute(): Promise<{
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
  }> {
    return {
      id: 'u1',
      username: 'alice',
      firstName: 'Alice',
      lastName: 'Nguyen',
      bio: null,
      avatar: null,
      cover: null,
      websiteUrl: null,
      followerCount: 10,
      postCount: 5
    };
  }
}

class FakeListNotificationsUseCase {
  public async execute(): Promise<Array<{ id: string }>> {
    return [{ id: 'n1' }];
  }
}

class FakeMarkNotificationReadUseCase {
  public async execute(): Promise<boolean> {
    return true;
  }
}

class FakeMarkAllNotificationsReadUseCase {
  public async execute(): Promise<number> {
    return 1;
  }
}

class FakeListConversationsUseCase {
  public async execute(): Promise<Array<{ id: string }>> {
    return [{ id: 'room-1' }];
  }
}

class FakeSendMessageUseCase {
  public async execute(): Promise<{ id: string; roomId: string }> {
    return { id: 'm1', roomId: 'room-1' };
  }
}

class FakeReactMessageUseCase {
  public async execute(): Promise<boolean> {
    return true;
  }
}

class FakeDeleteMessageUseCase {
  public async execute(): Promise<boolean> {
    return true;
  }
}

class FakeDeleteRoomUseCase {
  public async execute(): Promise<boolean> {
    return true;
  }
}

const createTestServer = async () => {
  const app = express();
  app.use(express.json());
  app.use(traceMiddleware);

  const authController = new AuthController(
    new FakeRegisterUseCase() as never,
    new FakeLoginUseCase() as never,
    new FakeIntrospectUseCase() as never,
    new FakeOAuthLoginUseCase() as never
  );
  const postController = new PostController(
    new FakeCreatePostUseCase() as never,
    new FakeGetFeedUseCase() as never,
    new FakeGetPostDetailUseCase() as never,
    new FakeExplorePostsUseCase() as never,
    new FakeUpdatePostUseCase() as never,
    new FakeDeletePostUseCase() as never
  );
  const bookmarkController = new BookmarkController(
    new FakeSavePostUseCase() as never,
    new FakeUnsavePostUseCase() as never,
    new FakeListSavedPostsUseCase() as never
  );
  const profileController = new ProfileController(
    new FakeUpdateProfileUseCase() as never,
    new FakeGetProfileUseCase() as never
  );
  const notificationController = new NotificationController(
    new FakeListNotificationsUseCase() as never,
    new FakeMarkNotificationReadUseCase() as never,
    new FakeMarkAllNotificationsReadUseCase() as never
  );
  const messagingController = new MessagingController(
    new FakeListConversationsUseCase() as never,
    new FakeSendMessageUseCase() as never,
    new FakeReactMessageUseCase() as never,
    new FakeDeleteMessageUseCase() as never,
    new FakeDeleteRoomUseCase() as never
  );

  app.use('/v2', buildAuthRouter(authController));
  app.use('/v2', buildRequireAuthMiddleware(new FakeTokenService()), buildPostRouter(postController));
  app.use('/v2', buildRequireAuthMiddleware(new FakeTokenService()), buildBookmarkRouter(bookmarkController));
  app.use('/v2', buildRequireAuthMiddleware(new FakeTokenService()), buildProfileRouter(profileController));
  app.use('/v2', buildRequireAuthMiddleware(new FakeTokenService()), buildNotificationRouter(notificationController));
  app.use('/v2', buildRequireAuthMiddleware(new FakeTokenService()), buildMessagingRouter(messagingController));

  const server = await new Promise<import('node:http').Server>((resolve) => {
    const created = app.listen(0, () => resolve(created));
  });

  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  return {
    baseUrl,
    close: async () => {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
    }
  };
};

test('auth register rejects unknown fields', async () => {
  const server = await createTestServer();
  try {
    const response = await fetch(`${server.baseUrl}/v2/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        username: 'alice',
        firstName: 'Alice',
        lastName: 'Nguyen',
        password: 'password123',
        extra: 'forbidden'
      })
    });
    const body = (await response.json()) as { code: string; traceId: string };
    assert.equal(response.status, 400);
    assert.equal(body.code, 'VALIDATION_ERROR');
    assert.ok(Boolean(body.traceId));
  } finally {
    await server.close();
  }
});

test('auth oauth validates request body', async () => {
  const server = await createTestServer();
  try {
    const response = await fetch(`${server.baseUrl}/v2/auth/oauth`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ provider: 'facebook', accessToken: 'x' })
    });
    const body = (await response.json()) as { code: string; traceId: string };
    assert.equal(response.status, 400);
    assert.equal(body.code, 'VALIDATION_ERROR');
    assert.ok(Boolean(body.traceId));
  } finally {
    await server.close();
  }
});

test('auth oauth returns token envelope', async () => {
  const server = await createTestServer();
  try {
    const response = await fetch(`${server.baseUrl}/v2/auth/oauth`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        provider: 'google',
        accessToken: 'dev-google:abc123:alice%40example.com:Alice:Nguyen'
      })
    });
    const body = (await response.json()) as {
      code: string;
      details: { token: string; user: { username: string } };
      traceId: string;
    };
    assert.equal(response.status, 200);
    assert.equal(body.code, 'OK');
    assert.equal(body.details.user.username, 'oauth_google_abc123');
    assert.ok(Boolean(body.details.token));
    assert.ok(Boolean(body.traceId));
  } finally {
    await server.close();
  }
});

test('protected route requires bearer token', async () => {
  const server = await createTestServer();
  try {
    const response = await fetch(`${server.baseUrl}/v2/feed`);
    const body = (await response.json()) as { code: string };
    assert.equal(response.status, 401);
    assert.equal(body.code, 'UNAUTHORIZED');
  } finally {
    await server.close();
  }
});

test('protected route returns envelope with valid token', async () => {
  const server = await createTestServer();
  try {
    const response = await fetch(`${server.baseUrl}/v2/feed`, {
      headers: {
        authorization: 'Bearer valid-token'
      }
    });
    const body = (await response.json()) as { code: string; details: Array<{ id: string }>; traceId: string };
    assert.equal(response.status, 200);
    assert.equal(body.code, 'OK');
    assert.equal(body.details[0]?.id, 'p1');
    assert.ok(Boolean(body.traceId));
  } finally {
    await server.close();
  }
});

test('bookmark list returns envelope', async () => {
  const server = await createTestServer();
  try {
    const response = await fetch(`${server.baseUrl}/v2/bookmarks`, {
      headers: { authorization: 'Bearer valid-token' }
    });
    const body = (await response.json()) as { code: string; details: Array<{ id: string }> };
    assert.equal(response.status, 200);
    assert.equal(body.code, 'OK');
    assert.equal(body.details[0]?.id, 'p1');
  } finally {
    await server.close();
  }
});

test('profile update validates request body', async () => {
  const server = await createTestServer();
  try {
    const response = await fetch(`${server.baseUrl}/v2/users/profile`, {
      method: 'PATCH',
      headers: {
        authorization: 'Bearer valid-token',
        'content-type': 'application/json'
      },
      body: JSON.stringify({})
    });
    const body = (await response.json()) as { code: string };
    assert.equal(response.status, 400);
    assert.equal(body.code, 'VALIDATION_ERROR');
  } finally {
    await server.close();
  }
});

test('profile get returns envelope', async () => {
  const server = await createTestServer();
  try {
    const response = await fetch(`${server.baseUrl}/v2/users/profile`, {
      headers: { authorization: 'Bearer valid-token' }
    });
    const body = (await response.json()) as {
      code: string;
      details: { id: string; username: string; followerCount: number };
      traceId: string;
    };
    assert.equal(response.status, 200);
    assert.equal(body.code, 'OK');
    assert.equal(body.details.id, 'u1');
    assert.equal(body.details.username, 'alice');
    assert.equal(body.details.followerCount, 10);
    assert.ok(Boolean(body.traceId));
  } finally {
    await server.close();
  }
});

test('notifications list returns envelope', async () => {
  const server = await createTestServer();
  try {
    const response = await fetch(`${server.baseUrl}/v2/notifications`, {
      headers: { authorization: 'Bearer valid-token' }
    });
    const body = (await response.json()) as { code: string; details: Array<{ id: string }> };
    assert.equal(response.status, 200);
    assert.equal(body.code, 'OK');
    assert.equal(body.details[0]?.id, 'n1');
  } finally {
    await server.close();
  }
});

test('notifications mark-read and mark-all-read return envelope', async () => {
  const server = await createTestServer();
  try {
    const markOne = await fetch(`${server.baseUrl}/v2/notifications/n1/read`, {
      method: 'PATCH',
      headers: { authorization: 'Bearer valid-token' }
    });
    const markOneBody = (await markOne.json()) as { code: string; details: { updated: boolean } };
    assert.equal(markOne.status, 200);
    assert.equal(markOneBody.code, 'OK');
    assert.equal(markOneBody.details.updated, true);

    const markAll = await fetch(`${server.baseUrl}/v2/notifications/read-all`, {
      method: 'PATCH',
      headers: { authorization: 'Bearer valid-token' }
    });
    const markAllBody = (await markAll.json()) as { code: string; details: { updated: number } };
    assert.equal(markAll.status, 200);
    assert.equal(markAllBody.code, 'OK');
    assert.equal(markAllBody.details.updated, 1);
  } finally {
    await server.close();
  }
});

test('messaging send validates body', async () => {
  const server = await createTestServer();
  try {
    const response = await fetch(`${server.baseUrl}/v2/messages`, {
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-token',
        'content-type': 'application/json'
      },
      body: JSON.stringify({ roomId: 'not-a-uuid' })
    });
    const body = (await response.json()) as { code: string };
    assert.equal(response.status, 400);
    assert.equal(body.code, 'VALIDATION_ERROR');
  } finally {
    await server.close();
  }
});

test('messaging list returns envelope', async () => {
  const server = await createTestServer();
  try {
    const response = await fetch(`${server.baseUrl}/v2/conversations`, {
      headers: { authorization: 'Bearer valid-token' }
    });
    const body = (await response.json()) as { code: string; details: Array<{ id: string }> };
    assert.equal(response.status, 200);
    assert.equal(body.code, 'OK');
    assert.equal(body.details[0]?.id, 'room-1');
  } finally {
    await server.close();
  }
});
