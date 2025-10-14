import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { AuthenticatedRequest, ApiResponse } from '@/types';
import { RecoveryOrchestrator } from '@/services/RecoveryOrchestrator';
import { LawEnforcementCoordinationService } from '@/services/lawEnforcementCoordination';
import { BillingService } from '@/services/billingService';
import { Logger } from '@/utils/logger';

const router = Router();
const logger = new Logger('recovery-routes');

// Initialize services
const recoveryOrchestrator = new RecoveryOrchestrator();
const lawEnforcementService = new LawEnforcementCoordinationService();
const billingService = new BillingService();

// Validation schemas
const initiateRecoverySchema = Joi.object({
  incidentId: Joi.string().required(),
  stolenAssets: Joi.array().items(
    Joi.object({
      id: Joi.string().required(),
      symbol: Joi.string().required(),
      value: Joi.number().positive().required(),
      amount: Joi.number().positive().required()
    })
  ).required(),
  transactionHashes: Joi.array().items(Joi.string()).required(),
  exchangeAccounts: Joi.array().items(
    Joi.object({
      exchange: Joi.string().valid('BINANCE', 'COINBASE', 'KRAKEN', 'KUCOIN', 'OKX', 'BITFINEX', 'BITSTAMP', 'GEMINI', 'BYBIT', 'GATEIO', 'CRYPTOCOM', 'HUOBI', 'BITTREX', 'POLONIEX', 'MEXC', 'BITGET', 'LBANK', 'COINEX', 'UPBIT', 'BITFLYER').required(),
      accountId: Joi.string().required()
    })
  ).optional(),
  suspectAddresses: Joi.array().items(Joi.string()).optional(),
  jurisdiction: Joi.string().required(),
  severity: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
  metadata: Joi.object().optional()
});

const notifyLawEnforcementSchema = Joi.object({
  country: Joi.string().required(),
  incidentDetails: Joi.object({
    incidentId: Joi.string().required(),
    description: Joi.string().required(),
    stolenAssets: Joi.array().required(),
    suspectAddresses: Joi.array().items(Joi.string()).required(),
    timestamp: Joi.date().required(),
    userId: Joi.string().required()
  }).required()
});

const calculateFeesSchema = Joi.object({
  totalRecovered: Joi.number().positive().required(),
  caseComplexity: Joi.string().valid('simple', 'moderate', 'complex', 'critical').required(),
  jurisdiction: Joi.string().required(),
  recoveryTime: Joi.number().positive().required(),
  legalActionsRequired: Joi.number().min(0).required(),
  exchangeFreezes: Joi.number().min(0).required()
});

// Routes

/**
 * @route POST /api/recovery/initiate
 * @desc Initiate crypto asset recovery workflow
 */
router.post('/initiate', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const { error, value } = initiateRecoverySchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(d => d.message),
      } as ApiResponse);
      return;
    }

    const recoveryIncident = {
      ...value,
      userId: req.user.id,
      timestamp: new Date()
    };

    const workflow = await recoveryOrchestrator.initiateRecovery(recoveryIncident);

    res.status(201).json({
      success: true,
      data: workflow,
      message: 'Recovery workflow initiated successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Initiate recovery error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to initiate recovery',
    } as ApiResponse);
  }
});

/**
 * @route GET /api/recovery/status/:incidentId
 * @desc Get recovery workflow status
 */
router.get('/status/:incidentId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const { incidentId } = req.params;
    const workflow = await recoveryOrchestrator.getRecoveryStatus(incidentId);

    if (!workflow) {
      res.status(404).json({
        success: false,
        error: 'Recovery workflow not found',
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      data: workflow,
      message: 'Recovery status retrieved successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Get recovery status error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to get recovery status',
    } as ApiResponse);
  }
});

/**
 * @route POST /api/recovery/cancel/:incidentId
 * @desc Cancel recovery workflow
 */
router.post('/cancel/:incidentId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const { incidentId } = req.params;
    const cancelled = await recoveryOrchestrator.cancelRecovery(incidentId);

    if (!cancelled) {
      res.status(404).json({
        success: false,
        error: 'Recovery workflow not found or already completed',
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      message: 'Recovery workflow cancelled successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Cancel recovery error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to cancel recovery',
    } as ApiResponse);
  }
});

