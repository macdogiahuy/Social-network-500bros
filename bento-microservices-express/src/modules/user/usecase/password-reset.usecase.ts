import { ErrUserNotFound, ErrInvalidToken, ErrEmailNotSent, ErrForbidden } from '@shared/utils/error';
import crypto from 'crypto';
import { IResetTokenRepository } from '../infras/repository/reset-token.repository';
import { IEmailService } from '../infras/services/email.service';
import { IUserUseCase } from '../interface';
import { IPasswordResetUsecase } from '../interface';
import { Status } from '../model';
import {
  RequestResetDTO,
  requestResetDTOSchema,
  ResetPasswordDTO,
  resetPasswordDTOSchema
} from '../model/reset-password';

export class PasswordResetUsecase implements IPasswordResetUsecase {
  constructor(
    private readonly resetTokenRepo: IResetTokenRepository,
    private readonly emailService: IEmailService,
    private readonly userUseCase: IUserUseCase
  ) {}

  async requestReset(data: RequestResetDTO): Promise<boolean> {
    const dto = requestResetDTOSchema.parse(data);

    // Find user by email
    const users = await this.userUseCase.list({ email: dto.email }, { page: 1, limit: 1 });
    const user = users.data[0];

    if (!user) {
      throw ErrUserNotFound;
    }

    // Only allow active users to request password reset
    if (user.status !== Status.ACTIVE) {
      throw ErrForbidden.withMessage('Cannot reset password for inactive user');
    }

    // Generate a secure token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Create a token with 1 hour expiration
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.resetTokenRepo.createToken({
      userId: user.id,
      token: resetToken,
      expiresAt
    });

    // Send email with reset token
    if (!user.email) {
      throw ErrEmailNotSent.withMessage('User has no email address');
    }

    const emailSent = await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    if (!emailSent) {
      throw ErrEmailNotSent;
    }

    return true;
  }

  async resetPassword(data: ResetPasswordDTO): Promise<boolean> {
    const dto = resetPasswordDTOSchema.parse(data);

    // Find token
    const resetToken = await this.resetTokenRepo.findByToken(dto.token);

    if (!resetToken || resetToken.isUsed || resetToken.expiresAt < new Date()) {
      throw ErrInvalidToken;
    }

    // Find user (throws ErrNotFound if not found or deleted)
    await this.userUseCase.getDetail(resetToken.userId);

    // Hash the new password using shared method
    const { hash, salt } = await this.userUseCase.hashPassword(dto.password);

    // Update user password and invalidate all existing tokens
    await Promise.all([
      this.userUseCase.update(resetToken.userId, { password: hash, salt }),
      this.resetTokenRepo.invalidateUserTokens(resetToken.userId),
      this.resetTokenRepo.markAsUsed(resetToken.id)
    ]);

    return true;
  }
}
