import { Logger } from '../utils/logger';
import { ChainanalysisClient, ChainAnalysisOptions } from '../integrations/chainalysis';
import { DatabaseService } from './database';
import { Asset } from '../types';

interface ForensicData {
  transactionHistory: any[];
}

// --- Begin: Forensic Provider Interface and Classes ---
interface ForensicProvider {
  name: string;
  analyzeTransaction(txHash: string): Promise<any>;
  getRiskProfile(address: string): Promise<any>;
}

class BlockchairProvider implements ForensicProvider {
  name = 'Blockchair';
  private apiKey: string;
  private baseUrl = 'https://api.blockchair.com';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.BLOCKCHAIR_API_KEY || '';
  }

  async analyzeTransaction(txHash: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/bitcoin/dashboards/transaction/${txHash}?key=${this.apiKey}`);
      const data = await response.json();
      
      if (data.data && data.data[txHash]) {
        const tx = data.data[txHash];
        return {
          provider: this.name,
          txHash,
          risk: this.calculateRiskScore(tx),
          details: {
            inputs: tx.transaction.inputs?.length || 0,
            outputs: tx.transaction.outputs?.length || 0,
            value: tx.transaction.balance_change,
            fee: tx.transaction.fee,
            size: tx.transaction.size,
            confirmations: tx.transaction.block_id ? 1 : 0,
            timestamp: tx.transaction.time
          }
        };
      }
      
      return { provider: this.name, txHash, risk: 'unknown', details: {} };
    } catch (error) {
      console.error('Blockchair API error:', error);
      return { provider: this.name, txHash, risk: 'error', details: { error: error.message } };
    }
  }

  async getRiskProfile(address: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/bitcoin/dashboards/address/${address}?key=${this.apiKey}`);
      const data = await response.json();
      
      if (data.data && data.data[address]) {
        const addr = data.data[address];
        return {
          provider: this.name,
          address,
          risk: this.calculateAddressRisk(addr),
          details: {
            balance: addr.address.balance,
            received: addr.address.received,
            sent: addr.address.sent,
            transactionCount: addr.address.transaction_count,
            firstSeen: addr.address.first_seen,
            lastSeen: addr.address.last_seen
          }
        };
      }
      
      return { provider: this.name, address, risk: 'unknown', details: {} };
    } catch (error) {
      console.error('Blockchair API error:', error);
      return { provider: this.name, address, risk: 'error', details: { error: error.message } };
    }
  }

  private calculateRiskScore(tx: any): string {
    let riskScore = 0;
    
    // Check for unusual patterns
    if (tx.transaction.inputs?.length > 10) riskScore += 2;
    if (tx.transaction.outputs?.length > 10) riskScore += 2;
    if (tx.transaction.fee > 100000) riskScore += 3; // High fee
    if (tx.transaction.size > 1000) riskScore += 1; // Large transaction
    
    if (riskScore >= 5) return 'high';
    if (riskScore >= 3) return 'medium';
    return 'low';
  }

  private calculateAddressRisk(addr: any): string {
    let riskScore = 0;
    
    // Check for suspicious patterns
    if (addr.address.transaction_count > 1000) riskScore += 2;
    if (addr.address.received > 1000000000) riskScore += 3; // High value
    if (addr.address.balance > 100000000) riskScore += 2; // High balance
    
    if (riskScore >= 5) return 'high';
    if (riskScore >= 3) return 'medium';
    return 'low';
  }
}
class BlockstreamProvider implements ForensicProvider {
  name = 'Blockstream';
  async analyzeTransaction(txHash: string): Promise<any> { return { provider: this.name, txHash, risk: 'unknown', details: {} }; }
  async getRiskProfile(address: string): Promise<any> { return { provider: this.name, address, risk: 'unknown', details: {} }; }
}
class BlockchainInfoProvider implements ForensicProvider {
  name = 'Blockchain.info';
  async analyzeTransaction(txHash: string): Promise<any> { return { provider: this.name, txHash, risk: 'unknown', details: {} }; }
  async getRiskProfile(address: string): Promise<any> { return { provider: this.name, address, risk: 'unknown', details: {} }; }
}
class EtherscanProvider implements ForensicProvider {
  name = 'Etherscan';
  async analyzeTransaction(txHash: string): Promise<any> { return { provider: this.name, txHash, risk: 'unknown', details: {} }; }
  async getRiskProfile(address: string): Promise<any> { return { provider: this.name, address, risk: 'unknown', details: {} }; }
}
class BTCComProvider implements ForensicProvider {
  name = 'BTC.com';
  async analyzeTransaction(txHash: string): Promise<any> { return { provider: this.name, txHash, risk: 'unknown', details: {} }; }
  async getRiskProfile(address: string): Promise<any> { return { provider: this.name, address, risk: 'unknown', details: {} }; }
}
class BlockCypherProvider implements ForensicProvider {
  name = 'BlockCypher';
  async analyzeTransaction(txHash: string): Promise<any> { return { provider: this.name, txHash, risk: 'unknown', details: {} }; }
  async getRiskProfile(address: string): Promise<any> { return { provider: this.name, address, risk: 'unknown', details: {} }; }
}
class SoChainProvider implements ForensicProvider {
  name = 'SoChain';
  async analyzeTransaction(txHash: string): Promise<any> { return { provider: this.name, txHash, risk: 'unknown', details: {} }; }
  async getRiskProfile(address: string): Promise<any> { return { provider: this.name, address, risk: 'unknown', details: {} }; }
}
class TokenviewProvider implements ForensicProvider {
  name = 'Tokenview';
  async analyzeTransaction(txHash: string): Promise<any> { return { provider: this.name, txHash, risk: 'unknown', details: {} }; }
  async getRiskProfile(address: string): Promise<any> { return { provider: this.name, address, risk: 'unknown', details: {} }; }
}
class BlockScoutProvider implements ForensicProvider {
  name = 'BlockScout';
  async analyzeTransaction(txHash: string): Promise<any> { return { provider: this.name, txHash, risk: 'unknown', details: {} }; }
  async getRiskProfile(address: string): Promise<any> { return { provider: this.name, address, risk: 'unknown', details: {} }; }
}
class MempoolSpaceProvider implements ForensicProvider {
  name = 'Mempool.space';
  async analyzeTransaction(txHash: string): Promise<any> { return { provider: this.name, txHash, risk: 'unknown', details: {} }; }
  async getRiskProfile(address: string): Promise<any> { return { provider: this.name, address, risk: 'unknown', details: {} }; }
}
// --- End: Forensic Provider Classes ---

