import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../../infrastructure/http/auth.middleware';
import { fail, ok } from '../../../../infrastructure/http/response';
import { CreatePostUseCase } from '../../application/use-cases/create-post.usecase';
import { DeletePostUseCase } from '../../application/use-cases/delete-post.usecase';
import { ExplorePostsUseCase } from '../../application/use-cases/explore-posts.usecase';
import { GetFeedUseCase } from '../../application/use-cases/get-feed.usecase';
import { GetPostDetailUseCase } from '../../application/use-cases/get-post-detail.usecase';
import { UpdatePostUseCase } from '../../application/use-cases/update-post.usecase';
import { createPostSchema, updatePostSchema } from './post.schemas';
import { audit } from '../../../../infrastructure/http/audit';

export class PostController {
  public constructor(
    private readonly createPostUseCase: CreatePostUseCase,
    private readonly getFeedUseCase: GetFeedUseCase,
    private readonly getPostDetailUseCase: GetPostDetailUseCase,
    private readonly explorePostsUseCase: ExplorePostsUseCase,
    private readonly updatePostUseCase: UpdatePostUseCase,
    private readonly deletePostUseCase: DeletePostUseCase
  ) {}

  public create = async (req: Request, res: Response): Promise<void> => {
    const parsed = createPostSchema.safeParse(req.body);
    if (!parsed.success) {
      fail(res, 400, {
        code: 'VALIDATION_ERROR',
        message: parsed.error.issues[0]?.message ?? 'Invalid request body'
      });
      return;
    }
    const body = parsed.data;
    const authorId = body.authorId ?? this.getUserId(req as AuthenticatedRequest);
    if (!authorId || !body.topicId || !body.content) {
      fail(res, 400, {
        code: 'VALIDATION_ERROR',
        message: 'authorId, topicId and content are required'
      });
      return;
    }

    const postId = await this.createPostUseCase.execute({
      authorId,
      topicId: body.topicId,
      content: body.content,
      imageUrl: body.imageUrl ?? null
    });

    ok(res, { id: postId }, 201);
  };

  public getFeed = async (req: Request, res: Response): Promise<void> => {
    const userId = this.getUserId(req as AuthenticatedRequest);
    if (!userId) {
      fail(res, 401, { code: 'UNAUTHORIZED', message: 'Unauthorized' });
      return;
    }

    const limit = Number(req.query.limit ?? 20);
    const feed = await this.getFeedUseCase.execute({
      userId,
      limit: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : 20
    });
    ok(res, feed);
  };

  public getDetail = async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.postId;
    if (!postId) {
      fail(res, 400, { code: 'VALIDATION_ERROR', message: 'postId is required' });
      return;
    }

    const data = await this.getPostDetailUseCase.execute({ id: postId });
    if (!data) {
      fail(res, 404, { code: 'NOT_FOUND', message: 'Post not found' });
      return;
    }
    ok(res, data);
  };

  public explore = async (req: Request, res: Response): Promise<void> => {
    const limit = Number(req.query.limit ?? 20);
    const keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim() : undefined;
    const topicId = typeof req.query.topicId === 'string' ? req.query.topicId : undefined;
    const data = await this.explorePostsUseCase.execute({
      keyword,
      topicId,
      limit: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : 20
    });
    ok(res, data);
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const userId = this.getUserId(authReq);
    const role = authReq.authUser?.role ?? 'user';
    const postId = req.params.postId;
    const parsed = updatePostSchema.safeParse(req.body);
    if (!parsed.success) {
      fail(res, 400, {
        code: 'VALIDATION_ERROR',
        message: parsed.error.issues[0]?.message ?? 'Invalid request body'
      });
      return;
    }
    const body = parsed.data;
    if (!userId || !postId) {
      fail(res, 401, { code: 'UNAUTHORIZED', message: 'Unauthorized' });
      return;
    }

    const updated = await this.updatePostUseCase.execute({
      id: postId,
      authorId: userId,
      role,
      content: body.content,
      imageUrl: body.imageUrl
    });

    if (!updated) {
      audit('post.update.forbidden', { postId, userId });
      fail(res, 403, { code: 'FORBIDDEN', message: 'Forbidden or post not found' });
      return;
    }
    ok(res, { updated });
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const userId = this.getUserId(authReq);
    const role = authReq.authUser?.role ?? 'user';
    const postId = req.params.postId;
    if (!userId || !postId) {
      fail(res, 401, { code: 'UNAUTHORIZED', message: 'Unauthorized' });
      return;
    }

    const deleted = await this.deletePostUseCase.execute({
      id: postId,
      authorId: userId,
      role
    });
    if (!deleted) {
      audit('post.delete.forbidden', { postId, userId });
      fail(res, 403, { code: 'FORBIDDEN', message: 'Forbidden or post not found' });
      return;
    }

    ok(res, { deleted });
  };

  private getUserId(req: AuthenticatedRequest): string | null {
    return req.authUser?.id ?? null;
  }
}
