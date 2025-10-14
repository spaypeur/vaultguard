import { Router, Request, Response } from 'express';
import { z } from 'zod';
import cookieParser from 'cookie-parser';
import { AuthenticatedRequest, ApiResponse, User } from '@/types';
import { DbUser, UserStatus } from '@/types/database';
import AuthService from '@/services/auth';
import DatabaseService from '@/services/database';
import { validate } from '@/middleware/validation';
import { Logger } from '../utils/logger';
import {
  loginSchema,
  registerSchema,
  twoFactorSetupSchema,
  twoFactorVerifySchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/validation/auth.schema';
import { supabase } from '@/config/database';
import { Request as ExpressRequest } from 'express-serve-static-core';

type ApiRequest = Request & {
  user?: User;
  cookies: { [key: string]: string };
}

const router = Router();
const logger = new Logger('AuthRoutes');
router.use(cookieParser());

// User registration
router.post('/register', validate(registerSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = req.body;

    const result = await AuthService.registerUser(validatedData);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.first_name,
          lastName: result.user.last_name,
          role: result.user.role,
          status: result.user.status,
          jurisdiction: result.user.jurisdiction,
        },
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
      message: 'User registered successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Registration error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Registration failed',
    } as ApiResponse);
  }
});

//User login
router.post('/login', validate(loginSchema), async (req: ApiRequest, res: Response): Promise<void> => {
  try {
    const result = await AuthService.loginUser(req.body);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          role: result.user.role,
          status: result.user.status,
          jurisdiction: result.user.jurisdiction,
          twoFactorEnabled: result.user.twoFactorEnabled,
        },
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
        twoFactorRequired: result.twoFactorRequired,
      },
      message: 'Login successful',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Login error:', error);
    res.status(401).json({
      success: false,
      error: error.message || 'Login failed',
    } as ApiResponse);
  }
});

// Setup two-factor authentication
router.post('/setup-2fa', validate(twoFactorSetupSchema), async (req: ApiRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const setupData = await AuthService.setupTwoFactor(req.user.id);

    res.json({
      success: true,
      data: setupData,
      message: 'Two-factor authentication setup initiated',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('2FA setup error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to setup 2FA',
    } as ApiResponse);
  }
});

// Verify and enable two-factor authentication
router.post('/verify-2fa', validate(twoFactorVerifySchema), async (req: ApiRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const { token, secret } = req.body;

    const success = await AuthService.verifyAndEnableTwoFactor(
      req.user.id,
      token,
      secret
    );

    if (success) {
      res.json({
        success: true,
        message: 'Two-factor authentication enabled successfully',
      } as ApiResponse);
    } else {
      res.status(400).json({
        success: false,
        error: 'Failed to verify two-factor code',
      } as ApiResponse);
    }
  } catch (error: any) {
    logger.error('2FA verification error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to verify 2FA',
    } as ApiResponse);
  }
});

// Refresh access token
router.post('/refresh', async (req: ApiRequest, res: Response): Promise<void> => {
  try {
    const refreshToken = req.body?.refreshToken || req.cookies?.refreshToken;
    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: 'Refresh token required',
      } as ApiResponse);
      return;
    }
    const tokens = await AuthService.refreshAccessToken(refreshToken);

    // Set new refresh token as httpOnly cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        expiresIn: 15 * 60, // 15 minutes in seconds
      },
      message: 'Token refreshed successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      error: error.message || 'Failed to refresh token',
    } as ApiResponse);
  }
});

// Logout
router.post('/logout', async (req: ApiRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    await AuthService.logoutUser(req.user.id, refreshToken);

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logged out successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Logout error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Logout failed',
    } as ApiResponse);
  }
});

// Forgot password
router.post('/forgot-password', validate(forgotPasswordSchema), async (req: ApiRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    await AuthService.requestPasswordReset(email);

    res.json({
      success: true,
      message: 'Password reset email sent if account exists',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Forgot password error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to process password reset request',
    } as ApiResponse);
  }
});

// Reset password
router.post('/reset-password', validate(resetPasswordSchema), async (req: ApiRequest, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;
    const success = await AuthService.resetPassword(token, password);

    if (success) {
      res.json({
        success: true,
        message: 'Password reset successfully',
      } as ApiResponse);
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token',
      } as ApiResponse);
    }
  } catch (error: any) {
    logger.error('Reset password error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to reset password',
    } as ApiResponse);
  }
});

// Get current user profile
router.get('/me', async (req: ApiRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const dbUser = await DatabaseService.getUserById(req.user.id);
    if (!dbUser) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      } as ApiResponse);
      return;
    }

    // Convert DbUser to User format
    const user: User = {
      id: dbUser.id,
      email: dbUser.email,
      firstName: dbUser.first_name,
      lastName: dbUser.last_name,
      role: dbUser.role,
      status: dbUser.status,
      jurisdiction: dbUser.jurisdiction,
      emailVerified: (dbUser as any).email_verified,
      twoFactorEnabled: (dbUser as any).two_factor_enabled,
      lastLoginAt: (dbUser as any).last_login_at ? new Date((dbUser as any).last_login_at) : undefined,
      createdAt: new Date((dbUser as any).created_at),
      updatedAt: new Date((dbUser as any).updated_at),
    };

    res.json({
      success: true,
      data: user,
      message: 'User profile retrieved successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Get profile error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to retrieve user profile',
    } as ApiResponse);
  }
});

// Verify email
router.post('/verify-email/:token', async (req: ApiRequest, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    // Find user by verification token
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email_verification_token', token)
      .is('email_verified', false)
      .limit(1);

    if (error || !users || users.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token',
      } as ApiResponse);
      return;
    }

    const dbUser = users[0] as DbUser;

    // Update user as verified
    await DatabaseService.updateUser(dbUser.id, {
      email_verified: true,
      email_verification_token: null,
      status: UserStatus.ACTIVE,
    } as Partial<DbUser>);

    // Log email verification
    await DatabaseService.logAuditEvent(
      dbUser.id,
      'email_verified',
      'user',
      dbUser.id
    );

    res.json({
      success: true,
      message: 'Email verified successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Email verification error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Email verification failed',
    } as ApiResponse);
  }
});

export default router;
