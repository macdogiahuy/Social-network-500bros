import { successResponse } from '@shared/utils/utils';
import { Request, Response } from 'express';
import { IPasswordResetUsecase } from '../../usecase/password-reset.usecase';

export class PasswordResetHttpService {
  constructor(private readonly usecase: IPasswordResetUsecase) {}

  async requestResetAPI(req: Request, res: Response) {
    try {
      const result = await this.usecase.requestReset(req.body);

      // Don't reveal whether a user with that email exists for security reasons
      successResponse(
        {
          message: 'If your email is registered, you will receive a password reset link'
        },
        res
      );
    } catch (error) {
      // Log the error but still return success to avoid revealing user existence
      console.error('Error requesting password reset:', error);

      successResponse(
        {
          message: 'If your email is registered, you will receive a password reset link'
        },
        res
      );
    }
  }

  async resetPasswordAPI(req: Request, res: Response) {
    const result = await this.usecase.resetPassword(req.body);
    successResponse(
      {
        message: 'Password reset successful'
      },
      res
    );
  }
}
