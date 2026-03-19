import { IRepository } from '@shared/interface';
import { AppError } from '@shared/utils/error';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { IResetTokenRepository } from '../infras/repository/reset-token.repository';
import { IEmailService } from '../infras/services/email.service';
import { User, UserCondDTO, UserUpdateDTO } from '../model';
import {
  RequestResetDTO,
  requestResetDTOSchema,
  ResetPasswordDTO,
  resetPasswordDTOSchema
} from '../model/reset-password';

// Define error constants
const ErrUserNotFound = AppError.from(new Error('User not found'), 404);
const ErrInvalidToken = AppError.from(new Error('Invalid or expired token'), 400);
const ErrEmailNotSent = AppError.from(new Error('Failed to send email'), 500);

export interface IPasswordResetUsecase {
  requestReset(data: RequestResetDTO): Promise<boolean>;
  resetPassword(data: ResetPasswordDTO): Promise<boolean>;
}

export class PasswordResetUsecase implements IPasswordResetUsecase {
  constructor(
    private readonly resetTokenRepo: IResetTokenRepository,
    private readonly emailService: IEmailService,
    private readonly userRepo: IRepository<User, UserCondDTO, UserUpdateDTO>
  ) {}

  async requestReset(data: RequestResetDTO): Promise<boolean> {
    const dto = requestResetDTOSchema.parse(data);

    // Find user by email - we'll need custom logic since email is not in the UserCondDTO
    // This would be better handled with a direct query in a real implementation
    const users = await this.userRepo.list({}, { page: 1, limit: 1000 });
    const user = users.data.find((u) => u.email === dto.email);

    if (!user) {
      throw ErrUserNotFound;
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
    const emailSent = await this.emailService.sendPasswordResetEmail(user.email as string, resetToken);

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

    // Find user
    const user = await this.userRepo.findById(resetToken.userId);

    if (!user) {
      throw ErrUserNotFound;
    }

    // Hash the new password
    const salt = bcrypt.genSaltSync(8);
    const hashPassword = await bcrypt.hash(`${dto.password}.${salt}`, 10);

    // Update user password
    await this.userRepo.update(user.id, {
      password: hashPassword,
      salt
    });

    // Mark token as used
    await this.resetTokenRepo.markAsUsed(resetToken.id);

    return true;
  }
}
