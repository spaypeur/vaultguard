import Redis from 'ioredis';
import { PredictiveSecurity } from '../predictive/PredictiveSecurity';
import { ZKCompliance } from '../zk-compliance/ZKCompliance';
import { OmnichainMonitor } from '../../monitoring/cross-chain/OmnichainMonitor';
import { Logger } from '../../utils/logger';
import {
  SecurityEvent,
  DefenseAction,
  DefensePolicy,
  DefenseMatrix,
  OrchestrationMetrics,
  SecurityEventType,
  DefenseActionType,
  ActionStatus,
  ConditionOperator,
} from './types';

export class SecurityOrchestrator {
  private static instance: SecurityOrchestrator;
  private predictiveSecurity: PredictiveSecurity;
  private zkCompliance: ZKCompliance;
  private chainMonitor: OmnichainMonitor;
  private redis: Redis;
  private policies: Map<string, DefensePolicy>;
  private activeThreats: Map<string, SecurityEvent>;
  private actionQueue: DefenseAction[];
  private metrics: OrchestrationMetrics;
  private readonly logger: Logger;

  private constructor() {
    this.predictiveSecurity = PredictiveSecurity.getInstance();
    this.zkCompliance = ZKCompliance.getInstance();
    this.chainMonitor = OmnichainMonitor.getInstance();
    this.redis = new Redis(process.env.REDIS_URL);
    this.policies = new Map();
    this.activeThreats = new Map();
    this.actionQueue = [];
    this.metrics = this.initializeMetrics();
    this.logger = new Logger('security-orchestrator');
  }

  public static getInstance(): SecurityOrchestrator {
    if (!SecurityOrchestrator.instance) {
      SecurityOrchestrator.instance = new SecurityOrchestrator();
    }
    return SecurityOrchestrator.instance;
  }

  /**
   * Initialize the security orchestrator
   */
  public async initialize(): Promise<void> {
    await this.loadPolicies();
    this.setupEventListeners();
    this.startActionProcessor();
  }

  /**
   * Add or update a defense policy
   * @param policy Defense policy to add or update
   */
  public async addPolicy(policy: DefensePolicy): Promise<void> {
    this.validatePolicy(policy);
    this.policies.set(policy.id, policy);
    await this.savePolicies();
  }

  /**
   * Process a security event and trigger appropriate responses
   * @param event Security event to process
   */
  public async processEvent(event: SecurityEvent): Promise<void> {
    this.logger.info(`Processing security event: ${event.id} (${event.type})`);
    
    this.updateMetrics(event);
    this.activeThreats.set(event.id, event);

    const applicablePolicies = this.findApplicablePolicies(event);
    for (const policy of applicablePolicies) {
      await this.executePolicy(policy, event);
    }

    // Request predictive analysis
    const predictions = await this.predictiveSecurity.preemptAttacks();
    if (predictions.confidence > 0.7) {
      await this.handlePredictions(predictions);
    }
  }

  /**
   * Get the current defense matrix
   * @returns Current defense matrix state
   */
  public async getDefenseMatrix(): Promise<DefenseMatrix> {
    return {
      activeThreats: this.activeThreats,
      activePolicies: Array.from(this.policies.values()),
      pendingActions: this.actionQueue.filter(a => a.status === ActionStatus.PENDING),
      completedActions: this.actionQueue.filter(a => a.status === ActionStatus.COMPLETED),
    };
  }

  /**
   * Get current orchestration metrics
   * @returns Orchestration metrics
   */
  public getMetrics(): OrchestrationMetrics {
    return this.metrics;
  }

  private async loadPolicies(): Promise<void> {
    const policiesJson = await this.redis.get('security:policies');
    if (policiesJson) {
      const policies = JSON.parse(policiesJson);
      policies.forEach((policy: DefensePolicy) => {
        this.policies.set(policy.id, policy);
      });
    }
  }

  private async savePolicies(): Promise<void> {
    const policies = Array.from(this.policies.values());
    await this.redis.set('security:policies', JSON.stringify(policies));
  }

  private validatePolicy(policy: DefensePolicy): void {
    if (!policy.id || !policy.name || !policy.actions || policy.actions.length === 0) {
      throw new Error('Invalid policy configuration');
    }

    // Validate conditions
    for (const condition of policy.conditions) {
      if (!condition.field || !condition.operator || condition.value === undefined) {
        throw new Error(`Invalid condition in policy ${policy.id}`);
      }
    }

    // Validate actions
    for (const action of policy.actions) {
      if (!action.type || !DefenseActionType[action.type]) {
        throw new Error(`Invalid action type in policy ${policy.id}`);
      }
    }
  }

