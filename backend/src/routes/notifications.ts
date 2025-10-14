import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { AuthenticatedRequest, ApiResponse } from '@/types';
import { Logger } from '@/utils/logger';

const router = Router();
const logger = new Logger('notification-routes');

// Validation schemas
const deviceRegistrationSchema = Joi.object({
  token: Joi.string().required(),
  deviceId: Joi.string().required(),
  platform: Joi.string().valid('ios', 'android').required(),
});

// Register push notification device token
router.post('/register-device', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const { error, value } = deviceRegistrationSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(d => d.message),
      } as ApiResponse);
      return;
    }

    // For now, just acknowledge the registration
    // In a real implementation, store the device token for push notifications
    logger.info(`Device registered for user ${req.user.id}:`, {
      deviceId: value.deviceId,
      platform: value.platform,
      tokenPreview: value.token.substring(0, 10) + '...'
    });

    res.json({
      success: true,
      message: 'Device registered for push notifications successfully',
      data: {
        deviceId: value.deviceId,
        platform: value.platform,
        registered: true,
      }
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Register device error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to register device',
    } as ApiResponse);
  }
});

export default router;
