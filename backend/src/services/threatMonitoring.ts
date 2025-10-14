import { Threat, ThreatType, ThreatSeverity, ThreatStatus } from '@/types';
import DatabaseService from '@/services/database';
import { supabase } from '@/config/database';
import { Logger } from '@/utils/logger';

export class ThreatMonitoringService {
  private static readonly logger = new Logger('threat-monitoring');

  // Create a new threat record
  static async createThreat(
    userId: string,
    threatData: {
      type: ThreatType;
      severity: ThreatSeverity;
      title: string;
      description: string;
      sourceIp?: string;
      sourceLocation?: any;
      indicators?: any;
      evidence?: any;
      metadata?: Record<string, any>;
    }
  ): Promise<Threat | null> {
    try {
      const dbThreatData: Partial<{
        user_id: string;
        type: ThreatType;
        severity: ThreatSeverity;
        title: string;
        description: string;
        status: ThreatStatus;
        source_ip?: string;
        source_location?: any;
        indicators?: any;
        evidence?: any;
        metadata?: Record<string, any>;
      }> = {
        user_id: userId,
        type: threatData.type,
        severity: threatData.severity,
        title: threatData.title,
        description: threatData.description,
        source_ip: threatData.sourceIp,
        source_location: threatData.sourceLocation,
        indicators: threatData.indicators || {},
        evidence: threatData.evidence || {},
        metadata: threatData.metadata || {},
        status: ThreatStatus.DETECTED,
      };

      const threat = await DatabaseService.createThreat(dbThreatData);

      if (threat) {
        // Log threat creation
        await DatabaseService.logAuditEvent(
          userId,
          'threat_detected',
          'threat',
          threat.id,
          null,
          {
            type: threat.type,
            severity: threat.severity,
            title: threat.title,
          }
        );

        // Emit real-time alert via WebSocket
        const { wsHandlers } = require('../index');
        wsHandlers.emitThreatAlert(userId, {
          id: threat.id,
          type: threat.type,
          severity: threat.severity,
          title: threat.title,
          description: threat.description,
          detectedAt: threat.detectedAt
        });
      }

      return threat;
    } catch (error) {
      ThreatMonitoringService.logger.error('Error creating threat:', error);
      return null;
    }
  }

  // Get threats for a user
  static async getUserThreats(
    userId: string,
    options: {
      limit?: number;
      status?: ThreatStatus;
      severity?: ThreatSeverity;
      type?: ThreatType;
    } = {}
  ): Promise<Threat[]> {
    try {
      const { data: threats, error } = await supabase
        .from('threats')
        .select('*')
        .eq('user_id', userId)
        .order('detected_at', { ascending: false })
        .limit(options.limit || 50);

      if (error) throw error;

      let filteredThreats = threats as Threat[];

      // Apply filters
      if (options.status) {
        filteredThreats = filteredThreats.filter(t => t.status === options.status);
      }
      if (options.severity) {
        filteredThreats = filteredThreats.filter(t => t.severity === options.severity);
      }
      if (options.type) {
        filteredThreats = filteredThreats.filter(t => t.type === options.type);
      }

      return filteredThreats;
    } catch (error) {
      ThreatMonitoringService.logger.error('Error fetching user threats:', error);
      return [];
    }
  }

  // Get threat by ID
  static async getThreatById(threatId: string, userId: string): Promise<Threat | null> {
    try {
      const threat = await DatabaseService.getThreatById(threatId);

      if (!threat || (threat as any).user_id !== userId) {
        return null;
      }

      return threat;
    } catch (error) {
      ThreatMonitoringService.logger.error('Error fetching threat:', error);
      return null;
    }
  }

