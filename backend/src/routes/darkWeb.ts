import { Router, Request, Response } from 'express';
import { DarkWebMonitor } from '../services/intelligence/DarkWebMonitor';
import { validateRequest } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimit';

const router = Router();
const darkWebMonitor = DarkWebMonitor.getInstance();

/**
 * @route POST /api/dark-web/scan
 * @desc Initiate a manual dark web scan for specific assets
 */
router.post('/scan',
    authenticateToken,
    rateLimiter,
    validateRequest,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { assets, scanType } = req.body;

            // Start scanning process
            await Promise.all([
                darkWebMonitor.scanHaveIBeenPwned(assets || []),
                darkWebMonitor.scanDehashed(assets || []),
                darkWebMonitor.scanDarkMarkets(assets || [])
            ]);

            res.status(200).json({ message: 'Scan initiated successfully' });
        } catch (error) {
            // Ensure all code paths return a value
            res.status(500).json({ error: 'Failed to initiate scan' });
            return;
        }
    }
);

/**
 * @route GET /api/dark-web/alerts
 * @desc Get dark web alerts with filtering and pagination
 */
router.get('/alerts',
    authenticateToken,
    rateLimiter,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const {
                severity,
                status,
                source,
                fromDate,
                toDate,
                page = 1,
                limit = 20
            } = req.query;

            const query: any = {};

            if (severity) query.severity = severity;
            if (status) query.status = status;
            if (source) query.source = source;
            if (fromDate || toDate) {
                query.timestamp = {};
                if (fromDate) query.timestamp.$gte = new Date(fromDate as string);
                if (toDate) query.timestamp.$lte = new Date(toDate as string);
            }

            const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

            const [alerts, total] = await Promise.all([
                darkWebMonitor.getAlerts(),
                darkWebMonitor.countAlerts()
            ]);

            res.status(200).json({
                alerts,
                pagination: {
                    page: parseInt(page as string),
                    limit: parseInt(limit as string),
                    total,
                    pages: Math.ceil(total / parseInt(limit as string))
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch alerts' });
            return;
        }
    }
);

/**
 * @route GET /api/dark-web/alerts/:id
 * @desc Get detailed information about a specific alert
 */
router.get('/alerts/:id',
    authenticateToken,
    rateLimiter,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const alert = await darkWebMonitor.getAlertById(req.params.id);
            if (!alert) {
                res.status(404).json({ error: 'Alert not found' });
                return;
            }
            res.status(200).json(alert);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch alert' });
            return;
        }
    }
);

/**
 * @route PATCH /api/dark-web/alerts/:id
 * @desc Update alert status, add notes, or assign to user
 */
router.patch('/alerts/:id',
    authenticateToken,
    rateLimiter,
    validateRequest,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { status, notes, assignedTo } = req.body;
            // For now, just return success without actual update
            res.status(200).json({ message: 'Alert update not implemented yet' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to update alert' });
            return;
        }
    }
);

/**
 * @route GET /api/dark-web/statistics
 * @desc Get statistics and analytics about dark web findings
 */
router.get('/statistics',
    authenticateToken,
    rateLimiter,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { fromDate, toDate } = req.query;
            const stats = await darkWebMonitor.getStatistics();
            res.status(200).json(stats);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch statistics' });
            return;
        }
    }
);

/**
 * @route POST /api/dark-web/verify/:id
 * @desc Verify or mark an alert as false positive
 */
router.post('/verify/:id',
    authenticateToken,
    rateLimiter,
    validateRequest,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { verification } = req.body;
            const result = await darkWebMonitor.verifyAlert(req.params.id);
            res.status(200).json({ verified: result });
        } catch (error) {
            res.status(500).json({ error: 'Failed to verify alert' });
            return;
        }
    }
);

export default router;