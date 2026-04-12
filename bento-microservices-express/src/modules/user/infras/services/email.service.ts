import nodemailer, { Transporter } from 'nodemailer';
import Logger from '@shared/utils/logger';

export interface IEmailService {
  // After registeration
  sendEmailWelcome(to: string, username: string): Promise<boolean>;
  sendEmailVerifyAccount(to: string, verifyToken: string): Promise<boolean>;
  sendPasswordResetEmail(to: string, resetToken: string): Promise<boolean>;
}

export class EmailService implements IEmailService {
  private transporter: Transporter;
  private readonly FROM_EMAIL: string;
  private readonly APP_URL: string;
  private readonly FRONTEND_URL: string;

  constructor() {
    // Initialize Nodemailer transporter with SMTP configuration
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports like 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    this.FROM_EMAIL = process.env.MAIL_FROM || 'noreply@socialnetwork.com';
    this.APP_URL = process.env.APP_URL || 'http://localhost:3000';
    this.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
  }

  /**
   * Send welcome email to newly registered user
   */
  async sendEmailWelcome(to: string, username: string): Promise<boolean> {
    try {
      const subject = 'Welcome to Social Network 500Bros!';
      const htmlBody = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
              h1 { color: #333; margin-bottom: 20px; }
              p { color: #666; line-height: 1.6; }
              .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; }
              .footer { margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #999; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Welcome to 500Bros, ${this.escapeHtml(username)}! 🎉</h1>
              <p>Thank you for joining our social network community. We're excited to have you on board!</p>
              <p>You can now:</p>
              <ul>
                <li>Create and share posts</li>
                <li>Connect with friends</li>
                <li>Join topics and communities</li>
                <li>Engage with content</li>
              </ul>
              <a href="${this.FRONTEND_URL}" class="button">Get Started</a>
              <div class="footer">
                <p>Best regards,<br>The 500Bros Team</p>
                <p>If you did not create this account, please ignore this email.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      const result = await this.transporter.sendMail({
        from: this.FROM_EMAIL,
        to: to,
        subject: subject,
        html: htmlBody,
      });

      Logger.info(`[EMAIL SERVICE] Welcome email sent to ${to} (Message ID: ${result.messageId})`);
      return true;
    } catch (error) {
      Logger.error(`[EMAIL SERVICE] Failed to send welcome email to ${to}: ${this.getErrorMessage(error)}`);
      return false;
    }
  }

  /**
   * Send account verification email with verification token
   */
  async sendEmailVerifyAccount(to: string, verifyToken: string): Promise<boolean> {
    try {
      const verifyLink = `${this.FRONTEND_URL}/verify-email?token=${verifyToken}`;
      const subject = 'Verify Your Email - Social Network 500Bros';

      const htmlBody = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
              h1 { color: #333; margin-bottom: 20px; }
              p { color: #666; line-height: 1.6; }
              .button { display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; font-weight: bold; }
              .footer { margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #999; }
              .code { background-color: #f4f4f4; padding: 10px; border-radius: 4px; font-family: monospace; word-break: break-all; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Verify Your Email Address</h1>
              <p>Thank you for signing up! To complete your registration, please verify your email address by clicking the button below:</p>
              <a href="${this.escapeHtml(verifyLink)}" class="button">Verify Email</a>
              <p style="margin-top: 20px; font-size: 14px; color: #999;">
                Or copy this link in your browser:
              </p>
              <div class="code">${this.escapeHtml(verifyLink)}</div>
              <p style="margin-top: 20px; color: #ff6b6b;">
                ⏰ This link will expire in 24 hours.
              </p>
              <div class="footer">
                <p>Best regards,<br>The 500Bros Team</p>
                <p>If you did not create this account, please ignore this email.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      const result = await this.transporter.sendMail({
        from: this.FROM_EMAIL,
        to: to,
        subject: subject,
        html: htmlBody,
      });

      Logger.info(`[EMAIL SERVICE] Verification email sent to ${to} (Message ID: ${result.messageId})`);
      return true;
    } catch (error) {
      Logger.error(`[EMAIL SERVICE] Failed to send verification email to ${to}: ${this.getErrorMessage(error)}`);
      return false;
    }
  }

  /**
   * Send password reset email with reset token
   */
  async sendPasswordResetEmail(to: string, resetToken: string): Promise<boolean> {
    try {
      const resetLink = `${this.FRONTEND_URL}/reset-password?token=${resetToken}`;
      const subject = 'Reset Your Password - Social Network 500Bros';

      const htmlBody = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
              h1 { color: #333; margin-bottom: 20px; }
              p { color: #666; line-height: 1.6; }
              .button { display: inline-block; padding: 12px 24px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; font-weight: bold; }
              .footer { margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #999; }
              .code { background-color: #f4f4f4; padding: 10px; border-radius: 4px; font-family: monospace; word-break: break-all; }
              .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Password Reset Request</h1>
              <p>You requested a password reset for your account. If you did not make this request, please ignore this email.</p>
              <p>To reset your password, click the button below:</p>
              <a href="${this.escapeHtml(resetLink)}" class="button">Reset Password</a>
              <p style="margin-top: 20px; font-size: 14px; color: #999;">
                Or copy this link in your browser:
              </p>
              <div class="code">${this.escapeHtml(resetLink)}</div>
              <div class="warning">
                ⏰ <strong>Important:</strong> This link will expire in <strong>1 hour</strong>. If it expires, you can request a new password reset.
              </div>
              <p style="margin-top: 20px; color: #666;">
                For security reasons, we never share passwords via email. If you need help, please contact our support team.
              </p>
              <div class="footer">
                <p>Best regards,<br>The 500Bros Team</p>
                <p>This is an automated message, please do not reply to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      const result = await this.transporter.sendMail({
        from: this.FROM_EMAIL,
        to: to,
        subject: subject,
        html: htmlBody,
      });

      Logger.info(`[EMAIL SERVICE] Password reset email sent to ${to} (Message ID: ${result.messageId})`);
      return true;
    } catch (error) {
      Logger.error(`[EMAIL SERVICE] Failed to send password reset email to ${to}: ${this.getErrorMessage(error)}`);
      return false;
    }
  }

  /**
   * Helper method to escape HTML special characters to prevent XSS
   */
  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * Helper method to extract error message
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}
