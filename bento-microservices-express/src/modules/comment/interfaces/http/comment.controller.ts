import { Request, Response } from 'express';
import { CreateCommentUseCase } from '../../application/use-cases/create-comment.usecase';
import { DeleteCommentUseCase } from '../../application/use-cases/delete-comment.usecase';
import { ListCommentsUseCase } from '../../application/use-cases/list-comments.usecase';
import { UpdateCommentUseCase } from '../../application/use-cases/update-comment.usecase';
import { AuthenticatedRequest } from '../../../../infrastructure/http/auth.middleware';
import { fail, ok } from '../../../../infrastructure/http/response';
import { createCommentSchema, updateCommentSchema } from './comment.schemas';
import { audit } from '../../../../infrastructure/http/audit';

export class CommentController {
  public constructor(
    private readonly createCommentUseCase: CreateCommentUseCase,
    private readonly listCommentsUseCase: ListCommentsUseCase,
    private readonly updateCommentUseCase: UpdateCommentUseCase,
    private readonly deleteCommentUseCase: DeleteCommentUseCase
  ) {}

  public create = async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.postId;
    const userId = (req as AuthenticatedRequest).authUser?.id;
    const parsed = createCommentSchema.safeParse(req.body);
    if (!parsed.success) {
      fail(res, 400, {
        code: 'VALIDATION_ERROR',
        message: parsed.error.issues[0]?.message ?? 'Invalid request body'
      });
      return;
    }
    const body = parsed.data;

    if (!postId || !userId || !body.content) {
      fail(res, 400, {
        code: 'VALIDATION_ERROR',
        message: 'postId and content are required'
      });
      return;
    }

    const id = await this.createCommentUseCase.execute({
      postId,
      userId,
      content: body.content,
      parentId: body.parentId ?? null
    });

    ok(res, { id }, 201);
  };

  public listByPost = async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.postId;
    if (!postId) {
      fail(res, 400, { code: 'VALIDATION_ERROR', message: 'postId is required' });
      return;
    }

    const limit = Number(req.query.limit ?? 20);
    const data = await this.listCommentsUseCase.execute({
      postId,
      limit: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : 20
    });

    ok(res, data);
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.authUser?.id;
    const role = authReq.authUser?.role ?? 'user';
    const commentId = req.params.commentId;
    const parsed = updateCommentSchema.safeParse(req.body);
    if (!parsed.success || !userId || !commentId) {
      fail(res, 400, {
        code: 'VALIDATION_ERROR',
        message: parsed.success
          ? 'commentId and content are required'
          : (parsed.error.issues[0]?.message ?? 'Invalid request body')
      });
      return;
    }
    const body = parsed.data;

    const updated = await this.updateCommentUseCase.execute({
      id: commentId,
      userId,
      role,
      content: body.content
    });
    if (!updated) {
      audit('comment.update.forbidden', { commentId, userId });
      fail(res, 403, { code: 'FORBIDDEN', message: 'Forbidden or comment not found' });
      return;
    }
    ok(res, { updated });
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.authUser?.id;
    const role = authReq.authUser?.role ?? 'user';
    const commentId = req.params.commentId;
    if (!userId || !commentId) {
      fail(res, 400, { code: 'VALIDATION_ERROR', message: 'commentId is required' });
      return;
    }

    const deleted = await this.deleteCommentUseCase.execute({
      id: commentId,
      userId,
      role
    });
    if (!deleted) {
      audit('comment.delete.forbidden', { commentId, userId });
      fail(res, 403, { code: 'FORBIDDEN', message: 'Forbidden or comment not found' });
      return;
    }
    ok(res, { deleted });
  };
}