  private setupEventListeners(): void {
    // Listen for blockchain events
    this.chainMonitor.subscribe('*', async (blockData) => {
      await this.analyzeCrossChainActivity(blockData);
    });

    // Setup other event listeners
    process.on('uncaughtException', async (error) => {
      await this.processEvent({
        id: crypto.randomUUID(),
        type: SecurityEventType.SYSTEM_ERROR,
        severity: 'CRITICAL',
        timestamp: new Date(),
        source: 'system',
        data: { error: error.message, stack: error.stack },
      });
    });
  }

  private async analyzeCrossChainActivity(blockData: any): Promise<void> {
    const suspiciousTransactions = blockData.transactions.filter(tx =>
      this.isTransactionSuspicious(tx)
    );

    for (const tx of suspiciousTransactions) {
      await this.processEvent({
        id: crypto.randomUUID(),
        type: SecurityEventType.SUSPICIOUS_TRANSACTION,
        severity: 'HIGH',
        timestamp: new Date(),
        source: 'blockchain',
        data: { transaction: tx },
      });
    }
  }

  private isTransactionSuspicious(tx: any): boolean {
    // Implement comprehensive transaction analysis logic
    const suspiciousIndicators = [];
    
    // 1. Check for unusual transaction amounts
    if (tx.amount && this.isUnusualAmount(tx.amount)) {
      suspiciousIndicators.push('unusual_amount');
    }
    
    // 2. Check for known malicious addresses
    if (tx.to && this.isKnownMaliciousAddress(tx.to)) {
      suspiciousIndicators.push('malicious_address');
    }
    
    // 3. Check for mixer/tumbler usage
    if (tx.mixerUsage || this.detectMixerPatterns(tx)) {
      suspiciousIndicators.push('mixer_usage');
    }
    
    // 4. Check for rapid successive transactions
    if (this.detectRapidTransactions(tx)) {
      suspiciousIndicators.push('rapid_transactions');
    }
    
    // 5. Check for cross-chain arbitrage patterns
    if (this.detectArbitragePatterns(tx)) {
      suspiciousIndicators.push('arbitrage_pattern');
    }
    
    // 6. Check for known attack signatures
    if (this.detectAttackSignatures(tx)) {
      suspiciousIndicators.push('attack_signature');
    }
    
    // 7. Check for time-based anomalies
    if (this.detectTimeAnomalies(tx)) {
      suspiciousIndicators.push('time_anomaly');
    }
    
    // 8. Check for gas price manipulation
    if (this.detectGasManipulation(tx)) {
      suspiciousIndicators.push('gas_manipulation');
    }
    
    // Return true if multiple suspicious indicators are present
    return suspiciousIndicators.length >= 2;
  }

  private isUnusualAmount(amount: number): boolean {
    // Check against historical transaction patterns
    const historicalAverage = this.getHistoricalAverage();
    const threshold = historicalAverage * 10; // 10x above average
    return amount > threshold;
  }

  private isKnownMaliciousAddress(address: string): boolean {
    // Check against known malicious address databases
    return this.maliciousAddresses.has(address.toLowerCase());
  }

  private detectMixerPatterns(tx: any): boolean {
    // Detect common mixer patterns
    const mixerIndicators = [
      'equal_outputs',
      'round_amounts',
      'multiple_outputs',
      'time_delays'
    ];
    
    return mixerIndicators.some(indicator => 
      this.checkMixerIndicator(tx, indicator)
    );
  }

  private detectRapidTransactions(tx: any): boolean {
    // Check for multiple transactions within short timeframes
    const recentTransactions = this.getRecentTransactions(tx.from, 300); // 5 minutes
    return recentTransactions.length > 5;
  }

  private detectArbitragePatterns(tx: any): boolean {
    // Detect cross-chain arbitrage patterns
    return tx.crossChain && tx.amount > 1000 && tx.timestamp < Date.now() - 3600000;
  }

  private detectAttackSignatures(tx: any): boolean {
    // Check for known attack signatures
    const attackSignatures = [
      'reentrancy',
      'integer_overflow',
      'unchecked_call',
      'delegatecall_vulnerability'
    ];
    
    return attackSignatures.some(signature => 
      this.checkAttackSignature(tx, signature)
    );
  }

  private detectTimeAnomalies(tx: any): boolean {
    // Check for transactions at unusual times
    const hour = new Date(tx.timestamp).getHours();
    return hour < 6 || hour > 22; // Outside normal business hours
  }

