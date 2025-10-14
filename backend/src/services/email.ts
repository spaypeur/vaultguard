import { createTransport, Transporter } from 'nodemailer';
import { Logger } from '../utils/logger';

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  priority?: 'high' | 'normal';
}

export class EmailService {
  private static instance: EmailService;
  private transporter: Transporter | null = null;
  private emailServiceActive: boolean = false;
  private readonly logger: Logger;

  private constructor() {
    this.logger = new Logger('EmailService');
    this.initializeEmailService();
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private initializeEmailService(): void {
    const emailHost = process.env.EMAIL_HOST;
    const emailPort = process.env.EMAIL_PORT;
    const emailSecure = process.env.EMAIL_SECURE === 'true';
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const emailSender = process.env.EMAIL_SENDER;

    if (emailHost && emailPort && emailUser && emailPass && emailSender) {
      this.transporter = createTransport({
        host: emailHost,
        port: parseInt(emailPort),
        secure: emailSecure,
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });
      this.emailServiceActive = true;
      this.logger.info('Email service initialized successfully');
    } else {
      this.logger.warn('Email service not configured - missing one or more environment variables: EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_SENDER');
    }
  }

  public async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.emailServiceActive || !this.transporter) {
      this.logger.warn('Email service not active - cannot send email');
      console.log('PLACEHOLDER_DETECTED: Email service not configured - would send:', {
        to: options.to,
        subject: options.subject,
        priority: options.priority || 'normal'
      });
      return false;
    }

    try {
      const emailSender = process.env.EMAIL_SENDER!;
      await this.transporter.sendMail({
        from: emailSender,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        priority: options.priority === 'high' ? 'high' : 'normal',
      });

      this.logger.info(`Email sent successfully to ${options.to}: ${options.subject}`);
      return true;
    } catch (error: any) {
      this.logger.error('Failed to send email:', error);
      throw error;
    }
  }

  public isActive(): boolean {
    return this.emailServiceActive;
  }

  public async sendPasswordResetEmail(email: string, resetUrl: string): Promise<boolean> {
    const subject = 'VaultGuard Password Reset';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">VaultGuard Password Reset</h2>
        <p>Hello,</p>
        <p>You have requested to reset your password for your VaultGuard account. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <p>If you did not request this password reset, please ignore this email.</p>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          This is an automated message from VaultGuard. Please do not reply to this email.
        </p>
      </div>
    `;

    const text = `
      VaultGuard Password Reset

      You have requested to reset your password for your VaultGuard account.

      Reset your password here: ${resetUrl}

      If you did not request this password reset, please ignore this email.

      This link will expire in 1 hour for security reasons.

      This is an automated message from VaultGuard. Please do not reply to this email.
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
      text,
      priority: 'high'
    });
  }
}

export default EmailService;