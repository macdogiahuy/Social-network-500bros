import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../../infrastructure/http/auth.middleware';
import { fail, ok } from '../../../../infrastructure/http/response';
import { GetProfileUseCase } from '../../application/use-cases/get-profile.usecase';
import { UpdateProfileUseCase } from '../../application/use-cases/update-profile.usecase';
import { updateProfileSchema } from './profile.schemas';

export class ProfileController {
  public constructor(
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly getProfileUseCase: GetProfileUseCase
  ) {}

  public getProfile = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthenticatedRequest).authUser?.id;
    if (!userId) {
      fail(res, 401, { code: 'UNAUTHORIZED', message: 'Unauthorized' });
      return;
    }

    const profile = await this.getProfileUseCase.execute({ userId });
    if (!profile) {
      fail(res, 404, { code: 'NOT_FOUND', message: 'User profile not found' });
      return;
    }

    ok(res, profile);
  };

  public updateProfile = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthenticatedRequest).authUser?.id;
    if (!userId) {
      fail(res, 401, { code: 'UNAUTHORIZED', message: 'Unauthorized' });
      return;
    }

    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      fail(res, 400, {
        code: 'VALIDATION_ERROR',
        message: parsed.error.issues[0]?.message ?? 'Invalid request body'
      });
      return;
    }

    const updated = await this.updateProfileUseCase.execute({
      userId,
      ...parsed.data
    });
    ok(res, { updated });
  };
}