  private detectGasManipulation(tx: any): boolean {
    // Check for gas price manipulation
    const normalGasPrice = this.getNormalGasPrice();
    return tx.gasPrice > normalGasPrice * 2;
  }

  // Helper methods for transaction analysis
  private async getHistoricalAverage(): Promise<number> {
    try {
      // Calculate average from recent transactions in cache
      const recentTxs = await this.cache.get('recent_transactions');
      if (!recentTxs || recentTxs.length === 0) return 1000;
      
      const sum = recentTxs.reduce((acc: number, tx: any) => acc + (tx.value || 0), 0);
      return sum / recentTxs.length;
    } catch (error) {
      return 1000; // Fallback value
    }
  }

  private checkMixerIndicator(tx: any, indicator: string): boolean {
    // Check known mixer addresses and patterns
    const knownMixers = [
      'tornado.cash', 'blender.io', 'wasabi', 'samourai',
      '0x12345', '0xabcde' // Add known mixer contract addresses
    ];
    
    const txAddress = tx.to?.toLowerCase() || '';
    return knownMixers.some(mixer => 
      txAddress.includes(mixer.toLowerCase()) || 
      indicator.toLowerCase().includes(mixer.toLowerCase())
    );
  }

  private async getRecentTransactions(address: string, timeWindow: number): Promise<any[]> {
    try {
      const cacheKey = `tx_history_${address}`;
      const cached = await this.cache.get(cacheKey);
      
      if (cached) {
        const cutoffTime = Date.now() - (timeWindow * 60 * 60 * 1000);
        return cached.filter((tx: any) => tx.timestamp > cutoffTime);
      }
      
      return [];
    } catch (error) {
      return [];
    }
  }

  private checkAttackSignature(tx: any, signature: string): boolean {
    // Check for known attack patterns
    const attackPatterns = [
      'reentrancy', 'flash_loan', 'sandwich', 'front_run',
      'price_manipulation', 'overflow', 'underflow'
    ];
    
    const txData = JSON.stringify(tx).toLowerCase();
    return attackPatterns.some(pattern => 
      signature.toLowerCase().includes(pattern) ||
      txData.includes(pattern)
    );
  }

  private async getNormalGasPrice(): Promise<number> {
    try {
      // Get average gas price from recent transactions
      const recentTxs = await this.cache.get('recent_transactions');
      if (!recentTxs || recentTxs.length === 0) return 20;
      
      const gasPrices = recentTxs
        .map((tx: any) => tx.gasPrice || 0)
        .filter((price: number) => price > 0);
      
      if (gasPrices.length === 0) return 20;
      
      const sum = gasPrices.reduce((acc: number, price: number) => acc + price, 0);
      return sum / gasPrices.length;
    } catch (error) {
      return 20; // Fallback value in Gwei
    }
  }

  private findApplicablePolicies(event: SecurityEvent): DefensePolicy[] {
    return Array.from(this.policies.values()).filter(policy => {
      if (!policy.enabled) return false;

      return policy.conditions.every(condition => {
        const eventValue = this.getEventValue(event, condition.field);
        return this.evaluateCondition(eventValue, condition.operator, condition.value);
      });
    }).sort((a, b) => b.priority - a.priority);
  }

  private getEventValue(event: SecurityEvent, field: string): any {
    const paths = field.split('.');
    let value = event;
    for (const path of paths) {
      value = value[path];
      if (value === undefined) break;
    }
    return value;
  }

  private evaluateCondition(value: any, operator: ConditionOperator, target: any): boolean {
    switch (operator) {
      case ConditionOperator.EQUALS:
        return value === target;
      case ConditionOperator.NOT_EQUALS:
        return value !== target;
      case ConditionOperator.GREATER_THAN:
        return value > target;
      case ConditionOperator.LESS_THAN:
        return value < target;
      case ConditionOperator.CONTAINS:
        return value.includes(target);
      case ConditionOperator.NOT_CONTAINS:
        return !value.includes(target);
      case ConditionOperator.IN:
        return target.includes(value);
      case ConditionOperator.NOT_IN:
        return !target.includes(value);
      case ConditionOperator.REGEX_MATCH:
        return new RegExp(target).test(value);
      default:
        return false;
    }
  }

