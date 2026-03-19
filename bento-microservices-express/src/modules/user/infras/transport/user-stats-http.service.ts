import { successResponse } from '@shared/utils/utils';
import { Request, Response } from 'express';
import { IUserStatsUsecase } from '../../usecase/user-stats.usecase';

export class UserStatsHttpService {
  constructor(private readonly usecase: IUserStatsUsecase) {}

  async getUserStatsAPI(req: Request, res: Response) {
    const { userId } = req.params;
    const stats = await this.usecase.getUserStats(userId);
    successResponse(stats, res);
  }
}
