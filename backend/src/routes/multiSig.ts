import { Router, Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
// import { ValidationHandler } from '../middleware/validation';
import { authMiddleware } from '../middleware/auth';
import { MultiSigManager } from '../security/MultiSigManager';
import { rateLimit } from 'express-rate-limit';
import { supabase } from '../config/database';
import { AuthenticatedRequest } from '../types';

const router = Router();
const multiSigManager = MultiSigManager.getInstance();

type Handler = (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;

// Rate limiting configuration
const createLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 create requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too many transaction creation attempts from this IP'
  }
});

const signLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Limit each IP to 20 signature attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too many signature attempts from this IP'
  }
});

// Create a new multi-signature transaction
router.post(
  '/',
  authMiddleware,
  createLimit,
  [
    body('type')
      .isIn(['withdrawal', 'key_rotation', 'config_change', 'compliance_override'])
      .withMessage('Invalid transaction type'),
    body('data')
      .isObject()
      .withMessage('Transaction data must be an object'),
    body('requiredSignatures')
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage('Required signatures must be between 1 and 10'),
    body('expiresIn')
      .optional()
      .isInt({ min: 300, max: 86400 })
      .withMessage('Expiration must be between 5 minutes and 24 hours'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'critical'])
      .withMessage('Invalid priority level'),
    body('approvalChain')
      .optional()
      .isArray()
      .withMessage('Approval chain must be an array of user IDs')
  ],
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const {
        type,
        data,
        requiredSignatures,
        expiresIn,
        priority,
        approvalChain
      } = req.body;

      const transaction = await multiSigManager.createTransaction(
        type,
        req.user.id,
        data,
        {
          requiredSignatures,
          expiresIn,
          priority,
          approvalChain
        }
      );

      res.status(201).json({
        message: 'Multi-signature transaction created successfully',
        transaction
      });
    } catch (error) {
      next(error);
    }
  }
);

// Sign a transaction
router.post(
  '/:transactionId/sign',
  authMiddleware,
  signLimit,
  [
    param('transactionId')
      .isString()
      .trim()
      .matches(/^msig_[a-z0-9_]+$/)
      .withMessage('Invalid transaction ID format'),
    body('signatureData')
      .isObject()
      .withMessage('Signature data must be an object'),
    body('signatureData.method')
      .isIn(['2fa', 'hardware_key', 'biometric'])
      .withMessage('Invalid signature method'),
    body('signatureData.timestamp')
      .isInt()
      .withMessage('Invalid timestamp'),
    body('signatureData.ip')
      .isIP()
      .withMessage('Invalid IP address'),
    body('signatureData.deviceId')
      .optional()
      .isString()
      .withMessage('Invalid device ID')
  ],
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const { transactionId } = req.params;
      const { signatureData } = req.body;

      // Add the signature
      const transaction = await multiSigManager.addSignature({
        userId: req.user.id,
        transactionId,
        signatureData: {
          ...signatureData,
          ip: req.ip // Use actual client IP
        }
      });

      res.json({
        message: 'Signature added successfully',
        transaction
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get transaction details
router.get(
  '/:transactionId',
  authMiddleware,
  [
    param('transactionId')
      .isString()
      .trim()
      .matches(/^msig_[a-z0-9_]+$/)
      .withMessage('Invalid transaction ID format')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const transaction = await multiSigManager.getTransaction(req.params.transactionId);

      if (!transaction) {
        res.status(404).json({
          message: 'Transaction not found'
        });
        return;
      }

      res.json({ transaction });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// List pending transactions requiring user's signature
router.get(
  '/pending',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { data, error } = await supabase
        .from('multi_sig_transactions')
        .select('*')
        .eq('status', 'pending')
        .filter('metadata->approvalChain', 'cs', `{"${req.user.id}"}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({
        transactions: data || []
      });
    } catch (error) {
      next(error);
    }
  }
);

// List transactions created by user
router.get(
  '/created',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { data, error } = await supabase
        .from('multi_sig_transactions')
        .select('*')
        .eq('created_by', req.user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      res.json({
        transactions: data || []
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;