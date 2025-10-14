import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { AuthenticatedRequest, ApiResponse, Jurisdiction, ComplianceType, ComplianceStatus } from '@/types';
import { ApiResponseHelper, ErrorHandler } from '@/utils/apiResponse';
import { ValidationHelper } from '@/utils/validation';
import DatabaseService from '@/services/database';
import { supabase } from '@/config/database';
import { Logger } from '@/utils/logger';
import zkComplianceRouter from './zkCompliance';
import ZkComplianceService from '@/services/zkComplianceService';
import ZkComplianceVerifier from '@/security/ZkComplianceVerifier';

const router = Router();
const logger = new Logger('compliance-routes');

// Initialize ZK verifier
const zkVerifier = ZkComplianceVerifier.getInstance();

// Mount zero-knowledge compliance routes
router.use('/zk', zkComplianceRouter);

// Use ValidationHelper instead of duplicate Joi schemas
const createComplianceRecordSchema = ValidationHelper.complianceRecordSchema();
const updateComplianceRecordSchema = ValidationHelper.complianceUpdateSchema();

// Get user's compliance records - ELIMINATING DUPLICATE RESPONSE PATTERNS
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    ApiResponseHelper.unauthorized(res);
    return;
  }

  await ErrorHandler.handle(
    res,
    async () => {
      const records = await DatabaseService.getComplianceRecordsByUserId(req.user!.id);
      ApiResponseHelper.success(
        res,
        records,
        'Compliance records retrieved successfully'
      );
    },
    'Get compliance records'
  );
});

// Create new compliance record
router.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const { error, value } = createComplianceRecordSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(d => d.message),
      } as ApiResponse);
      return;
    }

    const record = await DatabaseService.createComplianceRecord({
      userId: req.user.id,
      jurisdiction: value.jurisdiction,
      type: value.type,
      status: ComplianceStatus.PENDING,
      dueDate: value.dueDate,
      documents: value.documents || [],
      notes: value.notes,
    });
    
    if (!record) {
      res.status(400).json({
        success: false,
        error: 'Failed to create compliance record',
      } as ApiResponse);
      return;
    }

    // Log compliance record creation
    await DatabaseService.logAuditEvent(
      req.user.id,
      'compliance_record_created',
      'compliance_record',
      record.id,
      null,
      {
        jurisdiction: record.jurisdiction,
        type: record.type,
        title: value.title,
      }
    );

    res.status(201).json({
      success: true,
      data: record,
      message: 'Compliance record created successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Create compliance record error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create compliance record',
    } as ApiResponse);
  }
});

// Get compliance record by ID
router.get('/:recordId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const { recordId } = req.params;
    
    // Try to get both standard and ZK compliance records
    const [standardRecord, zkRecord] = await Promise.all([
      supabase
        .from('compliance_records')
        .select('*')
        .eq('id', recordId)
        .single()
        .then(({ data }: { data: any }) => data),
      ZkComplianceService.getRecordById(recordId)
    ]);

    const record = standardRecord || zkRecord;
    
    if (!record || (standardRecord?.user_id !== req.user.id && zkRecord?.userId !== req.user.id)) {
      res.status(404).json({
        success: false,
        error: 'Compliance record not found',
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      data: record,
      message: 'Compliance record retrieved successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Get compliance record error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to retrieve compliance record',
    } as ApiResponse);
  }
});

// Update compliance record
router.put('/:recordId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const { recordId } = req.params;
    const { error, value } = updateComplianceRecordSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(d => d.message),
      } as ApiResponse);
      return;
    }

    // Check if record exists and belongs to user
    const { data: existingRecord } = await supabase
      .from('compliance_records')
      .select('*')
      .eq('id', recordId)
      .single();

    if (!existingRecord || existingRecord.user_id !== req.user.id) {
      res.status(404).json({
        success: false,
        error: 'Compliance record not found',
      } as ApiResponse);
      return;
    }

    // Update record
    const { data: updatedRecord, error: updateError } = await supabase
      .from('compliance_records')
      .update({
        ...value,
        updated_at: new Date().toISOString(),
      })
      .eq('id', recordId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Log compliance record update
    await DatabaseService.logAuditEvent(
      req.user.id,
      'compliance_record_updated',
      'compliance_record',
      recordId,
      existingRecord,
      value
    );

    res.json({
      success: true,
      data: updatedRecord,
      message: 'Compliance record updated successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Update compliance record error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update compliance record',
    } as ApiResponse);
  }
});

