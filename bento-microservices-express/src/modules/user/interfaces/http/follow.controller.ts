import { Request, Response } from 'express';
import { FollowUserUseCase } from '../../application/use-cases/follow-user.usecase';
import { AuthenticatedRequest } from '../../../../infrastructure/http/auth.middleware';
import { fail, ok } from '../../../../infrastructure/http/response';
import { UnfollowUserUseCase } from '../../application/use-cases/unfollow-user.usecase';

export class FollowController {
  public constructor(
    private readonly followUserUseCase: FollowUserUseCase,
    private readonly unfollowUserUseCase: UnfollowUserUseCase
  ) {}

  public follow = async (req: Request, res: Response): Promise<void> => {
    const followerId = (req as AuthenticatedRequest).authUser?.id;
    const followingId = req.params.userId;

    if (!followerId || !followingId) {
      fail(res, 401, { code: 'UNAUTHORIZED', message: 'Unauthorized' });
      return;
    }

    await this.followUserUseCase.execute({
      followerId,
      followingId,
      warmupLimit: 100
    });

    ok(res, { followed: true });
  };

  public unfollow = async (req: Request, res: Response): Promise<void> => {
    const followerId = (req as AuthenticatedRequest).authUser?.id;
    const followingId = req.params.userId;
    if (!followerId || !followingId) {
      fail(res, 401, { code: 'UNAUTHORIZED', message: 'Unauthorized' });
      return;
    }

    const unfollowed = await this.unfollowUserUseCase.execute({
      followerId,
      followingId
    });
    ok(res, { unfollowed });
  };
}