  // Update threat status
  static async updateThreatStatus(
    threatId: string,
    userId: string,
    status: ThreatStatus,
    resolutionNotes?: string
  ): Promise<boolean> {
    try {
      const threat = await DatabaseService.getThreatById(threatId);

      if (!threat || (threat as any).user_id !== userId) {
        throw new Error('Threat not found or access denied');
      }

      const success = await DatabaseService.updateThreatStatus(threatId, status, resolutionNotes);

      if (success) {
        // Log threat status update
        await DatabaseService.logAuditEvent(
          userId,
          'threat_status_updated',
          'threat',
          threatId,
          { status: threat.status },
          { status, resolutionNotes }
        );
      }

      return success;
    } catch (error) {
      ThreatMonitoringService.logger.error('Error updating threat status:', error);
      return false;
    }
  }

  // Get threat statistics for a user
  static async getThreatStats(userId: string): Promise<any> {
    try {
      const threats = await this.getUserThreats(userId);

      const stats = {
        total: threats.length,
        byStatus: {} as Record<ThreatStatus, number>,
        bySeverity: {} as Record<ThreatSeverity, number>,
        byType: {} as Record<ThreatType, number>,
        recent: threats.slice(0, 10), // Last 10 threats
        unresolved: threats.filter(t => t.status !== ThreatStatus.RESOLVED).length,
      };

      // Count by status
      Object.values(ThreatStatus).forEach(status => {
        stats.byStatus[status] = threats.filter(t => t.status === status).length;
      });

      // Count by severity
      Object.values(ThreatSeverity).forEach(severity => {
        stats.bySeverity[severity] = threats.filter(t => t.severity === severity).length;
      });

      // Count by type
      Object.values(ThreatType).forEach(type => {
        stats.byType[type] = threats.filter(t => t.type === type).length;
      });

      return stats;
    } catch (error) {
      ThreatMonitoringService.logger.error('Error calculating threat stats:', error);
      return {
        total: 0,
        byStatus: {},
        bySeverity: {},
        byType: {},
        recent: [],
        unresolved: 0,
      };
    }
  }

  // Real-time threat detection using multiple intelligence sources
  static async detectThreats(userId: string): Promise<Threat | null> {
    try {
      // 1. Analyze user activity patterns
      const activityAnalysis = await this.analyzeUserActivity(userId);
      
      // 2. Check against threat intelligence feeds
      const threatIntelligence = await this.checkThreatIntelligence(userId);
      
      // 3. Monitor blockchain transactions for suspicious patterns
      const blockchainAnalysis = await this.analyzeBlockchainActivity(userId);
      
      // 4. Check for known attack patterns
      const attackPatterns = await this.checkAttackPatterns(userId);
      
      // Determine if any threats are detected
      const detectedThreat = this.evaluateThreatLevel(activityAnalysis, threatIntelligence, blockchainAnalysis, attackPatterns);
      
      if (detectedThreat) {
        return await this.createThreat(userId, detectedThreat);
      }
      
      return null;
    } catch (error) {
      ThreatMonitoringService.logger.error('Error detecting threats:', error);
      return null;
    }
  }

  /**
   * Analyze user activity patterns for anomalies
   */
  private static async analyzeUserActivity(userId: string): Promise<any> {
    try {
      // Get recent user activity
      const recentActivity = await DatabaseService.getUserActivity(userId, 24); // Last 24 hours
      
      // Analyze patterns
      const analysis = {
        loginAttempts: recentActivity.filter((a: { type: string }) => a.type === 'login').length,
        failedLogins: recentActivity.filter((a: { type: string }) => a.type === 'login_failed').length,
        unusualLocations: this.detectUnusualLocations(recentActivity),
        timePatterns: this.analyzeTimePatterns(recentActivity),
        deviceFingerprints: this.analyzeDeviceFingerprints(recentActivity)
      };
      
      return analysis;
    } catch (error) {
      ThreatMonitoringService.logger.error('Error analyzing user activity:', error);
      return {};
    }
  }

