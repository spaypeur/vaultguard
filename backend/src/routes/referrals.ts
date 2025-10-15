import { Router, Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import ReferralService from '../services/referralService';
import { authMiddleware } from '../middleware/auth';
import { ApiResponseHelper } from '../utils/apiResponse';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create referral code
router.post('/', [
  body('type').optional().isIn(['standard', 'affiliate', 'influencer', 'partner']),
  body('metadata').optional().isObject(),
], async (req: Request, res: Response) => {
  try {
    const { type = 'standard', metadata } = req.body;
    const userId = req.user!.id;

    const referral = await ReferralService.createReferral(userId, undefined, type, metadata);
    ApiResponseHelper.success(res, referral, 'Referral created successfully');
  } catch (error: any) {
    ApiResponseHelper.error(res, error.message);
  }
});

// Get user's referral statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const stats = await ReferralService.getReferralStats(userId);
    ApiResponseHelper.success(res, stats);
  } catch (error: any) {
    ApiResponseHelper.error(res, error.message);
  }
});

// Generate referral link
router.post('/:referralId/link', [
  param('referralId').isUUID(),
  body('platform').optional().isIn(['twitter', 'facebook', 'linkedin', 'whatsapp', 'telegram', 'email', 'direct']),
  body('customPath').optional().isString(),
], async (req: Request, res: Response) => {
  try {
    const { referralId } = req.params;
    const { platform, customPath } = req.body;

    const referralLink = await ReferralService.generateReferralLink(referralId, platform, customPath);
    ApiResponseHelper.success(res, referralLink, 'Referral link generated successfully');
  } catch (error: any) {
    ApiResponseHelper.error(res, error.message);
  }
});

// Process referral (when someone uses a referral code)
router.post('/process', [
  body('referralCode').isString().notEmpty(),
], async (req: Request, res: Response) => {
  try {
    const { referralCode } = req.body;
    const userId = req.user!.id;
    const userEmail = req.user!.email;

    const result = await ReferralService.processReferral(referralCode, userId, userEmail);
    ApiResponseHelper.success(res, result, 'Referral processed successfully');
  } catch (error: any) {
    ApiResponseHelper.error(res, error.message);
  }
});

// Get leaderboard
router.get('/leaderboard', [
  query('period').optional().isIn(['daily', 'weekly', 'monthly', 'all_time']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], async (req: Request, res: Response) => {
  try {
    const period = req.query.period as any || 'monthly';
    const limit = parseInt(req.query.limit as string) || 10;

    const leaderboard = await ReferralService.getLeaderboard(period, limit);
    ApiResponseHelper.success(res, leaderboard);
  } catch (error: any) {
    ApiResponseHelper.error(res, error.message);
  }
});

// Create affiliate program
router.post('/affiliate', [
  body('commissionRate').optional().isFloat({ min: 0, max: 50 }),
  body('payoutInfo').isObject(),
], async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { commissionRate = 10, payoutInfo } = req.body;

    const affiliateProgram = await ReferralService.createAffiliateProgram(userId, commissionRate, payoutInfo);
    ApiResponseHelper.success(res, affiliateProgram, 'Affiliate program created successfully');
  } catch (error: any) {
    ApiResponseHelper.error(res, error.message);
  }
});

// Track affiliate link click
router.post('/affiliate/track/:affiliateCode', async (req: Request, res: Response) => {
  try {
    const { affiliateCode } = req.params;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    await ReferralService.trackAffiliateClick(affiliateCode, ipAddress, userAgent);
    ApiResponseHelper.success(res, { tracked: true });
  } catch (error: any) {
    ApiResponseHelper.error(res, error.message);
  }
});

export default router;