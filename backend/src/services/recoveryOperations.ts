import { Logger } from '../utils/logger';
import { NotificationService } from './notification';
import { DatabaseService } from './database';
import { RecoveryCase, RecoveryStatus, AuditLogEntry, Asset } from '../types';

export class RecoveryOperationsService {
  private logger = new Logger('RecoveryOperationsService');
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = NotificationService.getInstance();
    this.logger.info('Recovery Operations Service initialized.');
  }

  public async createRecoveryCase(incidentDetails: {
    incidentId: string;
    userId: string;
    stolenAssets: Asset[];
    suspectAddresses?: string[];
  }): Promise<RecoveryCase | null> {
    const newCase: Partial<RecoveryCase> = {
      incidentId: incidentDetails.incidentId,
      userId: incidentDetails.userId,
      stolenAssets: incidentDetails.stolenAssets,
      suspectAddresses: incidentDetails.suspectAddresses || [],
      status: RecoveryStatus.PENDING,
      legalActions: [],
      auditLog: [{ timestamp: new Date(), event: 'Recovery case created' }],
    };
    try {
      const createdCase = await DatabaseService.createRecoveryCase(newCase as any);
      if (createdCase) {
        await DatabaseService.logAuditEvent(incidentDetails.userId, 'create_recovery_case', 'RecoveryCase', createdCase.id, null, newCase);
        this.logger.info(`Recovery case created: ${createdCase.id} for user ${createdCase.userId}`);
      }
      return createdCase;
    } catch (error) {
      this.logger.error('Error creating recovery case:', error);
      return null;
    }
  }

  public async updateRecoveryCaseStatus(caseId: string, status: RecoveryStatus, notes?: string): Promise<RecoveryCase | null> {
    try {
      const existingCase = await DatabaseService.getRecoveryCaseById(caseId);
      if (!existingCase) {
        this.logger.warn(`Recovery case ${caseId} not found for status update.`);
        return null;
      }

      const updatedAuditLog = [...existingCase.auditLog, { timestamp: new Date(), event: `Status updated to ${status}` + (notes ? `: ${notes}` : '') }];
      const updatedCase = await DatabaseService.updateRecoveryCase(caseId, {
        status,
        audit_log: updatedAuditLog as any, // Cast to any due to JSONB storage
      });

      if (updatedCase) {
        await DatabaseService.logAuditEvent(updatedCase.userId, 'update_recovery_case_status', 'RecoveryCase', updatedCase.id, existingCase.status, status, { notes });
        await this.notificationService.send({
          type: 'RECOVERY_STATUS_UPDATE',
          data: { userId: updatedCase.userId, message: `Your recovery case ${caseId} status has been updated to ${status}.` }
        });
        this.logger.info(`Recovery case ${caseId} status updated to ${status}.`);
      }
      return updatedCase;
    } catch (error) {
      this.logger.error(`Failed to update recovery case ${caseId} status:`, error);
      return null;
    }
  }

  public async triggerLegalAction(caseId: string, action: string, legalTeamId?: string): Promise<RecoveryCase | null> {
    try {
      const existingCase = await DatabaseService.getRecoveryCaseById(caseId);
      if (!existingCase) {
        this.logger.warn(`Recovery case ${caseId} not found for legal action.`);
        return null;
      }

      const updatedLegalActions = [...existingCase.legalActions, action];
      const updatedAuditLog = [...existingCase.auditLog, { timestamp: new Date(), event: `Legal action triggered: ${action}`, metadata: { legalTeamId } }];

      const updatedCase = await DatabaseService.updateRecoveryCase(caseId, {
        legal_actions: updatedLegalActions as any,
        audit_log: updatedAuditLog as any, // Cast to any due to JSONB storage
        status: RecoveryStatus.LEGAL_ACTION_INITIATED,
      });

      if (updatedCase) {
        await DatabaseService.logAuditEvent(updatedCase.userId, 'trigger_legal_action', 'RecoveryCase', updatedCase.id, existingCase.legalActions, updatedLegalActions, { action, legalTeamId });
        await this.notificationService.send({
          type: 'RECOVERY_LEGAL_ACTION',
          data: { userId: updatedCase.userId, message: `Legal action '${action}' initiated for your recovery case ${caseId}.` }
        });
        this.logger.info(`Triggered legal action '${action}' for case ${caseId}. Legal Team: ${legalTeamId || 'internal'}`);
      }
      return updatedCase;
    } catch (error) {
      this.logger.error(`Failed to trigger legal action for case ${caseId}:`, error);
      return null;
    }
  }

  public async notifyUserOfRecoveryUpdate(userId: string, message: string): Promise<void> {
    await this.notificationService.send({
      type: 'RECOVERY_NOTIFICATION',
      data: { userId, message }
    });
    await DatabaseService.logAuditEvent(userId, 'notify_user_recovery_update', 'User', userId, null, { message });
    this.logger.info(`Notifying user ${userId} about recovery update: ${message}`);
  }

  public async getRecoveryCase(caseId: string): Promise<RecoveryCase | null> {
    try {
      const recoveryCase = await DatabaseService.getRecoveryCaseById(caseId);
      if (recoveryCase) {
        await DatabaseService.logAuditEvent(recoveryCase.userId, 'get_recovery_case', 'RecoveryCase', caseId);
      }
      return recoveryCase;
    } catch (error) {
      this.logger.error(`Error fetching recovery case ${caseId}:`, error);
      return null;
    }
  }

  public async initiateLegalRecovery(
    caseId: string,
    jurisdiction: string,
    recoveryAnalysis: any
  ): Promise<{
    success: boolean;
    estimatedTimeline: string;
    legalActions: string[];
    nextSteps: string[];
  }> {
    try {
      const recoveryCase = await DatabaseService.getRecoveryCaseById(caseId);
      if (!recoveryCase) {
        throw new Error(`Recovery case ${caseId} not found`);
      }

      // Define legal actions based on jurisdiction and analysis
      const legalActions = this.determineLegalActions(jurisdiction, recoveryAnalysis);
      
      // Update case with legal actions
      await Promise.all(legalActions.map(action => 
        this.triggerLegalAction(caseId, action)
      ));

      // Calculate estimated timeline
      const estimatedTimeline = this.calculateLegalTimeline(jurisdiction, legalActions);

      // Determine next steps
      const nextSteps = this.determineLegalNextSteps(jurisdiction, legalActions);

      const result = {
        success: true,
        estimatedTimeline,
        legalActions,
        nextSteps
      };

      await DatabaseService.logAuditEvent(
        recoveryCase.userId,
        'initiate_legal_recovery',
        'RecoveryCase',
        caseId,
        null,
        result
      );

      return result;
    } catch (error: any) {
      this.logger.error(`Failed to initiate legal recovery for case ${caseId}:`, error);
      throw error;
    }
  }

  private determineLegalActions(jurisdiction: string, recoveryAnalysis: any): string[] {
    const actions = ['Asset Tracing Documentation'];

    // Add jurisdiction-specific actions
    switch (jurisdiction.toUpperCase()) {
      case 'US':
        actions.push(
          'FBI Cyber Crime Report',
          'SEC Complaint Filing',
          'Civil Asset Forfeiture Petition'
        );
        break;
      case 'EU':
        actions.push(
          'Europol Cybercrime Report',
          'EU Member State Coordination',
          'Asset Freeze Request'
        );
        break;
      case 'UK':
        actions.push(
          'NCA Report Filing',
          'High Court Injunction Request',
          'Worldwide Freezing Order'
        );
        break;
      default:
        actions.push(
          'International Law Enforcement Coordination',
          'Local Authority Notification',
          'Cross-Border Asset Freeze Request'
        );
    }

    // Add analysis-based actions
    if (recoveryAnalysis.exchangeDeposits > 0) {
      actions.push('Exchange Coordination Request');
    }

    if (recoveryAnalysis.mixerUsage) {
      actions.push('Mixer Transaction Analysis');
    }

    return actions;
  }

  private calculateLegalTimeline(jurisdiction: string, actions: string[]): string {
    // Base timeline in days
    let timelineInDays = 30;

    // Jurisdiction multipliers
    const jurisdictionMultipliers: Record<string, number> = {
      'US': 1.0,
      'EU': 1.2,
      'UK': 1.1,
      'CA': 1.3,
      'AU': 1.4,
      'JP': 1.5,
      'SG': 1.6,
      'CH': 1.8
    };

    // Adjust for jurisdiction
    timelineInDays *= jurisdictionMultipliers[jurisdiction.toUpperCase()] || 2.0;

    // Add time for each action
    timelineInDays += actions.length * 7;

    return `${Math.ceil(timelineInDays)} days`;
  }

  private determineLegalNextSteps(jurisdiction: string, actions: string[]): string[] {
    const nextSteps = [
      'Document all communications and transactions',
      'Prepare evidence package for law enforcement',
      'Monitor suspect addresses for new activity'
    ];

    // Add jurisdiction-specific steps
    switch (jurisdiction.toUpperCase()) {
      case 'US':
        nextSteps.push(
          'Schedule FBI cybercrime unit meeting',
          'Prepare SEC compliance documentation',
          'Engage local US Attorney\'s office'
        );
        break;
      case 'EU':
        nextSteps.push(
          'Coordinate with EU member state authorities',
          'Prepare GDPR compliance documentation',
          'Engage local financial regulators'
        );
        break;
      default:
        nextSteps.push(
          'Engage local law enforcement liaison',
          'Prepare cross-border documentation',
          'Coordinate with international authorities'
        );
    }

    return nextSteps;
  }
}
