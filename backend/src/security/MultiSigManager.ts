import { createHash, randomBytes } from 'crypto';
import { supabase } from '../config/database';
import { redisClient } from '../config/redisClient';
import AuditLogger from './AuditLogger';

interface MultiSigTransaction {
  id: string;
  type: 'withdrawal' | 'key_rotation' | 'config_change' | 'compliance_override';
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'executed';
  createdBy: string;
  createdAt: Date;
  expiresAt: Date;
  data: Record<string, any>;
  requiredSignatures: number;
  currentSignatures: {
    userId: string;
    signedAt: Date;
    signature: string;
    metadata: Record<string, any>;
  }[];
  metadata: {
    priority: 'low' | 'medium' | 'high' | 'critical';
    riskLevel: number;
    approvalChain?: string[];
    notificationsSent?: boolean;
    lastReminderSent?: Date;
    executionAttempts?: number;
    rollbackData?: any;
  };
}

interface SignatureRequest {
  userId: string;
  transactionId: string;
  signatureData: {
    timestamp: number;
    ip: string;
    deviceId?: string;
    method: '2fa' | 'hardware_key' | 'biometric';
  };
}

interface TransactionValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
  riskScore?: number;
}

export class MultiSigManager {
  private static instance: MultiSigManager;
  private readonly auditLogger: AuditLogger;
  private static readonly CACHE_PREFIX = 'multisig:';
  private static readonly CACHE_TTL = 86400; // 24 hours
  private static readonly MAX_EXECUTION_ATTEMPTS = 3;
  private static readonly REMINDER_INTERVAL = 3600000; // 1 hour

  private constructor() {
    this.auditLogger = AuditLogger.getInstance(supabase);
  }

  static getInstance(): MultiSigManager {
    if (!MultiSigManager.instance) {
      MultiSigManager.instance = new MultiSigManager();
    }
    return MultiSigManager.instance;
  }

  /**
   * Create a new multi-signature transaction
   */
  async createTransaction(
    type: MultiSigTransaction['type'],
    createdBy: string,
    data: Record<string, any>,
    options: {
      requiredSignatures?: number;
      expiresIn?: number; // seconds
      priority?: MultiSigTransaction['metadata']['priority'];
      approvalChain?: string[];
    } = {}
  ): Promise<MultiSigTransaction> {
    const now = new Date();
    const transactionId = this.generateTransactionId();

    // Calculate risk level based on transaction type and data
    const riskLevel = await this.calculateRiskLevel(type, data);

    // Determine required signatures based on risk level if not specified
    const requiredSignatures = options.requiredSignatures || this.getRequiredSignatures(riskLevel);

    const transaction: MultiSigTransaction = {
      id: transactionId,
      type,
      status: 'pending',
      createdBy,
      createdAt: now,
      expiresAt: new Date(now.getTime() + (options.expiresIn || 24 * 3600) * 1000),
      data,
      requiredSignatures,
      currentSignatures: [],
      metadata: {
        priority: options.priority || this.getPriorityFromRisk(riskLevel),
        riskLevel,
        approvalChain: options.approvalChain,
        notificationsSent: false,
        executionAttempts: 0
      }
    };

    try {
      // Store in database
      const { error } = await supabase
        .from('multi_sig_transactions')
        .insert(transaction);

      if (error) throw error;

      // Cache transaction
      await redisClient.setex(
        `${MultiSigManager.CACHE_PREFIX}${transactionId}`,
        MultiSigManager.CACHE_TTL,
        JSON.stringify(transaction)
      );

      // Log creation
      await this.auditLogger.log(
        { user: { id: createdBy } } as any,
        'multisig_transaction_created',
        'security',
        'success',
        {
          severity: this.getSeverityFromPriority(transaction.metadata.priority),
          details: {
            transactionId,
            type,
            requiredSignatures,
            riskLevel
          }
        }
      );

      // Schedule expiration
      this.scheduleExpiration(transactionId, transaction.expiresAt);

      // Schedule reminders if needed
      if (transaction.metadata.priority === 'high' || transaction.metadata.priority === 'critical') {
        this.scheduleReminders(transactionId);
      }

      return transaction;
    } catch (error) {
      await this.auditLogger.log(
        { user: { id: createdBy } } as any,
        'multisig_transaction_creation_failed',
        'security',
        'failure',
        {
          severity: 'high',
          details: {
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            type,
            requiredSignatures
          }
        }
      );
      throw error;
    }
  }

