import { Logger } from '../utils/logger';
import { DatabaseService } from './database';
import { ExchangeIntegrationService } from './exchangeIntegration';
import { ForensicAnalysisService } from './forensicAnalysis';
import { LawEnforcementCoordinationService } from './lawEnforcementCoordination';
import { RecoveryOperationsService } from './recoveryOperations';
import { BillingService } from './billingService';
import { ThreatMonitoringService } from './threatMonitoring';
import { NotificationService } from './notification';
import { 
  RecoveryCase, 
  RecoveryStatus, 
  Threat, 
  ThreatType, 
  ThreatSeverity,
  Asset,
  RecoveryTransaction,
  SupportedExchange
} from '../types';

export interface RecoveryIncident {
  incidentId: string;
  userId: string;
  stolenAssets: Asset[];
  transactionHashes: string[];
  exchangeAccounts?: Array<{
    exchange: SupportedExchange;
    accountId: string;
  }>;
  suspectAddresses?: string[];
  jurisdiction: string;
  severity: ThreatSeverity;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface RecoveryWorkflow {
  incidentId: string;
  caseId: string;
  status: RecoveryStatus;
  steps: RecoveryStep[];
  currentStep: number;
  startedAt: Date;
  completedAt?: Date;
  totalRecovered?: number;
  feesCollected?: number;
}

export interface RecoveryStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
  retryCount: number;
  maxRetries: number;
}

export class RecoveryOrchestrator {
  private logger = new Logger('RecoveryOrchestrator');
  private exchangeService: ExchangeIntegrationService;
  private forensicService: ForensicAnalysisService;
  private lawEnforcementService: LawEnforcementCoordinationService;
  private recoveryService: RecoveryOperationsService;
  private billingService: BillingService;
  private threatService: ThreatMonitoringService;
  private notificationService: NotificationService;
  private activeWorkflows: Map<string, RecoveryWorkflow> = new Map();

  constructor() {
    this.exchangeService = new ExchangeIntegrationService();
    this.forensicService = new ForensicAnalysisService();
    this.lawEnforcementService = new LawEnforcementCoordinationService();
    this.recoveryService = new RecoveryOperationsService();
    this.billingService = new BillingService();
    this.threatService = ThreatMonitoringService;
    this.notificationService = NotificationService.getInstance();
    this.logger.info('Recovery Orchestrator initialized with all services.');
  }

  /**
   * Main entry point for crypto asset recovery
   * Triggers the complete recovery workflow when a hack is detected
   */
  public async initiateRecovery(incident: RecoveryIncident): Promise<RecoveryWorkflow> {
    try {
      this.logger.info(`Initiating recovery workflow for incident ${incident.incidentId}`);
      
      // Create recovery case
      const recoveryCase = await this.recoveryService.createRecoveryCase({
        incidentId: incident.incidentId,
        userId: incident.userId,
        stolenAssets: incident.stolenAssets,
        suspectAddresses: incident.suspectAddresses
      });

      if (!recoveryCase) {
        throw new Error('Failed to create recovery case');
      }

      // Create workflow
      const workflow: RecoveryWorkflow = {
        incidentId: incident.incidentId,
        caseId: recoveryCase.id,
        status: RecoveryStatus.PENDING,
        steps: this.createRecoverySteps(incident),
        currentStep: 0,
        startedAt: new Date()
      };

      this.activeWorkflows.set(incident.incidentId, workflow);

      // Start the recovery process
      await this.executeRecoveryWorkflow(workflow);

      return workflow;
    } catch (error: any) {
      this.logger.error(`Failed to initiate recovery for incident ${incident.incidentId}:`, error);
      throw error;
    }
  }