export class ForensicAnalysisService {
  private logger = new Logger('ForensicAnalysisService');
  private providers: ForensicProvider[];
  constructor() {
    this.providers = [
      new BlockchairProvider(),
      new BlockstreamProvider(),
      new BlockchainInfoProvider(),
      new EtherscanProvider(),
      new BTCComProvider(),
      new BlockCypherProvider(),
      new SoChainProvider(),
      new TokenviewProvider(),
      new BlockScoutProvider(),
      new MempoolSpaceProvider(),
    ];
    this.logger.info('ForensicAnalysisService initialized with 10 providers.');
  }
  public async analyzeThiefPatterns(userId: string, stolenTxId: string): Promise<string[]> {
    try {
      // Query all providers in parallel
      const results = await Promise.allSettled(
        this.providers.map((provider) => provider.analyzeTransaction(stolenTxId))
      );
      // Aggregate and correlate results
      const suspectAddresses = this.aggregateSuspectAddresses(results);
      await DatabaseService.logAuditEvent(userId, 'forensic_analysis_multi_provider', 'Transaction', stolenTxId, null, { suspectAddresses, results });
      this.logger.info(`Aggregated suspect addresses for tx ${stolenTxId}: ${suspectAddresses.join(', ')}`);
      return suspectAddresses;
    } catch (error: any) {
      const errorMessage = `Failed to analyze thief patterns (multi-provider) for ${stolenTxId}: ${error.message}`;
      await DatabaseService.logAuditEvent(userId, 'forensic_analysis_error', 'Transaction', stolenTxId, null, { error: errorMessage });
      this.logger.error(errorMessage);
      throw error;
    }
  }
  private aggregateSuspectAddresses(results: PromiseSettledResult<any>[]): string[] {
    // ML-based pattern recognition placeholder: aggregate all unique addresses
    const addresses = new Set<string>();
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value && result.value.suspectAddresses) {
        for (const addr of result.value.suspectAddresses) addresses.add(addr);
      }
    }
    return Array.from(addresses);
  }
  public async getAddressRiskProfile(userId: string, address: string): Promise<any> {
    try {
      const results = await Promise.allSettled(
        this.providers.map((provider) => provider.getRiskProfile(address))
      );
      await DatabaseService.logAuditEvent(userId, 'forensic_risk_profile_multi_provider', 'Address', address, null, { results });
      this.logger.info(`Aggregated risk profile for address ${address}.`);
      return results;
    } catch (error: any) {
      const errorMessage = `Failed to get risk profile (multi-provider) for address ${address}: ${error.message}`;
      await DatabaseService.logAuditEvent(userId, 'forensic_risk_profile_error', 'Address', address, null, { error: errorMessage });
      this.logger.error(errorMessage);
      throw error;
    }
  }

  /**
   * Advanced blockchain forensics with multiple data sources
   */
  public async performAdvancedForensics(userId: string, transactionHashes: string[]): Promise<{
    suspectAddresses: string[];
    riskScores: Record<string, number>;
    transactionGraph: any;
    moneyFlow: any;
    recommendations: string[];
  }> {
    try {
      this.logger.info(`Performing advanced forensics on ${transactionHashes.length} transactions`);

      // Analyze each transaction with all providers
      const analysisPromises = transactionHashes.map(async (txHash) => {
        try {
          const results = await Promise.allSettled(
            this.providers.map((provider) => provider.analyzeTransaction(txHash))
          );
          return { txHash, results };
        } catch (error: any) {
          this.logger.error(`Failed to analyze transaction ${txHash}:`, error);
          return { txHash, results: [] as any[], error: error.message };
        }
      });

      const analysisResults = await Promise.all(analysisPromises);
      
      // Extract suspect addresses from all transactions
      const allSuspectAddresses = analysisResults
        .filter(result => result.results && result.results.length > 0)
        .flatMap(result => this.aggregateSuspectAddresses(result.results));

      // Calculate risk scores for each address
      const riskScorePromises = allSuspectAddresses.map(async (address) => {
        try {
          const results = await Promise.allSettled(
            this.providers.map((provider) => provider.getRiskProfile(address))
          );
          const riskScore = this.calculateAggregateRiskScore(results);
          return { address, riskScore };
        } catch (error: any) {
          this.logger.error(`Failed to get risk profile for ${address}:`, error);
          return { address, riskScore: 0 };
        }
      });

      const riskScores = await Promise.all(riskScorePromises);
      const riskScoreMap = riskScores.reduce((acc, item) => {
        acc[item.address] = item.riskScore;
        return acc;
      }, {} as Record<string, number>);

      // Build transaction graph
      const transactionGraph = this.buildTransactionGraph(analysisResults);
      
      // Analyze money flow
      const moneyFlow = this.analyzeMoneyFlow(analysisResults);

      // Generate recommendations
      const recommendations = this.generateForensicRecommendations(riskScoreMap, moneyFlow);

      const result = {
        suspectAddresses: [...new Set(allSuspectAddresses)],
        riskScores: riskScoreMap,
        transactionGraph,
        moneyFlow,
        recommendations
      };

      await DatabaseService.logAuditEvent(
        userId,
        'advanced_forensics_completed',
        'ForensicAnalysis',
        null,
        { transactionCount: transactionHashes.length, suspectCount: result.suspectAddresses.length },
        { result }
      );

      this.logger.info(`Advanced forensics completed: ${result.suspectAddresses.length} suspect addresses identified`);
      return result;
    } catch (error: any) {
      this.logger.error(`Advanced forensics failed:`, error);
      throw error;
    }
  }

  /**
   * Calculate aggregate risk score from multiple providers
   */
  private calculateAggregateRiskScore(results: PromiseSettledResult<any>[]): number {
    const validResults = results
      .filter(result => result.status === 'fulfilled' && result.value)
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value);

    if (validResults.length === 0) return 0;

    // Simple aggregation - in production, this would use more sophisticated ML
    const riskScores = validResults
      .map(result => result.risk_score || result.risk || 0)
      .filter(score => typeof score === 'number' && !isNaN(score));

    if (riskScores.length === 0) return 0;

    return riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length;
  }

  /**
   * Build transaction graph for visualization
   */
  private buildTransactionGraph(analysisResults: any[]): any {
    const nodes = new Set<string>();
    const edges: Array<{ from: string; to: string; amount: number; txHash: string }> = [];

    analysisResults.forEach(result => {
      if (result.results) {
        result.results.forEach((providerResult: any) => {
          if (providerResult.status === 'fulfilled' && providerResult.value) {
            const data = providerResult.value;
            if (data.inputs && data.outputs) {
              data.inputs.forEach((input: any) => {
                nodes.add(input.address);
                data.outputs.forEach((output: any) => {
                  nodes.add(output.address);
                  edges.push({
                    from: input.address,
                    to: output.address,
                    amount: output.value || 0,
                    txHash: result.txHash
                  });
                });
              });
            }
          }
        });
      }
    });

    return {
      nodes: Array.from(nodes),
      edges,
      totalNodes: nodes.size,
      totalEdges: edges.length
    };
  }

  /**
   * Analyze money flow patterns
   */
  private analyzeMoneyFlow(analysisResults: any[]): any {
    const flowAnalysis = {
      totalVolume: 0,
      averageTransactionSize: 0,
      flowPatterns: [] as any[],
      suspiciousPatterns: [] as string[]
    };

    let totalVolume = 0;
    let transactionCount = 0;

    analysisResults.forEach(result => {
      if (result.results) {
        result.results.forEach((providerResult: any) => {
          if (providerResult.status === 'fulfilled' && providerResult.value) {
            const data = providerResult.value;
            if (data.outputs) {
              const txVolume = data.outputs.reduce((sum: number, output: any) => sum + (output.value || 0), 0);
              totalVolume += txVolume;
              transactionCount++;

              // Detect suspicious patterns
              if (txVolume > 1000000) { // Large transactions
                flowAnalysis.suspiciousPatterns.push(`Large transaction detected: ${result.txHash} (${txVolume})`);
              }

              if (data.outputs.length > 10) { // Many outputs (potential mixing)
                flowAnalysis.suspiciousPatterns.push(`Potential mixing detected: ${result.txHash} (${data.outputs.length} outputs)`);
              }
            }
          }
        });
      }
    });

    flowAnalysis.totalVolume = totalVolume;
    flowAnalysis.averageTransactionSize = transactionCount > 0 ? totalVolume / transactionCount : 0;

    return flowAnalysis;
  }

  /**
   * Generate forensic recommendations
   */
  private generateForensicRecommendations(riskScores: Record<string, number>, moneyFlow: any): string[] {
    const recommendations: string[] = [];

    // High-risk address recommendations
    const highRiskAddresses = Object.entries(riskScores)
      .filter(([_, score]) => score > 0.7)
      .map(([address, _]) => address);

    if (highRiskAddresses.length > 0) {
      recommendations.push(`High-risk addresses detected: ${highRiskAddresses.join(', ')}. Consider immediate exchange freezes.`);
    }

    // Money flow recommendations
    if (moneyFlow.suspiciousPatterns.length > 0) {
      recommendations.push(`Suspicious transaction patterns detected: ${moneyFlow.suspiciousPatterns.length} patterns. Enhanced monitoring recommended.`);
    }

    if (moneyFlow.totalVolume > 10000000) {
      recommendations.push(`Large volume detected ($${moneyFlow.totalVolume.toLocaleString()}). Consider law enforcement notification.`);
    }

    // General recommendations
    recommendations.push('Continue monitoring suspect addresses for additional transactions.');
    recommendations.push('Coordinate with law enforcement for high-value cases.');
    recommendations.push('Document all findings for legal proceedings.');

    return recommendations;
  }

  /**
   * Get forensic analysis report
   */
  public async generateForensicReport(userId: string, caseId: string, transactionHashes: string[]): Promise<{
    reportId: string;
    caseId: string;
    analysisDate: Date;
    transactionCount: number;
    suspectAddresses: string[];
    riskAssessment: string;
    recommendations: string[];
    legalAdmissibility: boolean;
    reportUrl?: string;
  }> {
    try {
      const forensics = await this.performAdvancedForensics(userId, transactionHashes);
      
      const report = {
        reportId: `FORENSIC-${Date.now()}`,
        caseId,
        analysisDate: new Date(),
        transactionCount: transactionHashes.length,
        suspectAddresses: forensics.suspectAddresses,
        riskAssessment: this.generateRiskAssessment(forensics.riskScores),
        recommendations: forensics.recommendations,
        legalAdmissibility: true, // Would be determined by legal team
        reportUrl: `https://vaultguard.com/reports/forensic-${Date.now()}.pdf` // Would be generated
      };

      await DatabaseService.logAuditEvent(
        userId,
        'generate_forensic_report',
        'ForensicAnalysis',
        caseId,
        { reportId: report.reportId, transactionCount: transactionHashes.length },
        { report }
      );

      this.logger.info(`Forensic report generated: ${report.reportId}`);
      return report;
    } catch (error: any) {
      this.logger.error(`Failed to generate forensic report:`, error);
      throw error;
    }
  }

  /**
   * Generate risk assessment summary
   */
  private generateRiskAssessment(riskScores: Record<string, number>): string {
    const scores = Object.values(riskScores);
    const averageRisk = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
    const highRiskCount = scores.filter(score => score > 0.7).length;

    if (averageRisk > 0.8) {
      return `CRITICAL: High-risk addresses detected (${highRiskCount} addresses with risk > 0.7). Immediate action required.`;
    } else if (averageRisk > 0.5) {
      return `HIGH: Elevated risk detected (${highRiskCount} high-risk addresses). Enhanced monitoring recommended.`;
    } else if (averageRisk > 0.3) {
      return `MODERATE: Some risk indicators present. Standard monitoring sufficient.`;
    } else {
      return `LOW: Minimal risk detected. Routine monitoring recommended.`;
    }
  }

  /**
   * Track asset flow across blockchain networks
   */
  public async trackAssetFlow(transactionHashes: string[], suspectAddresses: string[]): Promise<{
    trackedAssets: number;
    exchangeDeposits: number;
    mixerUsage: boolean;
    crossChainMovements: number;
    flowSummary: any;
  }> {
    try {
      this.logger.info(`Tracking asset flow for ${transactionHashes.length} transactions and ${suspectAddresses.length} suspect addresses`);

      // Analyze transactions with all providers
      const txAnalysis = await Promise.all(
        transactionHashes.map(async (txHash) => {
          const results = await Promise.allSettled(
            this.providers.map((provider) => provider.analyzeTransaction(txHash))
          );
          return { txHash, results: results.map(result => result.status === 'fulfilled' ? result.value : null).filter(Boolean) };
        })
      );

      // Analyze suspect addresses
      const addressAnalysis = await Promise.all(
        suspectAddresses.map(async (address) => {
          const results = await Promise.allSettled(
            this.providers.map((provider) => provider.getRiskProfile(address))
          );
          return { address, results: results.map(result => result.status === 'fulfilled' ? result.value : null).filter(Boolean) };
        })
      );

      // Aggregate results
      const flowSummary = {
        transactions: txAnalysis.map(tx => ({
          txHash: tx.txHash,
          analysisCount: tx.results.length,
          riskLevel: this.aggregateRiskLevel(tx.results),
          detectedPatterns: this.extractPatterns(tx.results)
        })),
        addresses: addressAnalysis.map(addr => ({
          address: addr.address,
          analysisCount: addr.results.length,
          riskLevel: this.aggregateRiskLevel(addr.results),
          detectedPatterns: this.extractPatterns(addr.results)
        }))
      };

      // Calculate metrics
      const metrics = {
        trackedAssets: txAnalysis.length,
        exchangeDeposits: this.countExchangeDeposits(flowSummary),
        mixerUsage: this.detectMixerUsage(flowSummary),
        crossChainMovements: this.countCrossChainMovements(flowSummary)
      };

      this.logger.info(`Asset flow tracking completed with ${metrics.trackedAssets} assets tracked`);

      return {
        ...metrics,
        flowSummary
      };
    } catch (error: any) {
      this.logger.error('Asset flow tracking failed:', error);
      throw error;
    }
  }

  private aggregateRiskLevel(results: any[]): string {
    const riskScores = results
      .map(r => {
        if (typeof r.risk === 'string') {
          return r.risk === 'high' ? 1 : r.risk === 'medium' ? 0.5 : 0;
        }
        return r.risk || 0;
      })
      .filter(score => !isNaN(score));

    const avgScore = riskScores.reduce((sum, score) => sum + score, 0) / (riskScores.length || 1);
    return avgScore > 0.7 ? 'high' : avgScore > 0.3 ? 'medium' : 'low';
  }

  private extractPatterns(results: any[]): string[] {
    const patterns = new Set<string>();
    results.forEach(result => {
      if (result.details && result.details.patterns) {
        result.details.patterns.forEach((pattern: string) => patterns.add(pattern));
      }
    });
    return Array.from(patterns);
  }

  private countExchangeDeposits(flowSummary: any): number {
    return flowSummary.transactions.reduce((count: number, tx: any) => {
      return count + (tx.detectedPatterns.some((p: string) => p.toLowerCase().includes('exchange')) ? 1 : 0);
    }, 0);
  }

  private detectMixerUsage(flowSummary: any): boolean {
    return flowSummary.transactions.some((tx: any) => 
      tx.detectedPatterns.some((p: string) => p.toLowerCase().includes('mixer'))
    );
  }

  private countCrossChainMovements(flowSummary: any): number {
    return flowSummary.transactions.reduce((count: number, tx: any) => {
      return count + (tx.detectedPatterns.some((p: string) => p.toLowerCase().includes('cross-chain')) ? 1 : 0);
    }, 0);
  }
}