  /**
   * Add a signature to a transaction
   */
  async addSignature(request: SignatureRequest): Promise<MultiSigTransaction> {
    const { userId, transactionId, signatureData } = request;

    // Get transaction with lock
    const lockKey = `${MultiSigManager.CACHE_PREFIX}lock:${transactionId}`;
    const hasLock = await redisClient.set(lockKey, '1', 'EX', 30, 'NX');
    
    if (!hasLock) {
      throw new Error('Transaction is currently being processed');
    }

    try {
      const transaction = await this.getTransaction(transactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Validate transaction status
      if (transaction.status !== 'pending') {
        throw new Error(`Transaction is ${transaction.status}`);
      }

      // Validate expiration
      if (new Date() > new Date(transaction.expiresAt)) {
        await this.expireTransaction(transactionId);
        throw new Error('Transaction has expired');
      }

      // Check if user already signed
      if (transaction.currentSignatures.some(sig => sig.userId === userId)) {
        throw new Error('User has already signed this transaction');
      }

      // Validate approval chain if exists
      if (transaction.metadata.approvalChain && 
          transaction.metadata.approvalChain.length > 0) {
        const userIndex = transaction.metadata.approvalChain.indexOf(userId);
        const currentSignCount = transaction.currentSignatures.length;
        
        if (userIndex !== currentSignCount) {
          throw new Error('Invalid signing order');
        }
      }

      // Add signature
      const signature = this.generateSignature(userId, transactionId, signatureData);
      const newSignature = {
        userId,
        signedAt: new Date(),
        signature,
        metadata: signatureData
      };

      transaction.currentSignatures.push(newSignature);

      // Check if we have enough signatures
      if (transaction.currentSignatures.length >= transaction.requiredSignatures) {
        transaction.status = 'approved';
      }

      // Update transaction
      const { error } = await supabase
        .from('multi_sig_transactions')
        .update({
          status: transaction.status,
          currentSignatures: transaction.currentSignatures
        })
        .eq('id', transactionId);

      if (error) throw error;

      // Update cache
      await redisClient.setex(
        `${MultiSigManager.CACHE_PREFIX}${transactionId}`,
        MultiSigManager.CACHE_TTL,
        JSON.stringify(transaction)
      );

      // Log signature
      await this.auditLogger.log(
        { user: { id: userId } } as any,
        'multisig_signature_added',
        'security',
        'success',
        {
          severity: this.getSeverityFromPriority(transaction.metadata.priority),
          details: {
            transactionId,
            signatureMethod: signatureData.method,
            currentSignatures: transaction.currentSignatures.length,
            requiredSignatures: transaction.requiredSignatures,
            isComplete: transaction.status === 'approved'
          }
        }
      );

      // If approved, trigger execution
      if (transaction.status === 'approved') {
        await this.executeTransaction(transaction);
      }

      return transaction;
    } finally {
      await redisClient.del(lockKey);
    }
  }

  /**
   * Execute an approved transaction
   */
  private async executeTransaction(transaction: MultiSigTransaction): Promise<void> {
    const executionLockKey = `${MultiSigManager.CACHE_PREFIX}execution:${transaction.id}`;
    const hasLock = await redisClient.set(executionLockKey, '1', 'EX', 60, 'NX');

    if (!hasLock) {
      return; // Another process is handling execution
    }

    try {
      // Increment execution attempts
      transaction.metadata.executionAttempts = (transaction.metadata.executionAttempts || 0) + 1;

      // Store rollback data if needed
      if (!transaction.metadata.rollbackData) {
        transaction.metadata.rollbackData = await this.prepareRollbackData(transaction);
      }

      // Execute based on transaction type
      switch (transaction.type) {
        case 'withdrawal':
          await this.executeWithdrawal(transaction);
          break;
        case 'key_rotation':
          await this.executeKeyRotation(transaction);
          break;
        case 'config_change':
          await this.executeConfigChange(transaction);
          break;
        case 'compliance_override':
          await this.executeComplianceOverride(transaction);
          break;
        default:
          throw new Error(`Unsupported transaction type: ${transaction.type}`);
      }

      // Update transaction status
      await supabase
        .from('multi_sig_transactions')
        .update({
          status: 'executed',
          metadata: transaction.metadata
        })
        .eq('id', transaction.id);

      // Update cache
      await redisClient.setex(
        `${MultiSigManager.CACHE_PREFIX}${transaction.id}`,
        MultiSigManager.CACHE_TTL,
        JSON.stringify({ ...transaction, status: 'executed' })
      );

      await this.auditLogger.log(
        { user: { id: 'system' } } as any,
        'multisig_transaction_executed',
        'security',
        'success',
        {
          severity: this.getSeverityFromPriority(transaction.metadata.priority),
          details: {
            transactionId: transaction.id,
            type: transaction.type,
            executionAttempts: transaction.metadata.executionAttempts
          }
        }
      );
    } catch (error) {
      // Handle execution failure
      const shouldRetry = transaction.metadata.executionAttempts < MultiSigManager.MAX_EXECUTION_ATTEMPTS;

      if (shouldRetry) {
        // Schedule retry
        setTimeout(() => {
          this.executeTransaction(transaction).catch(console.error);
        }, 5000 * Math.pow(2, transaction.metadata.executionAttempts));
      } else {
        // Mark as failed and attempt rollback
        await this.handleExecutionFailure(transaction, error);
      }

      await this.auditLogger.log(
        { user: { id: 'system' } } as any,
        'multisig_transaction_execution_failed',
        'security',
        'failure',
        {
          severity: 'high',
          details: {
            transactionId: transaction.id,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            executionAttempts: transaction.metadata.executionAttempts,
            willRetry: shouldRetry
          }
        }
      );
    } finally {
      await redisClient.del(executionLockKey);
    }
  }

  /**
   * Handle transaction execution failure
   */
  private async handleExecutionFailure(
    transaction: MultiSigTransaction,
    error: unknown
  ): Promise<void> {
    try {
      // Attempt rollback if we have rollback data
      if (transaction.metadata.rollbackData) {
        await this.rollbackTransaction(transaction);
      }

      // Update transaction status
      await supabase
        .from('multi_sig_transactions')
        .update({
          status: 'failed',
          metadata: {
            ...transaction.metadata,
            failureReason: error instanceof Error ? error.message : 'Unknown error',
            failedAt: new Date().toISOString()
          }
        })
        .eq('id', transaction.id);

      // Clear cache
      await redisClient.del(`${MultiSigManager.CACHE_PREFIX}${transaction.id}`);
    } catch (rollbackError) {
      // Log critical failure
      await this.auditLogger.log(
        { user: { id: 'system' } } as any,
        'multisig_rollback_failed',
        'security',
        'failure',
        {
          severity: 'critical',
          details: {
            transactionId: transaction.id,
            originalError: error instanceof Error ? error.message : 'Unknown error',
            rollbackError: rollbackError instanceof Error ? rollbackError.message : 'Unknown error'
          }
        }
      );
    }
  }

  /**
   * Prepare rollback data for a transaction
   */
  private async prepareRollbackData(transaction: MultiSigTransaction): Promise<any> {
    switch (transaction.type) {
      case 'withdrawal':
        return {
          balanceBefore: await this.getCurrentBalance(transaction.data.accountId)
        };
      case 'key_rotation':
        return {
          oldKey: await this.getCurrentKey(transaction.data.keyId)
        };
      case 'config_change':
        return {
          oldConfig: await this.getCurrentConfig(transaction.data.configPath)
        };
      case 'compliance_override':
        return {
          previousState: await this.getComplianceState(transaction.data.complianceId)
        };
      default:
        return null;
    }
  }

  /**
   * Generate a unique transaction ID
   */
  private generateTransactionId(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = randomBytes(8).toString('hex');
    return `msig_${timestamp}_${randomStr}`;
  }

  /**
   * Calculate risk level for a transaction
   */
  private async calculateRiskLevel(
    type: MultiSigTransaction['type'],
    data: Record<string, any>
  ): Promise<number> {
    let riskScore = 50; // Base risk score

    // Adjust based on transaction type
    switch (type) {
      case 'withdrawal':
        riskScore += this.calculateWithdrawalRisk(data);
        break;
      case 'key_rotation':
        riskScore += this.calculateKeyRotationRisk(data);
        break;
      case 'config_change':
        riskScore += this.calculateConfigChangeRisk(data);
        break;
      case 'compliance_override':
        riskScore += this.calculateComplianceOverrideRisk(data);
        break;
    }

    return Math.min(100, Math.max(0, riskScore));
  }

  private calculateWithdrawalRisk(data: Record<string, any>): number {
    let risk = 0;
    if (data.amount > 100000) risk += 30;
    if (data.amount > 1000000) risk += 20;
    if (data.newDestination) risk += 15;
    if (data.urgent) risk += 10;
    return risk;
  }

  private calculateKeyRotationRisk(data: Record<string, any>): number {
    let risk = 0;
    if (data.isAdminKey) risk += 40;
    if (data.forceRotation) risk += 20;
    if (data.skipBackup) risk += 15;
    return risk;
  }

  private calculateConfigChangeRisk(data: Record<string, any>): number {
    let risk = 0;
    if (data.isSecurityConfig) risk += 35;
    if (data.isGlobalConfig) risk += 25;
    if (data.requiresRestart) risk += 15;
    return risk;
  }

  private calculateComplianceOverrideRisk(data: Record<string, any>): number {
    let risk = 0;
    if (data.overrideType === 'permanent') risk += 40;
    if (data.affectsMultipleUsers) risk += 30;
    if (data.isEmergency) risk += 20;
    return risk;
  }

  /**
   * Get required signatures based on risk level
   */
  private getRequiredSignatures(riskLevel: number): number {
    if (riskLevel >= 80) return 4;
    if (riskLevel >= 60) return 3;
    if (riskLevel >= 40) return 2;
    return 1;
  }

  /**
   * Get priority level from risk score
   */
  private getPriorityFromRisk(riskLevel: number): MultiSigTransaction['metadata']['priority'] {
    if (riskLevel >= 80) return 'critical';
    if (riskLevel >= 60) return 'high';
    if (riskLevel >= 40) return 'medium';
    return 'low';
  }

  /**
   * Get severity level from priority
   */
  private getSeverityFromPriority(
    priority: MultiSigTransaction['metadata']['priority']
  ): 'low' | 'medium' | 'high' | 'critical' {
    switch (priority) {
      case 'critical':
        return 'critical';
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      default:
        return 'low';
    }
  }

  /**
   * Schedule transaction expiration
   */
  private scheduleExpiration(transactionId: string, expiresAt: Date): void {
    const delay = new Date(expiresAt).getTime() - Date.now();
    if (delay > 0) {
      setTimeout(async () => {
        try {
          await this.expireTransaction(transactionId);
        } catch (error) {
          console.error('Failed to expire transaction:', error);
        }
      }, delay);
    }
  }

  /**
   * Schedule reminder notifications
   */
  private scheduleReminders(transactionId: string): void {
    const sendReminder = async () => {
      const transaction = await this.getTransaction(transactionId);
      if (!transaction || transaction.status !== 'pending') return;

      // Update last reminder timestamp
      transaction.metadata.lastReminderSent = new Date();
      await this.updateTransaction(transaction);

      // TODO: Implement notification sending logic
    };

    // Schedule recurring reminders
    const reminderInterval = setInterval(async () => {
      const transaction = await this.getTransaction(transactionId);
      if (!transaction || transaction.status !== 'pending') {
        clearInterval(reminderInterval);
        return;
      }

      await sendReminder();
    }, MultiSigManager.REMINDER_INTERVAL);
  }

  /**
   * Generate a signature for a transaction
   */
  private generateSignature(
    userId: string,
    transactionId: string,
    signatureData: SignatureRequest['signatureData']
  ): string {
    const data = JSON.stringify({
      userId,
      transactionId,
      timestamp: signatureData.timestamp,
      method: signatureData.method
    });

    return createHash('sha3-512').update(data).digest('hex');
  }

  /**
   * Get a transaction by ID
   */
  public async getTransaction(id: string): Promise<MultiSigTransaction | null> {
    // Try cache first
    const cached = await redisClient.get(`${MultiSigManager.CACHE_PREFIX}${id}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Get from database
    const { data, error } = await supabase
      .from('multi_sig_transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    // Cache the result
    await redisClient.setex(
      `${MultiSigManager.CACHE_PREFIX}${id}`,
      MultiSigManager.CACHE_TTL,
      JSON.stringify(data)
    );

    return data as MultiSigTransaction;
  }

  /**
   * Update a transaction
   */
  private async updateTransaction(transaction: MultiSigTransaction): Promise<void> {
    const { error } = await supabase
      .from('multi_sig_transactions')
      .update(transaction)
      .eq('id', transaction.id);

    if (error) throw error;

    // Update cache
    await redisClient.setex(
      `${MultiSigManager.CACHE_PREFIX}${transaction.id}`,
      MultiSigManager.CACHE_TTL,
      JSON.stringify(transaction)
    );
  }

  /**
   * Mark a transaction as expired
   */
  private async expireTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('multi_sig_transactions')
      .update({ status: 'expired' })
      .eq('id', id);

    if (error) throw error;

    // Clear cache
    await redisClient.del(`${MultiSigManager.CACHE_PREFIX}${id}`);
  }

  // Placeholder methods for transaction execution
  private async executeWithdrawal(transaction: MultiSigTransaction): Promise<void> {
    // Implement withdrawal logic
  }

  private async executeKeyRotation(transaction: MultiSigTransaction): Promise<void> {
    // Implement key rotation logic
  }

  private async executeConfigChange(transaction: MultiSigTransaction): Promise<void> {
    // Implement config change logic
  }

  private async executeComplianceOverride(transaction: MultiSigTransaction): Promise<void> {
    // Implement compliance override logic
  }

  private async rollbackTransaction(transaction: MultiSigTransaction): Promise<void> {
    // Implement rollback logic based on transaction type
  }

  // Placeholder methods for current state retrieval
  private async getCurrentBalance(accountId: string): Promise<number> {
    return 0;
  }

  private async getCurrentKey(keyId: string): Promise<string> {
    return '';
  }

  private async getCurrentConfig(path: string): Promise<any> {
    return {};
  }

  private async getComplianceState(id: string): Promise<any> {
    return {};
  }
}

export default MultiSigManager;