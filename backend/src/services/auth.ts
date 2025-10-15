import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import crypto from 'crypto';
import { User, LoginRequest, LoginResponse, RegisterRequest, UserStatus, UserRole } from '@/types';
import DatabaseService from '@/services/database';
import EmailService from '@/services/email';
import { supabase } from '@/config/database';
import { Logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';

export class AuthService {
  private static logger = new Logger('AuthService');

  // Hash password
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Verify password
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Generate JWT tokens
  static generateAccessToken(user: User): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        jurisdiction: user.jurisdiction,
      },
      JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        issuer: 'vaultguard',
        audience: 'vaultguard-users',
      } as jwt.SignOptions
    );
  }

  static generateRefreshToken(user: User): string {
    return jwt.sign(
      {
        id: user.id,
        type: 'refresh',
      },
      JWT_REFRESH_SECRET,
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        issuer: 'vaultguard',
        audience: 'vaultguard-users',
      } as jwt.SignOptions
    );
  }

  // Verify JWT token
  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // User registration
  static async registerUser(userData: RegisterRequest): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    try {
      // Check if user already exists
      const existingUser = await DatabaseService.getUserByEmail(userData.email);
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const passwordHash = await this.hashPassword(userData.password);

      // Generate email verification token
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');

      // Create user - always set role to 'client' for security
      const user = await DatabaseService.createUser({
        email: userData.email,
        password_hash: passwordHash,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone_number: userData.phoneNumber,
        jurisdiction: userData.jurisdiction,
        email_verification_token: emailVerificationToken,
        status: UserStatus.ACTIVE,
        role: UserRole.CLIENT,
      });

      if (!user) {
        throw new Error('Failed to create user');
      }

      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Send verification email
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${emailVerificationToken}`;
      const emailSent = await EmailService.getInstance().sendVerificationEmail(
        userData.email,
        verificationUrl,
        userData.firstName
      );

      if (!emailSent) {
        AuthService.logger.warn(`Failed to send verification email to ${userData.email}, but user registration completed`);
      } else {
        AuthService.logger.info(`Verification email sent to ${userData.email}`);
      }

      // Skip audit logging to avoid database issues during registration

      return { user, accessToken, refreshToken };
    } catch (error) {
      AuthService.logger.error('Registration error:', error);
      throw error;
    }
  }

  // User login
  static async loginUser(loginData: LoginRequest): Promise<LoginResponse> {
    try {
      // Get user by email
      const user = await DatabaseService.getUserByEmail(loginData.email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check if user is active
      if (user.status !== UserStatus.ACTIVE) {
        throw new Error('Account is not active');
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(loginData.password, user.password_hash);
      if (!isValidPassword) {
        // Increment login attempts
        await DatabaseService.updateUser(user.id, {
          login_attempts: user.login_attempts + 1,
        });

        throw new Error('Invalid credentials');
      }

      // Check two-factor authentication if enabled
      if (user.two_factor_enabled && loginData.twoFactorCode) {
        const verified = speakeasy.totp.verify({
          secret: user.two_factor_secret!,
          encoding: 'base32',
          token: loginData.twoFactorCode,
          window: 2, // Allow 30 seconds window
        });

        if (!verified) {
          throw new Error('Invalid two-factor code');
        }
      } else if (user.two_factor_enabled && !loginData.twoFactorCode) {
        return {
          user,
          accessToken: '',
          refreshToken: '',
          expiresIn: 0,
          twoFactorRequired: true,
        };
      }

      // Reset login attempts on successful login
      await DatabaseService.updateUser(user.id, {
        login_attempts: 0,
        last_login_at: new Date(),
      });

      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Skip login audit logging temporarily to avoid database issues

      return {
        user,
        accessToken,
        refreshToken,
        expiresIn: 15 * 60, // 15 minutes in seconds
      };
    } catch (error) {
      AuthService.logger.error('Login error:', error);
      throw error;
    }
  }

  // Setup two-factor authentication
  static async setupTwoFactor(userId: string): Promise<{ qrCode: string; secret: string; backupCodes: string[] }> {
    try {
      const user = await DatabaseService.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `${process.env.TWO_FA_ISSUER} (${user.email})`,
        issuer: process.env.TWO_FA_ISSUER,
      });

      // Generate QR code
      const qrCode = await qrcode.toDataURL(secret.otpauth_url!);

      // Generate backup codes
      const backupCodes = Array.from({ length: 10 }, () =>
        crypto.randomBytes(4).toString('hex').toUpperCase()
      );

      // Store secret and backup codes temporarily (user needs to verify first)
      // In production, use Redis or database for temporary storage

      return {
        qrCode,
        secret: secret.base32,
        backupCodes,
      };
    } catch (error) {
      AuthService.logger.error('2FA setup error:', error);
      throw error;
    }
  }

  // Verify and enable two-factor authentication
  static async verifyAndEnableTwoFactor(
    userId: string,
    token: string,
    secret: string
  ): Promise<boolean> {
    try {
      const user = await DatabaseService.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify token
      const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token,
        window: 2,
      });

      if (!verified) {
        throw new Error('Invalid verification code');
      }

      // Enable 2FA
      await DatabaseService.updateUser(userId, {
        two_factor_enabled: true,
        two_factor_secret: secret,
      });

      // Log 2FA setup
      await DatabaseService.logAuditEvent(
        userId,
        '2fa_enabled',
        'user',
        userId,
        { twoFactorEnabled: false },
        { twoFactorEnabled: true }
      );

      return true;
    } catch (error) {
      AuthService.logger.error('2FA verification error:', error);
      throw error;
    }
  }

  // Refresh access token
  static async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }

      const user = await DatabaseService.getUserById(decoded.id);
      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new Error('Invalid user or inactive account');
      }

      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      AuthService.logger.error('Token refresh error:', error);
      throw new Error('Invalid refresh token');
    }
  }

  // Logout user (invalidate tokens)
  static async logoutUser(userId: string, sessionToken?: string): Promise<boolean> {
    try {
      // In a production system, you'd want to maintain a blacklist of tokens
      // For now, we'll just log the logout event

      await DatabaseService.logAuditEvent(
        userId,
        'user_logout',
        'user',
        userId,
        null,
        null,
        { sessionToken: sessionToken ? 'provided' : 'not_provided' }
      );

      return true;
    } catch (error) {
      AuthService.logger.error('Logout error:', error);
      return false;
    }
  }

  // Password reset request
  static async requestPasswordReset(email: string): Promise<boolean> {
    try {
      const user = await DatabaseService.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return true;
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 3600000); // 1 hour

      // Update user with reset token
      await DatabaseService.updateUser(user.id, {
        password_reset_token: resetToken,
        password_reset_expires: resetExpires,
      });

      // Send password reset email
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      const emailSent = await EmailService.getInstance().sendPasswordResetEmail(email, resetUrl);

      if (!emailSent) {
        AuthService.logger.warn('Failed to send password reset email, but proceeding with token generation');
      } else {
        AuthService.logger.info(`Password reset email sent to ${email}`);
      }

      // Log password reset request
      await DatabaseService.logAuditEvent(
        user.id,
        'password_reset_requested',
        'user',
        user.id
      );

      return true;
    } catch (error) {
      AuthService.logger.error('Password reset request error:', error);
      return false;
    }
  }

  // Reset password with token
  static async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      // Find user by reset token
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('password_reset_token', token)
        .gt('password_reset_expires', new Date().toISOString())
        .limit(1);

      if (error || !users || users.length === 0) {
        throw new Error('Invalid or expired reset token');
      }

      const user = users[0] as User;

      // Hash new password
      const passwordHash = await this.hashPassword(newPassword);

      // Update user password and clear reset token
      await DatabaseService.updateUser(user.id, {
        password_hash: passwordHash,
        password_reset_token: null,
        password_reset_expires: null,
      });

      // Log password reset
      await DatabaseService.logAuditEvent(
        user.id,
        'password_reset_completed',
        'user',
        user.id
      );

      return true;
    } catch (error) {
      AuthService.logger.error('Password reset error:', error);
      return false;
    }
  }
}

export default AuthService;