  /**
   * Check against threat intelligence feeds
   */
  private static async checkThreatIntelligence(userId: string): Promise<any> {
    try {
      // Get user's IP addresses and associated data
      const userData = await DatabaseService.getUserNetworkData(userId);
      
      // Check against known threat indicators
      const threatChecks = {
        ipReputation: await this.checkIPReputation(userData.ip_addresses),
        userAgentReputation: await this.checkDeviceReputation(userData.userAgents)
      };
      
      return threatChecks;
    } catch (error) {
      ThreatMonitoringService.logger.error('Error checking threat intelligence:', error);
      return {};
    }
  }

  /**
   * Analyze blockchain activity for suspicious patterns
   */
  private static async analyzeBlockchainActivity(userId: string): Promise<any> {
    try {
      // Get user's wallet addresses
      const userWallets = await DatabaseService.getUserWallets(userId);
      
      // Analyze transaction patterns
      const analysis = {
        unusualAmounts: await this.detectUnusualTransactionAmounts(userWallets),
        suspiciousAddresses: await this.detectSuspiciousAddresses(userWallets),
        mixerUsage: await this.detectMixerUsage(userWallets),
        crossChainMovements: await this.analyzeCrossChainMovements(userWallets)
      };
      
      return analysis;
    } catch (error) {
      ThreatMonitoringService.logger.error('Error analyzing blockchain activity:', error);
      return {};
    }
  }

  /**
   * Check for known attack patterns
   */
  private static async checkAttackPatterns(userId: string): Promise<any> {
    try {
      // Get recent security events
      const securityEvents = await DatabaseService.getSecurityEvents(userId, 7); // Last 7 days
      
      // Check for attack patterns
      const patterns = {
        phishingAttempts: this.detectPhishingPatterns(securityEvents),
        malwareSignatures: this.detectMalwareSignatures(securityEvents),
        socialEngineering: this.detectSocialEngineeringPatterns(securityEvents),
        networkAttacks: this.detectNetworkAttackPatterns(securityEvents)
      };
      
      return patterns;
    } catch (error) {
      ThreatMonitoringService.logger.error('Error checking attack patterns:', error);
      return {};
    }
  }

  /**
   * Evaluate threat level based on all analysis results
   */
  private static evaluateThreatLevel(activityAnalysis: any, threatIntelligence: any, blockchainAnalysis: any, attackPatterns: any): any | null {
    let threatLevel = 0;
    let threatType = null;
    let severity = ThreatSeverity.LOW;
    
    // Evaluate activity anomalies
    if (activityAnalysis.failedLogins > 5) {
      threatLevel += 30;
      threatType = ThreatType.PHISHING;
    }
    
    if (activityAnalysis.unusualLocations > 0) {
      threatLevel += 20;
      threatType = ThreatType.SUSPICIOUS_TRANSACTION;
    }
    
    // Evaluate threat intelligence
    if (threatIntelligence.ipReputation?.malicious) {
      threatLevel += 40;
      threatType = ThreatType.NETWORK_ATTACK;
    }
    
    // Evaluate blockchain analysis
    if (blockchainAnalysis.mixerUsage) {
      threatLevel += 25;
      threatType = ThreatType.SUSPICIOUS_TRANSACTION;
    }
    
    if (blockchainAnalysis.suspiciousAddresses > 0) {
      threatLevel += 35;
      threatType = ThreatType.SUSPICIOUS_TRANSACTION;
    }
    
    // Evaluate attack patterns
    if (attackPatterns.phishingAttempts > 0) {
      threatLevel += 30;
      threatType = ThreatType.PHISHING;
    }
    
    if (attackPatterns.malwareSignatures > 0) {
      threatLevel += 50;
      threatType = ThreatType.MALWARE;
    }
    
    // Determine severity
    if (threatLevel >= 80) {
      severity = ThreatSeverity.CRITICAL;
    } else if (threatLevel >= 60) {
      severity = ThreatSeverity.HIGH;
    } else if (threatLevel >= 40) {
      severity = ThreatSeverity.MEDIUM;
    } else if (threatLevel >= 20) {
      severity = ThreatSeverity.LOW;
    } else {
      return null; // No threat detected
    }
    
    return {
      type: threatType || ThreatType.SUSPICIOUS_TRANSACTION,
      severity,
      title: this.generateThreatTitle(threatType, severity),
      description: this.generateThreatDescription(threatType, severity, threatLevel),
      sourceIp: activityAnalysis.sourceIp || 'Unknown',
      metadata: {
        threatLevel,
        detectionMethod: 'multi_source_analysis',
        confidence: Math.min(threatLevel, 100),
        analysisResults: {
          activityAnalysis,
          threatIntelligence,
          blockchainAnalysis,
          attackPatterns
        }
      }
    };
  }

