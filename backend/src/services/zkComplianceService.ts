import { supabase } from '../config/database';
import { ComplianceVerification, ZkProof } from '../types/zkCompliance';
import { createHash } from 'crypto';
import { redisClient } from '../config/redisClient';
import AuditLogger from '../security/AuditLogger';

export interface ZkComplianceRecord {
  id: string;
  userId: string;
  jurisdiction: string;
  documentHash: string;
  requirements: string[];
  privateHash: string;
  proofData: any;
  publicSignals: string[];
  verified: boolean;
  verifiedAt: Date | null;
  expiresAt: Date | null;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class ZkComplianceService {
  private static readonly CACHE_PREFIX = 'zk:compliance:';
  private static readonly CACHE_TTL = 3600; // 1 hour
  private static readonly auditLogger = AuditLogger.getInstance(supabase);

  /**
   * Generate a unique proof identifier for caching and tracking
   */
  private static generateProofId(verification: ComplianceVerification): string {
    return createHash('sha256')
      .update(`${verification.userId}:${verification.documentHash}:${Date.now()}`)
      .digest('hex');
  }

  /**
   * Cache a verified proof for faster subsequent verifications
   */
  private static async cacheProof(proofId: string, record: ZkComplianceRecord): Promise<void> {
    await redisClient.setex(
      `${this.CACHE_PREFIX}${proofId}`,
      this.CACHE_TTL,
      JSON.stringify(record)
    );
  }

  /**
   * Get a cached proof if available
   */
  private static async getCachedProof(proofId: string): Promise<ZkComplianceRecord | null> {
    const cached = await redisClient.get(`${this.CACHE_PREFIX}${proofId}`);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * Calculate security level based on verification parameters
   */
  private static calculateSecurityLevel(verification: ComplianceVerification): string {
    const factors = [
      verification.requirements.length >= 3,
      verification.documentHash.length >= 64,
      verification.jurisdiction !== 'unknown',
      verification.metadata?.multiPartyVerification,
      verification.metadata?.hardwareAuthentication
    ];

    const score = factors.filter(Boolean).length;
    if (score >= 4) return 'HIGH';
    if (score >= 2) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Calculate risk score based on various factors
   */
  private static async calculateRiskScore(verification: ComplianceVerification): Promise<number> {
    const baseScore = 100;
    let riskScore = baseScore;

    // Check verification history
    const history = await this.getUserVerificationHistory(verification.userId);
    if (history.failedAttempts > 3) riskScore -= 20;
    if (history.successfulVerifications < 1) riskScore -= 10;

    // Check jurisdiction risk
    const jurisdictionRisk = await this.getJurisdictionRiskLevel(verification.jurisdiction);
    riskScore -= jurisdictionRisk * 5;

    // Check document complexity
    const documentComplexity = verification.requirements.length;
    if (documentComplexity < 2) riskScore -= 15;

    return Math.max(0, Math.min(100, riskScore));
  }

  /**
   * Get user's verification history
   */
  private static async getUserVerificationHistory(userId: string): Promise<{
    failedAttempts: number;
    successfulVerifications: number;
  }> {
    const { data, error } = await supabase
      .from('zk_compliance_proofs')
      .select('verified')
      .eq('user_id', userId);

    if (error) {
      await this.auditLogger.log(
        { user: { id: userId } } as any,
        'get_verification_history',
        'compliance',
        'failure',
        {
          severity: 'medium',
          details: { error: error.message }
        }
      );
      return { failedAttempts: 0, successfulVerifications: 0 };
    }

    return {
      failedAttempts: data.filter(r => !r.verified).length,
      successfulVerifications: data.filter(r => r.verified).length
    };
  }

  /**
   * Get jurisdiction risk level
   */
  private static async getJurisdictionRiskLevel(jurisdiction: string): Promise<number> {
    const riskLevels: Record<string, number> = {
      'high-risk': 15,
      'medium-risk': 10,
      'low-risk': 5,
      'unknown': 20
    };

    const cached = await redisClient.get(`jurisdiction:risk:${jurisdiction}`);
    if (cached) return parseInt(cached);

    // In a real implementation, this would call an external service
    const defaultRisk = 10;
    await redisClient.setex(`jurisdiction:risk:${jurisdiction}`, 3600, defaultRisk.toString());
    return defaultRisk;
  }
  /**
   * Create a new zero-knowledge compliance record with enhanced security
   */
  static async createComplianceRecord(
    verification: ComplianceVerification,
    proof: ZkProof
  ): Promise<ZkComplianceRecord> {
    const proofId = this.generateProofId(verification);
    
    // Check if proof already exists in cache
    const cached = await this.getCachedProof(proofId);
    if (cached) {
      return cached;
    }

    // Add metadata for audit and tracking
    const metadata = {
      proofId,
      verificationAttempts: 0,
      securityLevel: this.calculateSecurityLevel(verification),
      riskScore: await this.calculateRiskScore(verification),
      lastVerificationIp: verification.metadata?.requestIp,
      verificationMethod: verification.metadata?.hardwareAuthentication ? 'hardware' : 'standard',
      multiPartyVerification: verification.metadata?.multiPartyVerification || false,
    };

    const { data, error } = await supabase
      .from('zk_compliance_proofs')
      .insert({
        user_id: verification.userId,
        jurisdiction: verification.jurisdiction,
        document_hash: verification.documentHash,
        requirements: verification.requirements,
        proof_data: proof.proof,
        public_signals: proof.publicSignals,
        verified: false,
        metadata
      })
      .select()
      .single();

    if (error) {
      await this.auditLogger.log(
        { user: { id: verification.userId } } as any,
        'create_compliance_record_failed',
        'compliance',
        'failure',
        {
          severity: 'high',
          details: {
            error: error.message,
            jurisdiction: verification.jurisdiction,
            securityLevel: metadata.securityLevel,
            riskScore: metadata.riskScore
          }
        }
      );
      throw new Error(`Failed to create ZK compliance record: ${error.message}`);
    }

    const record = this.transformRecord(data);
    await this.cacheProof(proofId, record);
    
    await this.auditLogger.log(
      { user: { id: verification.userId } } as any,
      'compliance_record_created',
      'compliance',
      'success',
      {
        severity: 'low',
        details: {
          recordId: record.id,
          jurisdiction: verification.jurisdiction,
          securityLevel: metadata.securityLevel,
          riskScore: metadata.riskScore
        }
      }
    );

    return record;
  }

  /**
   * Get all compliance records for a user
   */
  static async getUserRecords(userId: string): Promise<ZkComplianceRecord[]> {
    const { data, error } = await supabase
      .from('zk_compliance_proofs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get user ZK compliance records: ${error.message}`);
    }

    return data.map(record => this.transformRecord(record));
  }

  /**
   * Get a specific compliance record by ID
   */
  static async getRecordById(recordId: string): Promise<ZkComplianceRecord | null> {
    const { data, error } = await supabase
      .from('zk_compliance_proofs')
      .select('*')
      .eq('id', recordId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get ZK compliance record: ${error.message}`);
    }

    return this.transformRecord(data);
  }

  /**
   * Update the verification status of a compliance record with audit logging
   */
  static async updateVerificationStatus(
    recordId: string,
    verified: boolean,
    verificationContext: Record<string, any> = {}
  ): Promise<ZkComplianceRecord> {
    // Get the current record first
    const currentRecord = await this.getRecordById(recordId);
    if (!currentRecord) {
      throw new Error('Compliance record not found');
    }

    // Update metadata
    const updatedMetadata = {
      ...currentRecord.metadata,
      lastVerifiedAt: new Date().toISOString(),
      verificationMethod: verificationContext.method || 'standard',
      verificationAttempts: (currentRecord.metadata.verificationAttempts || 0) + 1,
      lastVerificationContext: verificationContext,
    };

    const { data, error } = await supabase
      .from('zk_compliance_proofs')
      .update({
        verified,
        verified_at: verified ? new Date().toISOString() : null,
        metadata: updatedMetadata
      })
      .eq('id', recordId)
      .select()
      .single();

    if (error) {
      await this.auditLogger.log(
        { user: { id: currentRecord.userId } } as any,
        'update_verification_status_failed',
        'compliance',
        'failure',
        {
          severity: 'high',
          details: {
            error: error.message,
            recordId,
            verified,
            context: verificationContext
          }
        }
      );
      throw new Error(`Failed to update ZK compliance record status: ${error.message}`);
    }

    const record = this.transformRecord(data);
    
    // Update cache
    if (record.metadata.proofId) {
      await this.cacheProof(record.metadata.proofId, record);
    }
    await redisClient.setex(
      `${this.CACHE_PREFIX}record:${recordId}`,
      this.CACHE_TTL,
      JSON.stringify(record)
    );

    await this.auditLogger.log(
      { user: { id: record.userId } } as any,
      'verification_status_updated',
      'compliance',
      verified ? 'success' : 'failure',
      {
        severity: verified ? 'low' : 'medium',
        details: {
          recordId,
          verified,
          context: verificationContext,
          attempts: updatedMetadata.verificationAttempts
        }
      }
    );

    // If verification failed multiple times, trigger security alert
    if (!verified && updatedMetadata.verificationAttempts >= 3) {
      await this.auditLogger.log(
        { user: { id: record.userId } } as any,
        'multiple_verification_failures',
        'compliance',
        'failure',
        {
          severity: 'high',
          details: {
            recordId,
            attempts: updatedMetadata.verificationAttempts,
            jurisdiction: record.jurisdiction
          }
        }
      );
    }

    return record;
  }

  /**
   * Get compliance records by jurisdiction with security filtering and caching
   */
  static async getRecordsByJurisdiction(
    jurisdiction: string,
    verified?: boolean,
    options: {
      minSecurityLevel?: string;
      maxRiskScore?: number;
      timeframe?: { start: Date; end: Date };
      includeMetadata?: boolean;
      limit?: number;
    } = {}
  ): Promise<ZkComplianceRecord[]> {
    // Try to get from cache first
    const cacheKey = `${this.CACHE_PREFIX}jurisdiction:${jurisdiction}:${verified}:${JSON.stringify(options)}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    let query = supabase
      .from('zk_compliance_proofs')
      .select('*')
      .eq('jurisdiction', jurisdiction);

    if (verified !== undefined) {
      query = query.eq('verified', verified);
    }

    // Apply security and risk filters
    if (options.minSecurityLevel) {
      query = query.gte('metadata->securityLevel', options.minSecurityLevel);
    }
    
    if (options.maxRiskScore !== undefined) {
      query = query.lte('metadata->riskScore', options.maxRiskScore);
    }

    if (options.timeframe) {
      query = query
        .gte('created_at', options.timeframe.start.toISOString())
        .lte('created_at', options.timeframe.end.toISOString());
    }

    query = query.order('created_at', { ascending: false });
    
    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      await this.auditLogger.log(
        { user: { id: 'system' } } as any,
        'get_jurisdiction_records_failed',
        'compliance',
        'failure',
        {
          severity: 'medium',
          details: {
            error: error.message,
            jurisdiction,
            filters: { verified, ...options }
          }
        }
      );
      throw new Error(`Failed to get jurisdiction ZK compliance records: ${error.message}`);
    }

    const records = data.map(record => {
      const transformed = this.transformRecord(record);
      if (!options.includeMetadata) {
        delete transformed.metadata;
      }
      return transformed;
    });

    // Cache the results
    await redisClient.setex(
      cacheKey,
      this.CACHE_TTL,
      JSON.stringify(records)
    );

    await this.auditLogger.log(
      { user: { id: 'system' } } as any,
      'jurisdiction_records_retrieved',
      'compliance',
      'success',
      {
        severity: 'low',
        details: {
          jurisdiction,
          recordCount: records.length,
          filters: { verified, ...options }
        }
      }
    );

    return records;
  }

  /**
   * Delete a compliance record with security checks and audit logging
   */
  static async deleteRecord(recordId: string, userId: string): Promise<void> {
    // Get the current record first
    const record = await this.getRecordById(recordId);
    if (!record) {
      await this.auditLogger.log(
        { user: { id: userId } } as any,
        'delete_record_not_found',
        'compliance',
        'failure',
        {
          severity: 'medium',
          details: { recordId }
        }
      );
      throw new Error('Compliance record not found');
    }

    // Verify user has permission to delete
    if (record.userId !== userId) {
      await this.auditLogger.log(
        { user: { id: userId } } as any,
        'unauthorized_delete_attempt',
        'compliance',
        'failure',
        {
          severity: 'high',
          details: {
            recordId,
            attemptedByUserId: userId,
            recordOwnerId: record.userId
          }
        }
      );
      throw new Error('Unauthorized to delete this record');
    }

    // Verify record can be deleted (e.g., not part of active investigation)
    if (record.metadata.underInvestigation) {
      await this.auditLogger.log(
        { user: { id: userId } } as any,
        'delete_protected_record_attempt',
        'compliance',
        'failure',
        {
          severity: 'high',
          details: {
            recordId,
            reason: 'Record under investigation'
          }
        }
      );
      throw new Error('Cannot delete record under investigation');
    }

    const { error } = await supabase
      .from('zk_compliance_proofs')
      .delete()
      .eq('id', recordId);

    if (error) {
      await this.auditLogger.log(
        { user: { id: userId } } as any,
        'delete_record_failed',
        'compliance',
        'failure',
        {
          severity: 'medium',
          details: {
            error: error.message,
            recordId
          }
        }
      );
      throw new Error(`Failed to delete ZK compliance record: ${error.message}`);
    }

    // Clear caches
    await redisClient.del(`${this.CACHE_PREFIX}record:${recordId}`);
    if (record.metadata.proofId) {
      await redisClient.del(`${this.CACHE_PREFIX}${record.metadata.proofId}`);
    }

    await this.auditLogger.log(
      { user: { id: userId } } as any,
      'record_deleted',
      'compliance',
      'success',
      {
        severity: 'medium',
        details: {
          recordId,
          jurisdiction: record.jurisdiction,
          deletedAt: new Date().toISOString()
        }
      }
    );
  }

  /**
   * Transform a database record to the service format
   */
  private static transformRecord(record: any): ZkComplianceRecord {
    return {
      id: record.id,
      userId: record.user_id,
      jurisdiction: record.jurisdiction,
      documentHash: record.document_hash,
      requirements: record.requirements,
      privateHash: record.private_hash,
      proofData: record.proof_data,
      publicSignals: record.public_signals,
      verified: record.verified,
      verifiedAt: record.verified_at ? new Date(record.verified_at) : null,
      expiresAt: record.expires_at ? new Date(record.expires_at) : null,
      metadata: record.metadata || {},
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at)
    };
  }
}

export default ZkComplianceService;