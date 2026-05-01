import { PrismaClient } from '@prisma/client';
import { RequestHandler, Router } from 'express';
import { RedisFeedCacheRepository } from '../cache/redis-feed-cache.repository';
import { InMemoryEventBus } from '../event/in-memory-event-bus';
import { CreatePostUseCase } from '../../modules/post/application/use-cases/create-post.usecase';
import { DeletePostUseCase } from '../../modules/post/application/use-cases/delete-post.usecase';
import { ExplorePostsUseCase } from '../../modules/post/application/use-cases/explore-posts.usecase';
import { GetFeedUseCase } from '../../modules/post/application/use-cases/get-feed.usecase';
import { GetPostDetailUseCase } from '../../modules/post/application/use-cases/get-post-detail.usecase';
import { UpdatePostUseCase } from '../../modules/post/application/use-cases/update-post.usecase';
import {
  PrismaPostRepository,
  PrismaUserFollowRepository
} from '../../modules/post/infrastructure/repositories/prisma-post.repository';
import { PostCreatedFeedProjector } from '../../modules/post/infrastructure/events/post-created-feed.projector';
import { PostController } from '../../modules/post/interfaces/http/post.controller';
import { buildPostRouter } from '../../modules/post/interfaces/http/post.routes';
import { FollowUserUseCase } from '../../modules/user/application/use-cases/follow-user.usecase';
import { UnfollowUserUseCase } from '../../modules/user/application/use-cases/unfollow-user.usecase';
import { FollowController } from '../../modules/user/interfaces/http/follow.controller';
import { buildFollowRouter } from '../../modules/user/interfaces/http/follow.routes';
import { UpdateProfileUseCase } from '../../modules/user/application/use-cases/update-profile.usecase';
import { GetProfileUseCase } from '../../modules/user/application/use-cases/get-profile.usecase';
import { ProfileController } from '../../modules/user/interfaces/http/profile.controller';
import { buildProfileRouter } from '../../modules/user/interfaces/http/profile.routes';
import { PrismaUserRepository } from '../../modules/user/infrastructure/repositories/prisma-user.repository';
import { PrismaNotificationRepository } from '../../modules/notification/infrastructure/repositories/prisma-notification.repository';
import { CreateNotificationUseCase } from '../../modules/notification/application/use-cases/create-notification.usecase';
import { ListNotificationsUseCase } from '../../modules/notification/application/use-cases/list-notifications.usecase';
import { MarkNotificationReadUseCase } from '../../modules/notification/application/use-cases/mark-notification-read.usecase';
import { MarkAllNotificationsReadUseCase } from '../../modules/notification/application/use-cases/mark-all-notifications-read.usecase';
import { NotificationProjector } from '../../modules/notification/infrastructure/events/notification.projector';
import { NotificationController } from '../../modules/notification/interfaces/http/notification.controller';
import { buildNotificationRouter } from '../../modules/notification/interfaces/http/notification.routes';
import { PrismaLikeRepository } from '../../modules/like/infrastructure/repositories/prisma-like.repository';
import { LikePostUseCase as LikePostCommandUseCase } from '../../modules/like/application/use-cases/like-post.usecase';
import { LikeController } from '../../modules/like/interfaces/http/like.controller';
import { buildLikeRouter } from '../../modules/like/interfaces/http/like.routes';
import { JwtTokenService } from '../../modules/auth/infrastructure/services/jwt-token.service';
import { IntrospectTokenUseCase } from '../../modules/auth/application/use-cases/introspect-token.usecase';
import { RegisterUseCase } from '../../modules/auth/application/use-cases/register.usecase';
import { LoginUseCase } from '../../modules/auth/application/use-cases/login.usecase';
import { OAuthLoginUseCase } from '../../modules/auth/application/use-cases/oauth-login.usecase';
import { AuthController } from '../../modules/auth/interfaces/http/auth.controller';
import { buildAuthRouter } from '../../modules/auth/interfaces/http/auth.routes';
import { PrismaAuthUserRepository } from '../../modules/auth/infrastructure/repositories/prisma-auth-user.repository';
import { DevOAuthProviderVerifierService } from '../../modules/auth/infrastructure/services/dev-oauth-provider-verifier.service';
import { PrismaCommentRepository } from '../../modules/comment/infrastructure/repositories/prisma-comment.repository';
import { CreateCommentUseCase } from '../../modules/comment/application/use-cases/create-comment.usecase';
import { DeleteCommentUseCase } from '../../modules/comment/application/use-cases/delete-comment.usecase';
import { ListCommentsUseCase } from '../../modules/comment/application/use-cases/list-comments.usecase';
import { UpdateCommentUseCase } from '../../modules/comment/application/use-cases/update-comment.usecase';
import { CommentController } from '../../modules/comment/interfaces/http/comment.controller';
import { buildCommentRouter } from '../../modules/comment/interfaces/http/comment.routes';
import { PrismaMessagingRepository } from '../../modules/messaging/infrastructure/repositories/prisma-messaging.repository';
import { ListConversationsUseCase } from '../../modules/messaging/application/use-cases/list-conversations.usecase';
import { SendMessageUseCase } from '../../modules/messaging/application/use-cases/send-message.usecase';
import { ReactMessageUseCase } from '../../modules/messaging/application/use-cases/react-message.usecase';
import { DeleteMessageUseCase } from '../../modules/messaging/application/use-cases/delete-message.usecase';
import { DeleteRoomUseCase } from '../../modules/messaging/application/use-cases/delete-room.usecase';
import { MessagingController } from '../../modules/messaging/interfaces/http/messaging.controller';
import { buildMessagingRouter } from '../../modules/messaging/interfaces/http/messaging.routes';
import { PrismaBookmarkRepository } from '../../modules/bookmark/infrastructure/repositories/prisma-bookmark.repository';
import { SavePostUseCase } from '../../modules/bookmark/application/use-cases/save-post.usecase';
import { UnsavePostUseCase } from '../../modules/bookmark/application/use-cases/unsave-post.usecase';
import { ListSavedPostsUseCase } from '../../modules/bookmark/application/use-cases/list-saved-posts.usecase';
import { BookmarkController } from '../../modules/bookmark/interfaces/http/bookmark.controller';
import { buildBookmarkRouter } from '../../modules/bookmark/interfaces/http/bookmark.routes';
import { UploadMediaUseCase } from '../../modules/media/application/use-cases/upload-media.usecase';
import { CloudinaryMediaStorage } from '../../modules/media/infrastructure/services/cloudinary-media-storage';
import { MediaController } from '../../modules/media/interfaces/http/media.controller';
import { buildMediaRouter } from '../../modules/media/interfaces/http/media.routes';
import { config } from '../../shared/components/config';
import { buildRequireAuthMiddleware } from '../http/auth.middleware';

