import Logger from '@shared/utils/logger';

export interface IEmailService {
  sendPasswordResetEmail(to: string, resetToken: string): Promise<boolean>;
}

export class EmailService implements IEmailService {
  async sendPasswordResetEmail(to: string, resetToken: string): Promise<boolean> {
    // In a real implementation, we would use a library like nodemailer to send emails
    // This is a mock implementation that logs the email

    // In a real app, we would get the frontend URL from config
    const frontendUrl = 'http://localhost:3000'; // Placeholder URL
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    const subject = 'Reset Your Password - Social Network';
    const body = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset for your account. Please click the link below to reset your password:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>If you did not request this, you can ignore this email.</p>
      <p>The link will expire in 1 hour.</p>
    `;

    try {
      // Mock sending the email
      Logger.info(`[EMAIL SERVICE] Sending password reset email to: ${to}`);
      Logger.info(`[EMAIL SERVICE] Subject: ${subject}`);
      Logger.info(`[EMAIL SERVICE] Reset Link: ${resetLink}`);

      // In a real application, we would send the actual email here
      // await sendEmail(to, subject, body);

      return true;
    } catch (error) {
      Logger.error(`Failed to send password reset email: ${error}`);
      return false;
    }
  }
}