  // Helper methods for threat detection
  private static detectUnusualLocations(activity: any[]): number {
    // Implementation for detecting unusual login locations
    return 0;
  }

  private static analyzeTimePatterns(activity: any[]): any {
    // Implementation for analyzing time-based patterns
    return {};
  }

  private static analyzeDeviceFingerprints(activity: any[]): any {
    // Implementation for analyzing device fingerprints
    return {};
  }

  private static async checkIPReputation(ipAddresses: string[]): Promise<any> {
    // Implementation for checking IP reputation
    return { malicious: false };
  }

  private static async checkDomainReputation(domains: string[]): Promise<any> {
    // Implementation for checking domain reputation
    return { malicious: false };
  }

  private static async checkEmailReputation(email: string): Promise<any> {
    // Implementation for checking email reputation
    return { malicious: false };
  }

  private static async checkDeviceReputation(deviceFingerprints: string[]): Promise<any> {
    // Implementation for checking device reputation
    return { malicious: false };
  }

  private static async detectUnusualTransactionAmounts(wallets: any[]): Promise<number> {
    // Implementation for detecting unusual transaction amounts
    return 0;
  }

  private static async detectSuspiciousAddresses(wallets: any[]): Promise<number> {
    // Implementation for detecting suspicious addresses
    return 0;
  }

  private static async detectMixerUsage(wallets: any[]): Promise<boolean> {
    // Implementation for detecting mixer usage
    return false;
  }

  private static async analyzeCrossChainMovements(wallets: any[]): Promise<number> {
    // Implementation for analyzing cross-chain movements
    return 0;
  }

  private static detectPhishingPatterns(events: any[]): number {
    // Implementation for detecting phishing patterns
    return 0;
  }

  private static detectMalwareSignatures(events: any[]): number {
    // Implementation for detecting malware signatures
    return 0;
  }

  private static detectSocialEngineeringPatterns(events: any[]): number {
    // Implementation for detecting social engineering patterns
    return 0;
  }

  private static detectNetworkAttackPatterns(events: any[]): number {
    // Implementation for detecting network attack patterns
    return 0;
  }

  private static generateThreatTitle(threatType: ThreatType, severity: ThreatSeverity): string {
    const titles: Record<ThreatType, string> = {
      [ThreatType.PHISHING]: 'Suspicious login attempt detected',
      [ThreatType.MALWARE]: 'Malware signature detected',
      [ThreatType.SUSPICIOUS_TRANSACTION]: 'Unusual transaction pattern',
      [ThreatType.SOCIAL_ENGINEERING]: 'Social engineering attempt identified',
      [ThreatType.NETWORK_ATTACK]: 'Network attack detected',
      [ThreatType.PHYSICAL_SECURITY]: 'Physical security breach',
      [ThreatType.REGULATORY_VIOLATION]: 'Regulatory compliance issue',
      [ThreatType.MARKET_MANIPULATION]: 'Market manipulation detected',
    };
    
    return titles[threatType] || 'Security threat detected';
  }

  private static generateThreatDescription(threatType: ThreatType, severity: ThreatSeverity, threatLevel: number): string {
    return `Multi-source threat detection system identified a ${severity.toLowerCase()} level ${threatType.toLowerCase()} threat with ${threatLevel}% confidence score.`;
  }

