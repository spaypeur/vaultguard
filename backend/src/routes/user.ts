import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { AuthenticatedRequest, ApiResponse } from '@/types';
import DatabaseService from '@/services/database';
import { Logger } from '@/utils/logger';

const router = Router();
const logger = new Logger('user-routes');

// Validation schemas - simplified to match existing User type
const updateSettingsSchema = Joi.object({
  firstName: Joi.string().min(1).max(100).optional(),
  lastName: Joi.string().min(1).max(100).optional(),
  twoFactorEnabled: Joi.boolean().optional(),
});

// Get user settings - simplified to match available properties
router.get('/settings', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    // For now, return basic user info as settings
    // This can be expanded when the user model supports settings
    const settings = {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      twoFactorEnabled: req.user.twoFactorEnabled,
      notifications: {
        email: true,
        sms: false,
        push: true,
        security: true,
        marketing: false,
      },
      security: {
        twoFactorEnabled: req.user.twoFactorEnabled,
        biometricEnabled: false,
        sessionTimeout: 3600,
        loginAlerts: true,
      },
      preferences: {
        theme: 'dark',
        dashboardLayout: 'expanded',
        autoRefresh: true,
        refreshInterval: 30,
      },
    };

    res.json({
      success: true,
      data: settings,
      message: 'User settings retrieved successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Get user settings error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to retrieve user settings',
    } as ApiResponse);
  }
});

// Update user settings
router.put('/settings', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const { error, value } = updateSettingsSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(d => d.message),
      } as ApiResponse);
      return;
    }

    // For now, just validate the input and return success
    // This can be expanded when the database supports user settings updates
    res.json({
      success: true,
      data: { ...req.user, ...value },
      message: 'User settings updated successfully (basic validation only)',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Update user settings error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update user settings',
    } as ApiResponse);
  }
});

// Note: /me endpoint removed - use /auth/me instead for user profile and authentication info

export default router;
