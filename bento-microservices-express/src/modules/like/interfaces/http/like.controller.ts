import { Request, Response } from 'express';
import { LikePostUseCase } from '../../application/use-cases/like-post.usecase';
import { AuthenticatedRequest } from '../../../../infrastructure/http/auth.middleware';
import { fail, ok } from '../../../../infrastructure/http/response';

export class LikeController {
  public constructor(private readonly likePostUseCase: LikePostUseCase) {}

  public likePost = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthenticatedRequest).authUser?.id;
    const postId = req.params.postId;
    if (!userId || !postId) {
      fail(res, 401, { code: 'UNAUTHORIZED', message: 'Unauthorized' });
      return;
    }

    await this.likePostUseCase.execute({ postId, userId });
    ok(res, { liked: true });
  };
}
