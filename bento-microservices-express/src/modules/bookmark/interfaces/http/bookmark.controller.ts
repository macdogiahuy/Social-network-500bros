import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../../infrastructure/http/auth.middleware';
import { fail, ok } from '../../../../infrastructure/http/response';
import { ListSavedPostsUseCase } from '../../application/use-cases/list-saved-posts.usecase';
import { SavePostUseCase } from '../../application/use-cases/save-post.usecase';
import { UnsavePostUseCase } from '../../application/use-cases/unsave-post.usecase';
import { savePostSchema } from './bookmark.schemas';

export class BookmarkController {
  public constructor(
    private readonly savePostUseCase: SavePostUseCase,
    private readonly unsavePostUseCase: UnsavePostUseCase,
    private readonly listSavedPostsUseCase: ListSavedPostsUseCase
  ) {}

  public save = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthenticatedRequest).authUser?.id;
    if (!userId) {
      fail(res, 401, { code: 'UNAUTHORIZED', message: 'Unauthorized' });
      return;
    }
    const parsed = savePostSchema.safeParse(req.body);
    if (!parsed.success) {
      fail(res, 400, {
        code: 'VALIDATION_ERROR',
        message: parsed.error.issues[0]?.message ?? 'Invalid request body'
      });
      return;
    }
    const saved = await this.savePostUseCase.execute({
      userId,
      postId: parsed.data.postId
    });
    ok(res, { saved });
  };

  public unsave = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthenticatedRequest).authUser?.id;
    const postId = req.params.postId;
    if (!userId || !postId) {
      fail(res, 401, { code: 'UNAUTHORIZED', message: 'Unauthorized' });
      return;
    }
    const unsaved = await this.unsavePostUseCase.execute({ userId, postId });
    ok(res, { unsaved });
  };

  public list = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthenticatedRequest).authUser?.id;
    if (!userId) {
      fail(res, 401, { code: 'UNAUTHORIZED', message: 'Unauthorized' });
      return;
    }
    const limit = Number(req.query.limit ?? 20);
    const posts = await this.listSavedPostsUseCase.execute({
      userId,
      limit: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : 20
    });
    ok(res, posts);
  };
}
