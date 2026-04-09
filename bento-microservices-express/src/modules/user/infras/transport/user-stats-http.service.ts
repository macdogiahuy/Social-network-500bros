import { successResponse } from '@shared/utils/utils';
import { pickParam } from '@shared/utils/request';
import { Request, Response } from 'express';
import { IUserStatsUsecase } from '../../interface';

export class UserStatsHttpService {
  constructor(private readonly usecase: IUserStatsUsecase) {}

  async getUserStatsAPI(req: Request, res: Response) {
    const userId = pickParam(
      (req.params as Record<string, string | string[] | undefined>).userId
    );
    const stats = await this.usecase.getUserStats(userId);
    successResponse(stats, res);
  }
}