  private async executePolicy(policy: DefensePolicy, event: SecurityEvent): Promise<void> {
    for (const actionConfig of policy.actions) {
      const action: DefenseAction = {
        id: crypto.randomUUID(),
        type: actionConfig.type,
        priority: policy.priority,
        target: event.source,
        parameters: actionConfig.parameters,
        status: ActionStatus.PENDING,
        timestamp: new Date(),
      };

      this.actionQueue.push(action);
    }

    // Sort action queue by priority
    this.actionQueue.sort((a, b) => b.priority - a.priority);
  }

  private async executeAction(action: DefenseAction): Promise<void> {
    try {
      action.status = ActionStatus.IN_PROGRESS;

      switch (action.type) {
        case DefenseActionType.BLOCK_IP:
          await this.blockIP(action.parameters.ip);
          break;
        case DefenseActionType.SUSPEND_ACCOUNT:
          await this.suspendAccount(action.parameters.accountId);
          break;
        case DefenseActionType.FREEZE_ASSETS:
          await this.freezeAssets(action.parameters.address);
          break;
        // Implement other action types
      }

      action.status = ActionStatus.COMPLETED;
      action.result = {
        success: true,
        timestamp: new Date(),
      };
    } catch (error) {
      action.status = ActionStatus.FAILED;
      action.result = {
        success: false,
        timestamp: new Date(),
        message: error.message,
      };

      // Handle action failure
      await this.handleActionFailure(action);
    }
  }

  private async blockIP(ip: string): Promise<void> {
    // Implement IP blocking logic
    this.logger.info(`Blocking IP: ${ip}`);
  }

  private async suspendAccount(accountId: string): Promise<void> {
    // Implement account suspension logic
    this.logger.info(`Suspending account: ${accountId}`);
  }

  private async freezeAssets(address: string): Promise<void> {
    // Implement asset freezing logic
    this.logger.info(`Freezing assets for address: ${address}`);
  }

  private startActionProcessor(): void {
    setInterval(async () => {
      const pendingActions = this.actionQueue.filter(
        a => a.status === ActionStatus.PENDING
      );

      for (const action of pendingActions) {
        await this.executeAction(action);
      }
    }, 1000); // Process actions every second
  }

  private async handleActionFailure(action: DefenseAction): Promise<void> {
    // Log failure
    this.logger.error(`Action ${action.id} failed: ${action.result?.message}`);

    // Create system event for failure
    await this.processEvent({
      id: crypto.randomUUID(),
      type: SecurityEventType.SYSTEM_ERROR,
      severity: 'HIGH',
      timestamp: new Date(),
      source: 'orchestrator',
      data: { action, error: action.result?.message },
    });

    // Attempt fallback actions if defined in policy
    const policy = Array.from(this.policies.values()).find(p =>
      p.actions.some(a => a.type === action.type)
    );

    if (policy) {
      const failedActionConfig = policy.actions.find(a => a.type === action.type);
      if (failedActionConfig?.fallback) {
        await this.executePolicy(policy, {
          id: crypto.randomUUID(),
          type: SecurityEventType.SYSTEM_ERROR,
          severity: 'HIGH',
          timestamp: new Date(),
          source: 'orchestrator',
          data: { originalAction: action },
        });
      }
    }
  }

  private async handlePredictions(predictions: any): Promise<void> {
    for (const prediction of predictions.predictedThreats) {
      if (prediction.probability > 0.8) {
        await this.processEvent({
          id: crypto.randomUUID(),
          type: SecurityEventType.THREAT_DETECTED,
          severity: prediction.potentialImpact,
          timestamp: new Date(),
          source: 'predictive',
          data: prediction,
        });
      }
    }
  }

  private initializeMetrics(): OrchestrationMetrics {
    return {
      totalEvents: 0,
      activeThreats: 0,
      mitigatedThreats: 0,
      pendingActions: 0,
      avgResponseTime: 0,
      successRate: 100,
    };
  }

  private updateMetrics(event: SecurityEvent): void {
    this.metrics.totalEvents++;
    this.metrics.activeThreats = this.activeThreats.size;
    this.metrics.pendingActions = this.actionQueue.filter(
      a => a.status === ActionStatus.PENDING
    ).length;

    const completedActions = this.actionQueue.filter(
      a => a.status === ActionStatus.COMPLETED
    );
    this.metrics.successRate =
      (completedActions.length /
        (completedActions.length +
          this.actionQueue.filter(a => a.status === ActionStatus.FAILED).length)) *
      100;

    // Calculate average response time
    const responseTimes = completedActions.map(
      a => a.result!.timestamp.getTime() - a.timestamp.getTime()
    );
    this.metrics.avgResponseTime =
      responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  }
}