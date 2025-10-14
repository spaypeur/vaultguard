import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { AuthenticatedRequest, ApiResponse, ThreatType, ThreatSeverity, ThreatStatus } from '@/types';
import ThreatMonitoringService from '@/services/threatMonitoring';
import { Logger } from '@/utils/logger';

const router = Router();
const logger = new Logger('threats-routes');

// Validation schemas
const createThreatSchema = Joi.object({
  type: Joi.string().valid(
    'phishing', 'malware', 'suspicious_transaction', 'social_engineering',
    'network_attack', 'physical_security', 'regulatory_violation', 'market_manipulation'
  ).required(),
  severity: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
  title: Joi.string().min(1).max(500).required(),
  description: Joi.string().required(),
  sourceIp: Joi.string().optional(),
  sourceLocation: Joi.object().optional(),
  indicators: Joi.object().optional(),
  evidence: Joi.object().optional(),
  metadata: Joi.object().optional(),
});

const updateThreatStatusSchema = Joi.object({
  status: Joi.string().valid(
    'detected', 'investigating', 'confirmed', 'false_positive', 'resolved', 'ignored'
  ).required(),
  resolutionNotes: Joi.string().optional(),
});

// Get user's threats
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const { status, severity, type, limit } = req.query;

    const threats = await ThreatMonitoringService.getUserThreats(req.user.id, {
      status: status as ThreatStatus,
      severity: severity as ThreatSeverity,
      type: type as ThreatType,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json({
      success: true,
      data: threats,
      message: 'Threats retrieved successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Get threats error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to retrieve threats',
    } as ApiResponse);
  }
});

// Get threat statistics
router.get('/stats', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const stats = await ThreatMonitoringService.getThreatStats(req.user.id);

    res.json({
      success: true,
      data: stats,
      message: 'Threat statistics retrieved successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Get threat stats error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to retrieve threat statistics',
    } as ApiResponse);
  }
});

// Get threat intelligence feed
router.get('/intelligence', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const intelligence = await ThreatMonitoringService.getThreatIntelligence();

    res.json({
      success: true,
      data: intelligence,
      message: 'Threat intelligence retrieved successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Get threat intelligence error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to retrieve threat intelligence',
    } as ApiResponse);
  }
});

// Get threat by ID
router.get('/:threatId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const { threatId } = req.params;
    const threat = await ThreatMonitoringService.getThreatById(threatId, req.user.id);

    if (!threat) {
      res.status(404).json({
        success: false,
        error: 'Threat not found',
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      data: threat,
      message: 'Threat retrieved successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Get threat error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to retrieve threat',
    } as ApiResponse);
  }
});

// Create new threat (manual reporting)
router.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const { error, value } = createThreatSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(d => d.message),
      } as ApiResponse);
      return;
    }

    const threat = await ThreatMonitoringService.createThreat(req.user.id, value);

    if (!threat) {
      res.status(400).json({
        success: false,
        error: 'Failed to create threat',
      } as ApiResponse);
      return;
    }

    res.status(201).json({
      success: true,
      data: threat,
      message: 'Threat created successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Create threat error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create threat',
    } as ApiResponse);
  }
});

// Update threat status
router.patch('/:threatId/status', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const { threatId } = req.params;
    const { error, value } = updateThreatStatusSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(d => d.message),
      } as ApiResponse);
      return;
    }

    const success = await ThreatMonitoringService.updateThreatStatus(
      threatId,
      req.user.id,
      value.status,
      value.resolutionNotes
    );

    if (!success) {
      res.status(404).json({
        success: false,
        error: 'Threat not found or could not be updated',
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      message: 'Threat status updated successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Update threat status error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update threat status',
    } as ApiResponse);
  }
});

// Real-time threat detection endpoint
router.post('/detect', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const threat = await ThreatMonitoringService.detectThreats(req.user.id);

    if (!threat) {
      res.status(400).json({
        success: false,
        error: 'Failed to detect threats',
      } as ApiResponse);
      return;
    }

    res.status(201).json({
      success: true,
      data: threat,
      message: 'Threat simulation created successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Threat detection error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to detect threats',
    } as ApiResponse);
  }
});

export default router;