  // Get threat intelligence feed from multiple sources
  static async getThreatIntelligence(): Promise<any[]> {
    try {
      const intelligenceFeeds = [];
      
      // 1. Fetch from internal threat database
      const internalThreats = await this.getInternalThreatIntelligence();
      intelligenceFeeds.push(...internalThreats);
      
      // 2. Fetch from external threat intelligence APIs
      const externalThreats = await this.getExternalThreatIntelligence();
      intelligenceFeeds.push(...externalThreats);
      
      // 3. Fetch from blockchain security feeds
      const blockchainThreats = await this.getBlockchainThreatIntelligence();
      intelligenceFeeds.push(...blockchainThreats);
      
      // 4. Fetch from regulatory feeds
      const regulatoryThreats = await this.getRegulatoryThreatIntelligence();
      intelligenceFeeds.push(...regulatoryThreats);
      
      // Sort by severity and recency
      return intelligenceFeeds.sort((a, b) => {
        const severityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        const severityDiff = (severityOrder[b.severity as keyof typeof severityOrder] || 0) - (severityOrder[a.severity as keyof typeof severityOrder] || 0);
        if (severityDiff !== 0) return severityDiff;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });
    } catch (error) {
      ThreatMonitoringService.logger.error('Error fetching threat intelligence:', error);
      return [];
    }
  }

  /**
   * Get internal threat intelligence from our database
   */
  private static async getInternalThreatIntelligence(): Promise<any[]> {
    try {
      const threats = await DatabaseService.getThreatIntelligence();
      return threats.map(threat => ({
        id: `internal_${Date.now()}`,
        type: 'internal',
        title: `Threat Report - ${threat.type}`,
        description: `Threat intelligence report from ${threat.source}`,
        severity: threat.severity,
        affectedRegions: [] as string[],
        indicators: threat.indicators || [],
        mitigation: 'Contact security team',
        publishedAt: threat.timestamp.toISOString(),
        source: 'VaultGuard Internal'
      }));
    } catch (error) {
      ThreatMonitoringService.logger.error('Error fetching internal threat intelligence:', error);
      return [];
    }
  }

  /**
   * Get external threat intelligence from third-party feeds
   */
  private static async getExternalThreatIntelligence(): Promise<any[]> {
    try {
      const axios = require('axios');
      const externalFeeds = [];
      
      // Fetch from multiple threat intelligence providers
      const providers = [
        { name: 'VirusTotal', url: process.env.VIRUSTOTAL_API_URL },
        { name: 'AbuseIPDB', url: process.env.ABUSEIPDB_API_URL },
        { name: 'ThreatConnect', url: process.env.THREATCONNECT_API_URL }
      ];
      
      for (const provider of providers) {
        if (provider.url) {
          try {
            const response = await axios.get(provider.url, {
              headers: { 'Authorization': `Bearer ${process.env[`${provider.name.toUpperCase()}_API_KEY`]}` },
              timeout: 5000
            });
            
            const threats = response.data.threats || [];
            externalFeeds.push(...threats.map((threat: any) => ({
              id: `external_${provider.name}_${threat.id}`,
              type: 'external',
              title: threat.title,
              description: threat.description,
              severity: this.mapSeverity(threat.severity),
              affectedRegions: threat.regions || [],
              indicators: threat.indicators || [],
              mitigation: threat.mitigation || 'Monitor and report',
              publishedAt: threat.published_at || new Date().toISOString(),
              source: provider.name
            })));
          } catch (error) {
            ThreatMonitoringService.logger.warn(`Failed to fetch from ${provider.name}:`, error);
          }
        }
      }
      
      return externalFeeds;
    } catch (error) {
      ThreatMonitoringService.logger.error('Error fetching external threat intelligence:', error);
      return [];
    }
  }