export type AppContainer = {
  postRouter: Router;
  followRouter: Router;
  profileRouter: Router;
  notificationRouter: Router;
  likeRouter: Router;
  authRouter: Router;
  commentRouter: Router;
  messagingRouter: Router;
  bookmarkRouter: Router;
  mediaRouter: Router;
  authMiddleware: RequestHandler;
  feedCacheRepository: RedisFeedCacheRepository;
};

export const buildContainer = (deps: {
  prisma: PrismaClient;
  redisUrl: string;
}): AppContainer => {
  const eventBus = new InMemoryEventBus();
  const feedCacheRepository = new RedisFeedCacheRepository(deps.redisUrl);

  const postRepository = new PrismaPostRepository(deps.prisma);
  const followRepository = new PrismaUserFollowRepository(deps.prisma);
  const notificationRepository = new PrismaNotificationRepository(deps.prisma);
  const likeRepository = new PrismaLikeRepository(deps.prisma);
  const commentRepository = new PrismaCommentRepository(deps.prisma);
  const userRepository = new PrismaUserRepository(deps.prisma);
  const authUserRepository = new PrismaAuthUserRepository(deps.prisma);
  const messagingRepository = new PrismaMessagingRepository(deps.prisma);
  const bookmarkRepository = new PrismaBookmarkRepository(deps.prisma);
  const tokenService = new JwtTokenService(config.jwtSecret);
  const oauthVerifier = new DevOAuthProviderVerifierService(config.envName);
  const mediaStorage = new CloudinaryMediaStorage();

  const createPostUseCase = new CreatePostUseCase(postRepository, eventBus);
  const getFeedUseCase = new GetFeedUseCase(postRepository, followRepository, feedCacheRepository);
  const getPostDetailUseCase = new GetPostDetailUseCase(postRepository);
  const explorePostsUseCase = new ExplorePostsUseCase(postRepository);
  const updatePostUseCase = new UpdatePostUseCase(postRepository);
  const deletePostUseCase = new DeletePostUseCase(postRepository);
  const likePostUseCase = new LikePostCommandUseCase(likeRepository, likeRepository, eventBus);
  const followUserUseCase = new FollowUserUseCase(
    userRepository,
    followRepository,
    postRepository,
    feedCacheRepository,
    eventBus
  );
  const unfollowUserUseCase = new UnfollowUserUseCase(followRepository);
  const updateProfileUseCase = new UpdateProfileUseCase(userRepository);
  const getProfileUseCase = new GetProfileUseCase(userRepository);
  const createNotificationUseCase = new CreateNotificationUseCase(notificationRepository);
  const listNotificationsUseCase = new ListNotificationsUseCase(notificationRepository);
  const markAllNotificationsReadUseCase = new MarkAllNotificationsReadUseCase(
    notificationRepository
  );
  const markNotificationReadUseCase = new MarkNotificationReadUseCase(notificationRepository);
  const registerUseCase = new RegisterUseCase(authUserRepository, tokenService);
  const loginUseCase = new LoginUseCase(authUserRepository, tokenService);
  const introspectTokenUseCase = new IntrospectTokenUseCase(tokenService);
  const oauthLoginUseCase = new OAuthLoginUseCase(authUserRepository, tokenService, oauthVerifier);
  const createCommentUseCase = new CreateCommentUseCase(commentRepository, eventBus);
  const listCommentsUseCase = new ListCommentsUseCase(commentRepository);
  const updateCommentUseCase = new UpdateCommentUseCase(commentRepository);
  const deleteCommentUseCase = new DeleteCommentUseCase(commentRepository);
  const listConversationsUseCase = new ListConversationsUseCase(messagingRepository);
  const sendMessageUseCase = new SendMessageUseCase(messagingRepository, eventBus);
  const reactMessageUseCase = new ReactMessageUseCase(messagingRepository);
  const deleteMessageUseCase = new DeleteMessageUseCase(messagingRepository);
  const deleteRoomUseCase = new DeleteRoomUseCase(messagingRepository);
  const savePostUseCase = new SavePostUseCase(bookmarkRepository);
  const unsavePostUseCase = new UnsavePostUseCase(bookmarkRepository);
  const listSavedPostsUseCase = new ListSavedPostsUseCase(bookmarkRepository, postRepository);
  const uploadMediaUseCase = new UploadMediaUseCase(mediaStorage);

  const postCreatedFeedProjector = new PostCreatedFeedProjector(
    eventBus,
    followRepository,
    feedCacheRepository
  );
  postCreatedFeedProjector.register();
  const notificationProjector = new NotificationProjector(eventBus, createNotificationUseCase);
  notificationProjector.register();

  const postController = new PostController(
    createPostUseCase,
    getFeedUseCase,
    getPostDetailUseCase,
    explorePostsUseCase,
    updatePostUseCase,
    deletePostUseCase
  );
  const followController = new FollowController(followUserUseCase, unfollowUserUseCase);
  const profileController = new ProfileController(updateProfileUseCase, getProfileUseCase);
  const notificationController = new NotificationController(
    listNotificationsUseCase,
    markNotificationReadUseCase,
    markAllNotificationsReadUseCase
  );
  const likeController = new LikeController(likePostUseCase);
  const authController = new AuthController(
    registerUseCase,
    loginUseCase,
    introspectTokenUseCase,
    oauthLoginUseCase
  );
  const commentController = new CommentController(
    createCommentUseCase,
    listCommentsUseCase,
    updateCommentUseCase,
    deleteCommentUseCase
  );
  const messagingController = new MessagingController(
    listConversationsUseCase,
    sendMessageUseCase,
    reactMessageUseCase,
    deleteMessageUseCase,
    deleteRoomUseCase
  );
  const bookmarkController = new BookmarkController(
    savePostUseCase,
    unsavePostUseCase,
    listSavedPostsUseCase
  );
  const mediaController = new MediaController(uploadMediaUseCase);

  return {
    postRouter: buildPostRouter(postController),
    followRouter: buildFollowRouter(followController),
    profileRouter: buildProfileRouter(profileController),
    notificationRouter: buildNotificationRouter(notificationController),
    likeRouter: buildLikeRouter(likeController),
    authRouter: buildAuthRouter(authController),
    commentRouter: buildCommentRouter(commentController),
    messagingRouter: buildMessagingRouter(messagingController),
    bookmarkRouter: buildBookmarkRouter(bookmarkController),
    mediaRouter: buildMediaRouter(mediaController),
    authMiddleware: buildRequireAuthMiddleware(tokenService),
    feedCacheRepository
  };
};
