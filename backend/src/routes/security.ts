import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/validation';
import { authMiddleware } from '../middleware/auth';
import { ContractScan } from '../models/ContractScan';
import { SmartContractScanner } from '../services/security/SmartContractScanner';
import { rateLimiter } from '../middleware/rateLimit';
import { Logger } from '../utils/logger';
import { createJob, JobQueue } from '../services/queue';

const router = Router();
const logger = new Logger('ContractScanController');

// Validation schemas
const scanContractSchema = z.object({
    body: z.object({
        address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
        chainId: z.number().int().positive(),
        name: z.string().min(1).max(100),
        scanType: z.enum(['quick', 'standard', 'deep']).default('standard'),
        rescanInterval: z.number().int().min(0).optional(),
        alerts: z.boolean().default(true)
    })
});

const listScansSchema = z.object({
    query: z.object({
        page: z.string().regex(/^\d+$/).default('1'),
        limit: z.string().regex(/^\d+$/).default('10'),
        status: z.enum(['pending', 'in-progress', 'completed', 'failed']).optional(),
        sortBy: z.enum(['timestamp', 'score']).default('timestamp'),
        sortOrder: z.enum(['asc', 'desc']).default('desc')
    })
});

// Rate limits - using the default rate limiter from middleware

// Routes
router.post(
    '/scan',
    authMiddleware,
    rateLimiter,
    async (req, res) => {
        try {
            const { address, chainId, name, scanType, rescanInterval, alerts } = req.body;
            const userId = req.user!.id;

            // Check for existing scan
            const existingScan = await ContractScan.findOne({
                owner: userId,
                contractAddress: address,
                chainId
            });

            if (existingScan) {
                return res.status(409).json({
                    error: 'A scan already exists for this contract'
                });
            }

            // Create scan record
            const scan = await ContractScan.create({
                contractAddress: address,
                chainId,
                name,
                owner: userId,
                status: 'pending',
                scanType,
                rescanInterval,
                alerts
            });

            // Queue scan job
            await createJob(JobQueue.CONTRACT_SCAN, {
                scanId: scan._id,
                address,
                chainId,
                scanType
            });

            res.status(202).json({
                message: 'Contract scan queued successfully',
                scanId: scan._id
            });
        } catch (error) {
            logger.error('Error queuing contract scan:', error);
            res.status(500).json({
                error: 'Failed to queue contract scan'
            });
        }
    }
);

router.get(
    '/scans',
    authMiddleware,
    validateRequest(listScansSchema),
    async (req, res) => {
        try {
            const { page, limit, status, sortBy, sortOrder } = req.query;
            const userId = req.user!.id;

            const query: any = { owner: userId };
            if (status) {
                query.status = status;
            }

            const pageNum = parseInt(page as string);
            const limitNum = parseInt(limit as string);
            const skip = (pageNum - 1) * limitNum;

            const scans = await ContractScan.find(query);
            const total = await ContractScan.countDocuments(query);

            res.json({
                scans,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum)
                }
            });
            return;
        } catch (error) {
            logger.error('Error listing contract scans:', error);
            res.status(500).json({
                error: 'Failed to list contract scans'
            });
        }
    }
);

router.get(
    '/scans/:id',
    authMiddleware,
    async (req, res) => {
        try {
            const scan = await ContractScan.findOne({
                _id: req.params.id,
                owner: req.user!.id
            });

            if (!scan) {
                return res.status(404).json({
                    error: 'Contract scan not found'
                });
            }

            res.json(scan);
            return;
        } catch (error) {
            logger.error('Error fetching contract scan:', error);
            res.status(500).json({
                error: 'Failed to fetch contract scan'
            });
        }
    }
);

router.delete(
    '/scans/:id',
    authMiddleware,
    async (req, res) => {
        try {
            const scan = await ContractScan.findOneAndDelete({
                _id: req.params.id,
                owner: req.user!.id
            });

            if (!scan) {
                return res.status(404).json({
                    error: 'Contract scan not found'
                });
            }

            res.json({
                message: 'Contract scan deleted successfully'
            });
            return;
        } catch (error) {
            logger.error('Error deleting contract scan:', error);
            res.status(500).json({
                error: 'Failed to delete contract scan'
            });
        }
    }
);

export default router;