  /**
   * Get blockchain-specific threat intelligence
   */
  private static async getBlockchainThreatIntelligence(): Promise<any[]> {
    try {
      const axios = require('axios');
      const blockchainFeeds = [];
      
      // Fetch from blockchain security providers
      const providers = [
        { name: 'Chainalysis', url: process.env.CHAINALYSIS_API_URL },
        { name: 'Elliptic', url: process.env.ELLIPTIC_API_URL },
        { name: 'CipherTrace', url: process.env.CIPHERTRACE_API_URL }
      ];
      
      for (const provider of providers) {
        if (provider.url) {
          try {
            const response = await axios.get(provider.url, {
              headers: { 'Authorization': `Bearer ${process.env[`${provider.name.toUpperCase()}_API_KEY`]}` },
              timeout: 5000
            });
            
            const threats = response.data.threats || [];
            blockchainFeeds.push(...threats.map((threat: any) => ({
              id: `blockchain_${provider.name}_${threat.id}`,
              type: 'blockchain',
              title: threat.title,
              description: threat.description,
              severity: this.mapSeverity(threat.severity),
              affectedProtocols: threat.protocols || [],
              indicators: threat.indicators || [],
              mitigation: threat.mitigation || 'Review transactions',
              publishedAt: threat.published_at || new Date().toISOString(),
              source: provider.name
            })));
          } catch (error) {
            ThreatMonitoringService.logger.warn(`Failed to fetch from ${provider.name}:`, error);
          }
        }
      }
      
      return blockchainFeeds;
    } catch (error) {
      ThreatMonitoringService.logger.error('Error fetching blockchain threat intelligence:', error);
      return [];
    }
  }

  /**
   * Get regulatory threat intelligence
   */
  private static async getRegulatoryThreatIntelligence(): Promise<any[]> {
    try {
      const axios = require('axios');
      const regulatoryFeeds = [];
      
      // Fetch from regulatory sources
      const sources = [
        { name: 'SEC', url: process.env.SEC_API_URL },
        { name: 'FCA', url: process.env.FCA_API_URL },
        { name: 'FINMA', url: process.env.FINMA_API_URL }
      ];
      
      for (const source of sources) {
        if (source.url) {
          try {
            const response = await axios.get(source.url, {
              headers: { 'Authorization': `Bearer ${process.env[`${source.name.toUpperCase()}_API_KEY`]}` },
              timeout: 5000
            });
            
            const threats = response.data.regulations || [];
            regulatoryFeeds.push(...threats.map((threat: any) => ({
              id: `regulatory_${source.name}_${threat.id}`,
              type: 'regulatory',
              title: threat.title,
              description: threat.description,
              severity: this.mapSeverity(threat.severity),
              affectedJurisdictions: threat.jurisdictions || [],
              indicators: threat.indicators || [],
              mitigation: threat.mitigation || 'Review compliance requirements',
              publishedAt: threat.published_at || new Date().toISOString(),
              source: source.name
            })));
          } catch (error) {
            ThreatMonitoringService.logger.warn(`Failed to fetch from ${source.name}:`, error);
          }
        }
      }
      
      return regulatoryFeeds;
    } catch (error) {
      ThreatMonitoringService.logger.error('Error fetching regulatory threat intelligence:', error);
      return [];
    }
  }

  /**
   * Map external severity levels to our internal severity enum
   */
  private static mapSeverity(externalSeverity: string): ThreatSeverity {
    const severityMap: Record<string, ThreatSeverity> = {
      'critical': ThreatSeverity.CRITICAL,
      'high': ThreatSeverity.HIGH,
      'medium': ThreatSeverity.MEDIUM,
      'low': ThreatSeverity.LOW,
      'info': ThreatSeverity.LOW
    };
    
    return severityMap[externalSeverity.toLowerCase()] || ThreatSeverity.MEDIUM;
  }
}

export default ThreatMonitoringService;
