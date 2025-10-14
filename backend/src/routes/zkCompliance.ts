import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import ZkComplianceVerifier from '../security/ZkComplianceVerifier';

const router = Router();

/**
 * Generate a compliance verification request
 * POST /api/compliance/zk/request
 */
router.post('/request',
  [
    body('userId').isString().notEmpty(),
    body('jurisdiction').isString().notEmpty(),
    body('requirements').isArray().notEmpty(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { userId, jurisdiction, requirements } = req.body;

      const verifier = ZkComplianceVerifier.getInstance();
      const verificationRequest = await verifier.generateVerificationRequest(
        userId,
        jurisdiction,
        requirements
      );

      res.json(verificationRequest);
    } catch (error) {
      console.error('Error generating verification request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Generate a zero-knowledge proof of compliance
 * POST /api/compliance/zk/proof
 */
router.post('/proof',
  [
    body('verification').isObject().notEmpty(),
    body('privateData').isObject().notEmpty(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { verification, privateData } = req.body;

      const verifier = ZkComplianceVerifier.getInstance();
      const proof = await verifier.generateComplianceProof(verification, privateData);

      res.json(proof);
    } catch (error) {
      console.error('Error generating compliance proof:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Verify a zero-knowledge proof of compliance
 * POST /api/compliance/zk/verify
 */
router.post('/verify',
  [
    body('jurisdiction').isString().notEmpty(),
    body('requirements').isArray().notEmpty(),
    body('proof').isObject().notEmpty(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { jurisdiction, requirements, proof } = req.body;

      const verifier = ZkComplianceVerifier.getInstance();
      const isValid = await verifier.verifyJurisdictionCompliance(
        jurisdiction,
        requirements,
        proof
      );

      res.json({ isValid });
    } catch (error) {
      console.error('Error verifying compliance:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;