import { Logger } from '../utils/logger';
import { DatabaseService } from './database';
import { RecoveryTransaction } from '../types';

export class BillingService {
  private logger = new Logger('BillingService');

  constructor() {
    this.logger.info('Billing Service initialized.');
  }

  public async processRecoveryFunds(userId: string, caseId: string, totalRecovered: number, currency: string = 'USD'): Promise<RecoveryTransaction | null> {
    if (totalRecovered <= 0) {
      throw new Error('Total recovered amount must be positive.');
    }

    const feePercentage = 0.30;
    const feeAmount = totalRecovered * feePercentage;
    const netAmount = totalRecovered - feeAmount;

    try {
      // Update user balance in the database
      await DatabaseService.updateUserBalance(userId, netAmount);

      const newTransaction: Partial<RecoveryTransaction> = {
        userId,
        caseId,
        recoveredAmount: totalRecovered,
        feePercentage,
        feeAmount,
        netAmount,
        currency,
        status: 'completed',
      };

      const createdTransaction = await DatabaseService.createRecoveryTransaction(newTransaction as any);
      
      if (createdTransaction) {
        await DatabaseService.logAuditEvent(userId, 'process_recovery_funds', 'RecoveryTransaction', createdTransaction.id, null, newTransaction);
        this.logger.info(`Processed recovery funds for user ${userId}, case ${caseId}: Recovered: ${totalRecovered}, Fee: ${feeAmount}, Net: ${netAmount}`);
      }
      return createdTransaction;
    } catch (error) {
      this.logger.error(`Failed to process recovery funds for user ${userId}, case ${caseId}:`, error);
      return null;
    }
  }

  /**
   * Calculate dynamic recovery fees based on multiple factors
   */
  public async calculateDynamicRecoveryFees(
    totalRecovered: number,
    caseComplexity: 'simple' | 'moderate' | 'complex' | 'critical',
    jurisdiction: string,
    recoveryTime: number, // in days
    legalActionsRequired: number,
    exchangeFreezes: number
  ): Promise<{
    baseFeePercentage: number;
    complexityMultiplier: number;
    jurisdictionMultiplier: number;
    timeMultiplier: number;
    legalMultiplier: number;
    finalFeePercentage: number;
    feeAmount: number;
    netAmount: number;
  }> {
    // Base fee percentage
    const baseFeePercentage = 0.30;

    // Complexity multipliers
    const complexityMultipliers = {
      'simple': 1.0,
      'moderate': 1.1,
      'complex': 1.25,
      'critical': 1.5
    };

    // Jurisdiction multipliers (higher for more complex legal environments)
    const jurisdictionMultipliers: Record<string, number> = {
      'US': 1.2,
      'UK': 1.15,
      'EU': 1.1,
      'DE': 1.1,
      'FR': 1.1,
      'CH': 1.05,
      'SG': 1.0,
      'AU': 1.1,
      'CA': 1.1,
      'JP': 1.05,
      'KR': 1.0,
      'IN': 1.3,
      'BR': 1.4,
      'MX': 1.4,
      'AE': 1.0
    };

    // Time-based multiplier (longer recovery = higher fee)
    const timeMultiplier = Math.min(1.0 + (recoveryTime / 365) * 0.5, 2.0);

    // Legal actions multiplier
    const legalMultiplier = Math.min(1.0 + (legalActionsRequired * 0.1), 1.5);

    // Exchange freezes multiplier
    const exchangeMultiplier = Math.min(1.0 + (exchangeFreezes * 0.05), 1.3);

    const complexityMultiplier = complexityMultipliers[caseComplexity];
    const jurisdictionMultiplier = jurisdictionMultipliers[jurisdiction.toUpperCase()] || 1.0;

    const finalFeePercentage = Math.min(
      baseFeePercentage * complexityMultiplier * jurisdictionMultiplier * timeMultiplier * legalMultiplier * exchangeMultiplier,
      0.75 // Cap at 75%
    );

    const feeAmount = totalRecovered * finalFeePercentage;
    const netAmount = totalRecovered - feeAmount;

    return {
      baseFeePercentage,
      complexityMultiplier,
      jurisdictionMultiplier,
      timeMultiplier,
      legalMultiplier,
      finalFeePercentage,
      feeAmount,
      netAmount
    };
  }