// Get compliance requirements (what frontend expects)
router.get('/requirements', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const { framework = 'all', jurisdiction = 'all' } = req.query;

    // Get both standard compliance records and ZK records
    const [standardRecords, zkRecords] = await Promise.all([
      DatabaseService.getComplianceRecordsByUserId(req.user.id),
      ZkComplianceService.getUserRecords(req.user.id)
    ]);

    // Filter standard records by framework and jurisdiction
    const filteredStandardRecords = standardRecords.filter((r: any) => 
      (framework === 'all' || r.type === framework) &&
      (jurisdiction === 'all' || r.jurisdiction === jurisdiction)
    );

    // Filter ZK records by jurisdiction
    const filteredZkRecords = zkRecords.filter(r => 
      jurisdiction === 'all' || r.jurisdiction === jurisdiction
    );

    // Convert ZK records to standard format
    const zkRequirements = filteredZkRecords.map(record => ({
      id: record.id,
      name: 'Zero-Knowledge Compliance Verification',
      description: `Verified compliance for ${record.jurisdiction}`,
      status: record.verified ? 'compliant' : 'pending',
      dueDate: record.expiresAt?.toISOString(),
      jurisdiction: record.jurisdiction,
      framework: 'ZK-COMPLIANCE',
      priority: 'high',
      lastChecked: record.verifiedAt?.toISOString() || record.updatedAt.toISOString(),
      evidence: record.publicSignals
    }));

    // Convert standard records to frontend format
    const standardRequirements = filteredStandardRecords.map((record: any) => ({
      id: record.id,
      name: record.name || 'Requirement',
      description: record.details || 'Compliance requirement details',
      status: record.status === 'approved' ? 'compliant' :
              record.status === 'rejected' ? 'non_compliant' :
              record.status === 'in_review' ? 'pending' : 'pending',
      dueDate: record.dueDate ? new Date(record.dueDate).toISOString() : undefined,
      jurisdiction: record.jurisdiction,
      framework: 'GDPR',
      priority: record.type === 'kyc' || record.type === 'aml' ? 'high' : 'medium',
      lastChecked: record.updatedAt?.toISOString() || record.createdAt.toISOString(),
      evidence: record.documents || []
    }));

    // Combine all requirements
    const requirements = [...zkRequirements, ...standardRequirements];

    res.json({
      success: true,
      data: requirements,
      message: 'Compliance requirements retrieved successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Get compliance requirements error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to retrieve compliance requirements',
    } as ApiResponse);
  }
});

// Get compliance statistics
router.get('/stats', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const records = await DatabaseService.getComplianceRecordsByUserId(req.user.id);

    const stats = {
      total: records.length,
      compliant: records.filter(r => r.status === 'approved').length,
      nonCompliant: records.filter(r => r.status === 'rejected').length,
      pending: records.filter(r => r.status === 'pending' || r.status === 'in_review').length,
    };

    res.json({
      success: true,
      data: stats,
      message: 'Compliance statistics retrieved successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Get compliance stats error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to retrieve compliance statistics',
    } as ApiResponse);
  }
});

// Update compliance requirement (what frontend expects)
router.put('/requirements/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    const { id } = req.params;
    const { status, evidence } = req.body;

    // Check if this is a ZK compliance record
    const zkRecord = await ZkComplianceService.getRecordById(id);
    if (zkRecord) {
      if (zkRecord.userId !== req.user.id) {
        res.status(403).json({
          success: false,
          error: 'Not authorized to update this record',
        } as ApiResponse);
        return;
      }

      const updatedRecord = await ZkComplianceService.updateVerificationStatus(
        id,
        status === 'compliant'
      );
      
      res.json({
        success: true,
        data: updatedRecord,
        message: 'ZK compliance requirement updated successfully',
      } as ApiResponse);
      return;
    }

    // If not a ZK record, update standard compliance record
    const success = await DatabaseService.createComplianceRecord({
      id,
      userId: req.user.id,
      status
    });

    if (!success) {
      res.status(404).json({
        success: false,
        error: 'Compliance requirement not found',
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      message: 'Compliance requirement updated successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Update compliance requirement error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update compliance requirement',
    } as ApiResponse);
  }
});

// Get compliance summary
router.get('/summary/overview', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      } as ApiResponse);
      return;
    }

    // Get both standard and ZK compliance records
    const [standardRecords, zkRecords] = await Promise.all([
      DatabaseService.getComplianceRecordsByUserId(req.user.id),
      ZkComplianceService.getUserRecords(req.user.id)
    ]);

    const summary = {
      total: standardRecords.length + zkRecords.length,
      byStatus: {} as Record<ComplianceStatus, number>,
      byType: {} as Record<ComplianceType, number>,
      byJurisdiction: {} as Record<Jurisdiction, number>,
      zkCompliance: {
        total: zkRecords.length,
        verified: zkRecords.filter(r => r.verified).length,
        pending: zkRecords.filter(r => !r.verified).length
      },
      upcoming: standardRecords.filter(r => (r as any).due_date && new Date((r as any).due_date) > new Date()).length,
      overdue: standardRecords.filter(r => (r as any).due_date && new Date((r as any).due_date) < new Date() && r.status !== ComplianceStatus.APPROVED).length,
    };

    // Count by status (for standard records)
    Object.values(ComplianceStatus).forEach(status => {
      summary.byStatus[status] = standardRecords.filter(r => r.status === status).length;
    });

    // Count by type (for standard records)
    Object.values(ComplianceType).forEach(type => {
      summary.byType[type] = standardRecords.filter(r => r.type === type).length;
    });

    // Count by jurisdiction (both standard and ZK records)
    Object.values(Jurisdiction).forEach(jurisdiction => {
      summary.byJurisdiction[jurisdiction] = 
        standardRecords.filter(r => r.jurisdiction === jurisdiction).length +
        zkRecords.filter(r => r.jurisdiction === jurisdiction).length;
    });

    res.json({
      success: true,
      data: summary,
      message: 'Compliance summary retrieved successfully',
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Get compliance summary error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to retrieve compliance summary',
    } as ApiResponse);
  }
});

export default router;
