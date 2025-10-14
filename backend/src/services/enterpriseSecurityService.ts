import { Request, Response, NextFunction } from 'express';
import AdvancedRateLimiter from '../security/AdvancedRateLimiter';
import AuditLogger from '../security/AuditLogger';
import ZkComplianceVerifier from '../security/ZkComplianceVerifier';
import ApiKeyManager from '../security/ApiKeyManager';
import { redisClient } from '../config/redisClient';
import { SupabaseClient } from '@supabase/supabase-js';
import { User } from '../types/user';

class EnterpriseSecurityService {
  private static instance: EnterpriseSecurityService;
  private rateLimiter: AdvancedRateLimiter;
  private auditLogger: AuditLogger;
  private zkVerifier: ZkComplianceVerifier;
  private apiKeyManager: ApiKeyManager;

  constructor(
    private readonly supabase: SupabaseClient
  ) {
    this.rateLimiter = AdvancedRateLimiter.getInstance();
    this.auditLogger = AuditLogger.getInstance(supabase);
    this.zkVerifier = ZkComplianceVerifier.getInstance();
    this.apiKeyManager = ApiKeyManager.getInstance(supabase);
  }

  static getInstance(supabase: SupabaseClient): EnterpriseSecurityService {
    if (!EnterpriseSecurityService.instance) {
      EnterpriseSecurityService.instance = new EnterpriseSecurityService(supabase);
    }
    return EnterpriseSecurityService.instance;
  }

  /**
   * Enterprise security middleware that combines multiple security features
   */
  securityMiddleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // 1. API Key Validation
        const apiKey = req.headers['x-api-key'] as string;
        if (!apiKey) {
          throw new Error('API key is required');
        }

        const userId = await this.apiKeyManager.validateApiKey(apiKey);
        if (!userId) {
          throw new Error('Invalid API key');
        }

        // 2. Rate Limiting
        const strictLimiter = this.rateLimiter.createStrictLimiter(60 * 1000, 10);
        await new Promise((resolve, reject) => {
          strictLimiter(req, res, (err?: any) => {
            if (err) reject(err);
            resolve(true);
          });
        });

        // 3. Audit Logging
        await this.auditLogger.log(
          req,
          'API_REQUEST',
          'security',
          'success',
          {
            severity: 'low',
            details: {
              path: req.path,
              method: req.method,
              userId
            }
          }
        );

        // Add user context to request
        // Fetch full user details from Supabase
        const { data: userData, error: userError } = await this.supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (userError || !userData) {
          throw new Error('User not found');
        }

        req.user = userData;
        next();
      } catch (error: any) {
        await this.auditLogger.log(
          req,
          'SECURITY_VIOLATION',
          'security',
          'failure',
          {
            severity: 'high',
            details: {
              error: error.message,
              path: req.path,
              method: req.method
            }
          }
        );

        res.status(401).json({
          error: 'Security check failed',
          message: error.message
        });
      }
    };
  }

  /**
   * Schedule API key rotation for a user
   */
  async scheduleKeyRotation(userId: string, rotationInterval?: number) {
    try {
      const { data: apiKey } = await this.supabase
        .from('api_keys')
        .select('key')
        .eq('userId', userId)
        .eq('isActive', true)
        .single();

      if (!apiKey) {
        throw new Error('No active API key found for user');
      }

      await this.apiKeyManager.scheduleKeyRotation(apiKey.key);
      
      await this.auditLogger.log(
        { user: { id: userId } } as Request,
        'API_KEY_ROTATION_SCHEDULED',
        'security',
        'success',
        {
          severity: 'medium',
          details: { rotationInterval }
        }
      );
    } catch (error: any) {
      await this.auditLogger.log(
        { user: { id: userId } } as Request,
        'API_KEY_ROTATION_FAILED',
        'security',
        'failure',
        {
          severity: 'high',
          details: { error: error.message }
        }
      );
      throw error;
    }
  }

  /**
   * Verify compliance with zero-knowledge proofs
   */
  async verifyCompliance(
    userId: string,
    jurisdiction: string,
    requirements: string[],
    privateData: any
  ): Promise<{
    isCompliant: boolean;
    proof: any;
    verification: any;
  }> {
    try {
      const verification = await this.zkVerifier.generateVerificationRequest(
        userId,
        jurisdiction,
        requirements
      );

      const proof = await this.zkVerifier.generateComplianceProof(
        verification,
        privateData
      );

      const isCompliant = await this.zkVerifier.verifyJurisdictionCompliance(
        jurisdiction,
        requirements,
        proof
      );

      await this.auditLogger.log(
        { user: { id: userId } } as Request,
        'COMPLIANCE_VERIFICATION',
        'compliance',
        isCompliant ? 'success' : 'failure',
        {
          severity: isCompliant ? 'low' : 'critical',
          details: {
            jurisdiction,
            requirements,
            isCompliant
          }
        }
      );

      return {
        isCompliant,
        proof,
        verification
      };
    } catch (error: any) {
      await this.auditLogger.log(
        { user: { id: userId } } as Request,
        'COMPLIANCE_VERIFICATION_ERROR',
        'compliance',
        'failure',
        {
          severity: 'critical',
          details: {
            error: error.message,
            jurisdiction,
            requirements
          }
        }
      );
      throw error;
    }
  }

  /**
   * Get security metrics for monitoring
   */
  async getSecurityMetrics() {
    try {
      const auditMetrics = await this.auditLogger.getSecurityMetrics();

      return {
        ...auditMetrics,
        rateLimiting: {
          isEnabled: true,
          strict: {
            windowMs: 60 * 1000,  // 1 minute
            maxRequests: 5
          },
          standard: {
            windowMs: 15 * 60 * 1000,  // 15 minutes
            maxRequests: 100
          }
        }
      };
    } catch (error: any) {
      console.error('Failed to get security metrics:', error);
      throw error;
    }
  }

  /**
   * Verify audit log integrity
   */
  async verifySystemIntegrity(): Promise<boolean> {
    try {
      const isAuditLogIntact = await this.auditLogger.verifyLogIntegrity();
      
      await this.auditLogger.log(
        { user: { id: 'system' } } as Request,
        'INTEGRITY_CHECK',
        'security',
        isAuditLogIntact ? 'success' : 'failure',
        {
          severity: isAuditLogIntact ? 'low' : 'critical',
          details: {
            auditLogIntact: isAuditLogIntact
          }
        }
      );

      return isAuditLogIntact;
    } catch (error: any) {
      await this.auditLogger.log(
        { user: { id: 'system' } } as Request,
        'INTEGRITY_CHECK_ERROR',
        'security',
        'failure',
        {
          severity: 'critical',
          details: {
            error: error.message
          }
        }
      );
      throw error;
    }
  }
}

export default EnterpriseSecurityService;