  /**
   * Process recovery funds with dynamic fee calculation
   */
  public async processRecoveryFundsWithDynamicFees(
    userId: string,
    caseId: string,
    totalRecovered: number,
    caseComplexity: 'simple' | 'moderate' | 'complex' | 'critical',
    jurisdiction: string,
    recoveryTime: number,
    legalActionsRequired: number,
    exchangeFreezes: number,
    currency: string = 'USD'
  ): Promise<RecoveryTransaction | null> {
    if (totalRecovered <= 0) {
      throw new Error('Total recovered amount must be positive.');
    }

    try {
      const feeCalculation = await this.calculateDynamicRecoveryFees(
        totalRecovered,
        caseComplexity,
        jurisdiction,
        recoveryTime,
        legalActionsRequired,
        exchangeFreezes
      );

      // Update user balance in the database
      await DatabaseService.updateUserBalance(userId, feeCalculation.netAmount);

      const newTransaction: Partial<RecoveryTransaction> = {
        userId,
        caseId,
        recoveredAmount: totalRecovered,
        feePercentage: feeCalculation.finalFeePercentage,
        feeAmount: feeCalculation.feeAmount,
        netAmount: feeCalculation.netAmount,
        currency,
        status: 'completed',
        metadata: {
          feeCalculation,
          caseComplexity,
          jurisdiction,
          recoveryTime,
          legalActionsRequired,
          exchangeFreezes
        }
      };

      const createdTransaction = await DatabaseService.createRecoveryTransaction(newTransaction as any);
      
      if (createdTransaction) {
        await DatabaseService.logAuditEvent(
          userId, 
          'process_recovery_funds_dynamic', 
          'RecoveryTransaction', 
          createdTransaction.id, 
          null, 
          newTransaction
        );
        this.logger.info(
          `Processed dynamic recovery funds for user ${userId}, case ${caseId}: ` +
          `Recovered: ${totalRecovered}, Fee: ${feeCalculation.feeAmount} (${(feeCalculation.finalFeePercentage * 100).toFixed(1)}%), ` +
          `Net: ${feeCalculation.netAmount}`
        );
      }
      return createdTransaction;
    } catch (error) {
      this.logger.error(`Failed to process dynamic recovery funds for user ${userId}, case ${caseId}:`, error);
      return null;
    }
  }

  /**
   * Get recovery fee statistics
   */
  public async getRecoveryFeeStatistics(): Promise<{
    totalRecovered: number;
    totalFees: number;
    averageFeePercentage: number;
    feeDistribution: Record<string, number>;
    topJurisdictions: Array<{ jurisdiction: string; totalFees: number; count: number }>;
  }> {
    // This would typically fetch from database
    return {
      totalRecovered: 2500000,
      totalFees: 750000,
      averageFeePercentage: 0.30,
      feeDistribution: {
        'simple': 0.25,
        'moderate': 0.30,
        'complex': 0.35,
        'critical': 0.45
      },
      topJurisdictions: [
        { jurisdiction: 'US', totalFees: 200000, count: 45 },
        { jurisdiction: 'UK', totalFees: 150000, count: 30 },
        { jurisdiction: 'EU', totalFees: 100000, count: 25 }
      ]
    };
  }

  /**
   * Calculate fee breakdown for transparency
   */
  public async getFeeBreakdown(
    totalRecovered: number,
    caseComplexity: 'simple' | 'moderate' | 'complex' | 'critical',
    jurisdiction: string,
    recoveryTime: number,
    legalActionsRequired: number,
    exchangeFreezes: number
  ): Promise<{
    breakdown: Array<{ component: string; percentage: number; amount: number }>;
    totalFeePercentage: number;
    totalFeeAmount: number;
    netAmount: number;
  }> {
    const feeCalculation = await this.calculateDynamicRecoveryFees(
      totalRecovered,
      caseComplexity,
      jurisdiction,
      recoveryTime,
      legalActionsRequired,
      exchangeFreezes
    );

    const breakdown = [
      {
        component: 'Base Recovery Fee',
        percentage: 0.30,
        amount: totalRecovered * 0.30
      },
      {
        component: 'Complexity Adjustment',
        percentage: (feeCalculation.complexityMultiplier - 1) * 0.30,
        amount: totalRecovered * (feeCalculation.complexityMultiplier - 1) * 0.30
      },
      {
        component: 'Jurisdiction Adjustment',
        percentage: (feeCalculation.jurisdictionMultiplier - 1) * 0.30,
        amount: totalRecovered * (feeCalculation.jurisdictionMultiplier - 1) * 0.30
      },
      {
        component: 'Time Adjustment',
        percentage: (feeCalculation.timeMultiplier - 1) * 0.30,
        amount: totalRecovered * (feeCalculation.timeMultiplier - 1) * 0.30
      },
      {
        component: 'Legal Actions Adjustment',
        percentage: (feeCalculation.legalMultiplier - 1) * 0.30,
        amount: totalRecovered * (feeCalculation.legalMultiplier - 1) * 0.30
      }
    ];

    return {
      breakdown,
      totalFeePercentage: feeCalculation.finalFeePercentage,
      totalFeeAmount: feeCalculation.feeAmount,
      netAmount: feeCalculation.netAmount
    };
  }
}
