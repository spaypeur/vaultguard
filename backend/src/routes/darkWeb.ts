import { Router } from 'express';
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
    async (req, res) => {
        try {
            const { assets, scanType } = req.body;
            
            // Start scanning process
            await Promise.all([
                darkWebMonitor.scanHaveIBeenPwned(),
                darkWebMonitor.scanDehashed(),
                darkWebMonitor.scanDarkMarkets()
            ]);
            
            res.status(200).json({ message: 'Scan initiated successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to initiate scan' });
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
    async (req, res) => {
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
                darkWebMonitor.getAlerts(query, skip, parseInt(limit as string)),
                darkWebMonitor.countAlerts(query)
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
    async (req, res) => {
        try {
            const alert = await darkWebMonitor.getAlertById(req.params.id);
            if (!alert) {
                return res.status(404).json({ error: 'Alert not found' });
            }
            res.status(200).json(alert);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch alert' });
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
    async (req, res) => {
        try {
            const { status, notes, assignedTo } = req.body;
            const updatedAlert = await darkWebMonitor.updateAlert(req.params.id, {
                status,
                notes,
                assignedTo
            });
            if (!updatedAlert) {
                return res.status(404).json({ error: 'Alert not found' });
            }
            res.status(200).json(updatedAlert);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update alert' });
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
    async (req, res) => {
        try {
            const { fromDate, toDate } = req.query;
            const stats = await darkWebMonitor.getStatistics(
                fromDate ? new Date(fromDate as string) : undefined,
                toDate ? new Date(toDate as string) : undefined
            );
            res.status(200).json(stats);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch statistics' });
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
    async (req, res) => {
        try {
            const { verification } = req.body;
            const updatedAlert = await darkWebMonitor.verifyAlert(
                req.params.id,
                verification
            );
            if (!updatedAlert) {
                return res.status(404).json({ error: 'Alert not found' });
            }
            res.status(200).json(updatedAlert);
        } catch (error) {
            res.status(500).json({ error: 'Failed to verify alert' });
        }
    }
);

export default router;