  /**
   * Execute the complete recovery workflow
   */
  private async executeRecoveryWorkflow(workflow: RecoveryWorkflow): Promise<void> {
    try {
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        workflow.currentStep = i;
        
        this.logger.info(`Executing step ${i + 1}/${workflow.steps.length}: ${step.name}`);
        
        step.status = 'in_progress';
        step.startedAt = new Date();

        try {
          await this.executeStep(workflow, step);
          step.status = 'completed';
          step.completedAt = new Date();
          
          this.logger.info(`Step ${step.name} completed successfully`);
        } catch (error: any) {
          step.status = 'failed';
          step.error = error.message;
          step.retryCount++;

          this.logger.error(`Step ${step.name} failed:`, error);

          // Retry logic
          if (step.retryCount < step.maxRetries) {
            this.logger.info(`Retrying step ${step.name} (attempt ${step.retryCount + 1}/${step.maxRetries})`);
            step.status = 'pending';
            i--; // Retry current step
            await this.sleep(5000); // Wait 5 seconds before retry
            continue;
          } else {
            this.logger.error(`Step ${step.name} failed after ${step.maxRetries} attempts`);
            workflow.status = RecoveryStatus.FAILED;
            break;
          }
        }
      }

      // Update workflow status
      if (workflow.status !== RecoveryStatus.FAILED) {
        workflow.status = RecoveryStatus.COMPLETED;
        workflow.completedAt = new Date();
      }

      // Update recovery case status
      await this.recoveryService.updateRecoveryCaseStatus(
        workflow.caseId, 
        workflow.status,
        `Workflow completed with status: ${workflow.status}`
      );

      this.logger.info(`Recovery workflow ${workflow.incidentId} completed with status: ${workflow.status}`);
    } catch (error: any) {
      this.logger.error(`Recovery workflow execution failed:`, error);
      workflow.status = RecoveryStatus.FAILED;
      throw error;
    }
  }

  /**
   * Execute individual recovery step
   */
  private async executeStep(workflow: RecoveryWorkflow, step: RecoveryStep): Promise<void> {
    switch (step.id) {
      case 'freeze_exchanges':
        await this.executeFreezeExchanges(workflow, step);
        break;
      case 'forensic_analysis':
        await this.executeForensicAnalysis(workflow, step);
        break;
      case 'law_enforcement':
        await this.executeLawEnforcement(workflow, step);
        break;
      case 'legal_actions':
        await this.executeLegalActions(workflow, step);
        break;
      case 'asset_recovery':
        await this.executeAssetRecovery(workflow, step);
        break;
      case 'fee_processing':
        await this.executeFeeProcessing(workflow, step);
        break;
      default:
        throw new Error(`Unknown step: ${step.id}`);
    }
  }

  /**
   * Step 1: Freeze funds on exchanges
   */
  private async executeFreezeExchanges(workflow: RecoveryWorkflow, step: RecoveryStep): Promise<void> {
    const incident = await this.getIncidentDetails(workflow.incidentId);
    if (!incident) throw new Error('Incident not found');

    const freezePromises = incident.exchangeAccounts?.map(async (account) => {
      try {
        const result = await this.exchangeService.freezeFundsOnExchange(
          incident.userId,
          account.exchange,
          {
            accountId: account.accountId,
            transactionDetails: {
              incidentId: incident.incidentId,
              stolenAssets: incident.stolenAssets,
              timestamp: incident.timestamp
            }
          }
        );
        return { exchange: account.exchange, accountId: account.accountId, result };
      } catch (error: any) {
        this.logger.error(`Failed to freeze account ${account.accountId} on ${account.exchange}:`, error);
        return { exchange: account.exchange, accountId: account.accountId, error: error.message };
      }
    }) || [];

    const results = await Promise.all(freezePromises);
    step.result = { freezeResults: results };
    
    this.logger.info(`Exchange freeze completed for ${results.length} accounts`);
  }

  /**
   * Step 2: Perform forensic analysis
   */
  private async executeForensicAnalysis(workflow: RecoveryWorkflow, step: RecoveryStep): Promise<void> {
    const incident = await this.getIncidentDetails(workflow.incidentId);
    if (!incident) throw new Error('Incident not found');

    const analysisPromises = incident.transactionHashes.map(async (txHash) => {
      try {
        const suspectAddresses = await this.forensicService.analyzeThiefPatterns(incident.userId, txHash);
        return { txHash, suspectAddresses };
      } catch (error: any) {
        this.logger.error(`Forensic analysis failed for transaction ${txHash}:`, error);
        return { txHash, error: error.message };
      }
    });

    const results = await Promise.all(analysisPromises);
    const allSuspectAddresses = results
      .filter(r => r.suspectAddresses)
      .flatMap(r => r.suspectAddresses || []);

    step.result = { 
      analysisResults: results,
      suspectAddresses: [...new Set(allSuspectAddresses)] // Remove duplicates
    };

    this.logger.info(`Forensic analysis completed, identified ${allSuspectAddresses.length} suspect addresses`);
  }

  /**
   * Step 3: Notify law enforcement
   */
  private async executeLawEnforcement(workflow: RecoveryWorkflow, step: RecoveryStep): Promise<void> {
    const incident = await this.getIncidentDetails(workflow.incidentId);
    if (!incident) throw new Error('Incident not found');

    try {
      await this.lawEnforcementService.notifyLawEnforcement(
        incident.userId,
        incident.jurisdiction,
        {
          incidentId: incident.incidentId,
          description: `Crypto asset theft incident involving ${incident.stolenAssets.length} assets`,
          stolenAssets: incident.stolenAssets,
          suspectAddresses: incident.suspectAddresses || [],
          timestamp: incident.timestamp,
          userId: incident.userId
        }
      );

      step.result = { 
        jurisdiction: incident.jurisdiction,
        notified: true,
        timestamp: new Date()
      };

      this.logger.info(`Law enforcement notified for jurisdiction: ${incident.jurisdiction}`);
    } catch (error: any) {
      this.logger.error(`Law enforcement notification failed:`, error);
      throw error;
    }
  }

  /**
   * Step 4: Initiate legal actions
   */
  private async executeLegalActions(workflow: RecoveryWorkflow, step: RecoveryStep): Promise<void> {
    try {
      const legalActions = [
        'Asset Seizure Petition',
        'Recovery Lawsuit Filing',
        'International Legal Coordination',
        'Asset Tracing Documentation'
      ];

      const actionPromises = legalActions.map(async (action) => {
        try {
          const result = await this.recoveryService.triggerLegalAction(workflow.caseId, action);
          return { action, success: true, result };
        } catch (error: any) {
          this.logger.error(`Legal action ${action} failed:`, error);
          return { action, success: false, error: error.message };
        }
      });

      const results = await Promise.all(actionPromises);
      step.result = { legalActions: results };

      this.logger.info(`Legal actions initiated: ${results.filter(r => r.success).length}/${results.length} successful`);
    } catch (error: any) {
      this.logger.error(`Legal actions execution failed:`, error);
      throw error;
    }
  }

  /**
   * Step 5: Asset recovery with real blockchain analysis and legal procedures
   */
  private async executeAssetRecovery(workflow: RecoveryWorkflow, step: RecoveryStep): Promise<void> {
    const incident = await this.getIncidentDetails(workflow.incidentId);
    if (!incident) throw new Error('Incident not found');

    try {
      // 1. Perform blockchain forensic analysis
      const forensicResults = await this.forensicService.analyzeThiefPatterns(
        incident.userId, 
        incident.transactionHashes[0]
      );
      
      // 2. Track asset movements across blockchain
      const assetTracking = await this.forensicService.trackAssetFlow(
        incident.transactionHashes,
        incident.suspectAddresses || []
      );
      
      // 3. Calculate realistic recovery potential based on blockchain analysis
      const recoveryAnalysis = await this.calculateRecoveryPotential(incident, assetTracking);
      
      // 4. Initiate legal recovery procedures
      const legalRecovery = await this.recoveryService.initiateLegalRecovery(
        workflow.caseId,
        incident.jurisdiction,
        recoveryAnalysis
      );
      
      workflow.totalRecovered = recoveryAnalysis.estimatedRecovery;
      step.result = { 
        totalRecovered: recoveryAnalysis.estimatedRecovery,
        recoveryRate: recoveryAnalysis.recoveryRate,
        forensicResults,
        assetTracking,
        legalRecovery,
        recoveredAssets: recoveryAnalysis.recoveredAssets,
        recoveryTimeline: recoveryAnalysis.estimatedTimeline
      };

      this.logger.info(`Asset recovery analysis completed: $${recoveryAnalysis.estimatedRecovery.toFixed(2)} estimated recovery`);
    } catch (error: any) {
      this.logger.error('Asset recovery analysis failed:', error);
      throw error;
    }
  }

  /**
   * Calculate realistic recovery potential based on blockchain analysis
   */
  private async calculateRecoveryPotential(incident: RecoveryIncident, assetTracking: any): Promise<any> {
    const totalStolenValue = incident.stolenAssets.reduce((sum, asset) => sum + asset.value, 0);
    
    // Analyze recovery potential based on asset tracking
    let recoveryRate = 0.1; // Base 10% recovery rate
    
    // Increase recovery rate based on asset tracking results
    if (assetTracking.trackedAssets > 0) {
      recoveryRate += 0.3; // 30% bonus for tracked assets
    }
    
    if (assetTracking.exchangeDeposits > 0) {
      recoveryRate += 0.2; // 20% bonus for exchange deposits (easier to freeze)
    }
    
    if (assetTracking.mixerUsage === false) {
      recoveryRate += 0.2; // 20% bonus if no mixer usage detected
    }
    
    // Cap recovery rate at 80% (realistic maximum)
    recoveryRate = Math.min(recoveryRate, 0.8);
    
    const estimatedRecovery = totalStolenValue * recoveryRate;
    const estimatedTimeline = this.calculateRecoveryTimeline(incident.jurisdiction, assetTracking);
    
    return {
      estimatedRecovery,
      recoveryRate,
      recoveredAssets: incident.stolenAssets.map(asset => ({
        ...asset,
        recoveredValue: asset.value * recoveryRate,
        recoveryProbability: recoveryRate
      })),
      estimatedTimeline,
      factors: {
        assetTracking: assetTracking.trackedAssets > 0,
        exchangeDeposits: assetTracking.exchangeDeposits > 0,
        mixerUsage: assetTracking.mixerUsage,
        jurisdiction: incident.jurisdiction
      }
    };
  }

  /**
   * Calculate estimated recovery timeline based on jurisdiction and complexity
   */
  private calculateRecoveryTimeline(jurisdiction: string, assetTracking: any): string {
    let baseDays = 30; // Base 30 days
    
    // Adjust based on jurisdiction
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
    
    const multiplier = jurisdictionMultipliers[jurisdiction] || 2.0;
    baseDays *= multiplier;
    
    // Adjust based on complexity
    if (assetTracking.mixerUsage) {
      baseDays *= 2.0; // Double time if mixer usage detected
    }
    
    if (assetTracking.crossChainMovements > 3) {
      baseDays *= 1.5; // 50% more time for complex cross-chain movements
    }
    
    return `${Math.ceil(baseDays)} days`;
  }

  /**
   * Step 6: Process recovery fees
   */
  private async executeFeeProcessing(workflow: RecoveryWorkflow, step: RecoveryStep): Promise<void> {
    if (!workflow.totalRecovered) {
      throw new Error('No recovered amount to process fees');
    }

    try {
      const recoveryTransaction = await this.billingService.processRecoveryFunds(
        workflow.incidentId,
        workflow.caseId,
        workflow.totalRecovered,
        'USD'
      );

      if (!recoveryTransaction) {
        throw new Error('Failed to process recovery fees');
      }

      workflow.feesCollected = recoveryTransaction.feeAmount;
      step.result = {
        totalRecovered: recoveryTransaction.recoveredAmount,
        feeAmount: recoveryTransaction.feeAmount,
        netAmount: recoveryTransaction.netAmount,
        feePercentage: recoveryTransaction.feePercentage
      };

      this.logger.info(`Recovery fees processed: $${recoveryTransaction.feeAmount} fee, $${recoveryTransaction.netAmount} net`);
    } catch (error: any) {
      this.logger.error(`Fee processing failed:`, error);
      throw error;
    }
  }

  /**
   * Create recovery workflow steps
   */
  private createRecoverySteps(incident: RecoveryIncident): RecoveryStep[] {
    return [
      {
        id: 'freeze_exchanges',
        name: 'Freeze Exchange Accounts',
        description: 'Immediately freeze funds on all connected exchanges',
        status: 'pending',
        retryCount: 0,
        maxRetries: 3
      },
      {
        id: 'forensic_analysis',
        name: 'Blockchain Forensic Analysis',
        description: 'Analyze transaction patterns to identify suspect addresses',
        status: 'pending',
        retryCount: 0,
        maxRetries: 2
      },
      {
        id: 'law_enforcement',
        name: 'Law Enforcement Notification',
        description: 'Notify relevant law enforcement agencies',
        status: 'pending',
        retryCount: 0,
        maxRetries: 2
      },
      {
        id: 'legal_actions',
        name: 'Legal Action Initiation',
        description: 'Initiate legal recovery procedures',
        status: 'pending',
        retryCount: 0,
        maxRetries: 2
      },
      {
        id: 'asset_recovery',
        name: 'Asset Recovery Process',
        description: 'Execute asset recovery procedures',
        status: 'pending',
        retryCount: 0,
        maxRetries: 1
      },
      {
        id: 'fee_processing',
        name: 'Fee Processing',
        description: 'Calculate and process recovery fees',
        status: 'pending',
        retryCount: 0,
        maxRetries: 2
      }
    ];
  }

  /**
   * Get incident details from database
   */
  private async getIncidentDetails(incidentId: string): Promise<RecoveryIncident | null> {
    try {
      // Fetch incident from database
      const incident = await DatabaseService.getIncidentById(incidentId);
      
      if (!incident) {
        this.logger.error(`Incident ${incidentId} not found in database`);
        return null;
      }
      
      // Transform database incident to RecoveryIncident format
      return {
        incidentId: incident.id,
        userId: incident.user_id,
        stolenAssets: incident.stolen_assets || [],
        transactionHashes: incident.transaction_hashes || [],
        exchangeAccounts: incident.exchange_accounts || [],
        suspectAddresses: incident.suspect_addresses || [],
        jurisdiction: incident.jurisdiction || 'US',
        severity: incident.severity || ThreatSeverity.CRITICAL,
        timestamp: incident.created_at || new Date(),
        metadata: incident.metadata || {}
      };
    } catch (error: any) {
      this.logger.error(`Failed to fetch incident details for ${incidentId}:`, error);
      return null;
    }
  }

  /**
   * Get recovery workflow status
   */
  public async getRecoveryStatus(incidentId: string): Promise<RecoveryWorkflow | null> {
    return this.activeWorkflows.get(incidentId) || null;
  }

  /**
   * Cancel recovery workflow
   */
  public async cancelRecovery(incidentId: string): Promise<boolean> {
    const workflow = this.activeWorkflows.get(incidentId);
    if (!workflow) return false;

    workflow.status = RecoveryStatus.CANCELLED;
    await this.recoveryService.updateRecoveryCaseStatus(
      workflow.caseId,
      RecoveryStatus.CANCELLED,
      'Recovery workflow cancelled by user'
    );

    this.activeWorkflows.delete(incidentId);
    this.logger.info(`Recovery workflow ${incidentId} cancelled`);
    return true;
  }

  /**
   * Get recovery statistics from database
   */
  public async getRecoveryStatistics(): Promise<{
    totalCases: number;
    successfulRecoveries: number;
    totalRecovered: number;
    totalFees: number;
    averageRecoveryTime: number;
  }> {
    try {
      // Fetch statistics from database
      const stats = await DatabaseService.getRecoveryStatistics();
      
      return {
        totalCases: stats.total_cases || 0,
        successfulRecoveries: stats.successful_recoveries || 0,
        totalRecovered: stats.total_recovered || 0,
        totalFees: stats.total_fees || 0,
        averageRecoveryTime: stats.average_recovery_time || 0
      };
    } catch (error: any) {
      this.logger.error('Failed to fetch recovery statistics:', error);
      return {
        totalCases: 0,
        successfulRecoveries: 0,
        totalRecovered: 0,
        totalFees: 0,
        averageRecoveryTime: 0
      };
    }
  }

  /**
   * Utility method for delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default RecoveryOrchestrator;