/**
 * @route POST /api/recovery/law-enforcement/notify
 * @desc Notify law enforcement agencies
 */
router.post('/law-enforcement/notify', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const { error, value } = notifyLawEnforcementSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(d => d.message),
      } as ApiResponse);
      return;
    }

    await lawEnforcementService.notifyLawEnforcement(
      req.user.id,
      value.country,
      value.incidentDetails
    );

    res.json({
      success: true,
      message: 'Law enforcement notified successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Notify law enforcement error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to notify law enforcement',
    } as ApiResponse);
  }
});

/**
 * @route POST /api/recovery/law-enforcement/notify-multiple
 * @desc Notify multiple law enforcement agencies
 */
router.post('/law-enforcement/notify-multiple', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const { countries, incidentDetails } = req.body;

    if (!Array.isArray(countries) || countries.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Countries array is required',
      } as ApiResponse);
      return;
    }

    const results = await lawEnforcementService.notifyMultipleJurisdictions(
      req.user.id,
      countries,
      incidentDetails
    );

    res.json({
      success: true,
      data: results,
      message: 'Multi-jurisdiction notifications sent',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Notify multiple law enforcement error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to notify law enforcement agencies',
    } as ApiResponse);
  }
});

/**
 * @route POST /api/recovery/law-enforcement/priority
 * @desc Send priority notification to law enforcement
 */
router.post('/law-enforcement/priority', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const { country, incidentDetails } = req.body;

    await lawEnforcementService.sendPriorityNotification(
      req.user.id,
      country,
      incidentDetails
    );

    res.json({
      success: true,
      message: 'Priority notification sent successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Send priority notification error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to send priority notification',
    } as ApiResponse);
  }
});

/**
 * @route GET /api/recovery/law-enforcement/contacts
 * @desc Get law enforcement contacts
 */
router.get('/law-enforcement/contacts', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const contacts = lawEnforcementService.getLawEnforcementContacts();

    res.json({
      success: true,
      data: contacts,
      message: 'Law enforcement contacts retrieved successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Get law enforcement contacts error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to get law enforcement contacts',
    } as ApiResponse);
  }
});

/**
 * @route POST /api/recovery/fees/calculate
 * @desc Calculate dynamic recovery fees
 */
router.post('/fees/calculate', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const { error, value } = calculateFeesSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(d => d.message),
      } as ApiResponse);
      return;
    }

    const feeCalculation = await billingService.calculateDynamicRecoveryFees(
      value.totalRecovered,
      value.caseComplexity,
      value.jurisdiction,
      value.recoveryTime,
      value.legalActionsRequired,
      value.exchangeFreezes
    );

    res.json({
      success: true,
      data: feeCalculation,
      message: 'Fee calculation completed successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Calculate fees error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to calculate fees',
    } as ApiResponse);
  }
});

/**
 * @route POST /api/recovery/fees/breakdown
 * @desc Get detailed fee breakdown
 */
router.post('/fees/breakdown', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const { error, value } = calculateFeesSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(d => d.message),
      } as ApiResponse);
      return;
    }

    const feeBreakdown = await billingService.getFeeBreakdown(
      value.totalRecovered,
      value.caseComplexity,
      value.jurisdiction,
      value.recoveryTime,
      value.legalActionsRequired,
      value.exchangeFreezes
    );

    res.json({
      success: true,
      data: feeBreakdown,
      message: 'Fee breakdown generated successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Get fee breakdown error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to get fee breakdown',
    } as ApiResponse);
  }
});

/**
 * @route GET /api/recovery/fees/statistics
 * @desc Get recovery fee statistics
 */
router.get('/fees/statistics', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const statistics = await billingService.getRecoveryFeeStatistics();

    res.json({
      success: true,
      data: statistics,
      message: 'Recovery fee statistics retrieved successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Get fee statistics error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to get fee statistics',
    } as ApiResponse);
  }
});

/**
 * @route GET /api/recovery/statistics
 * @desc Get recovery statistics
 */
router.get('/statistics', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const statistics = await recoveryOrchestrator.getRecoveryStatistics();

    res.json({
      success: true,
      data: statistics,
      message: 'Recovery statistics retrieved successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Get recovery statistics error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to get recovery statistics',
    } as ApiResponse);
  }
});

export default router;
