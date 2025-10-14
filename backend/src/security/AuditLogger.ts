import { SupabaseClient } from '@supabase/supabase-js';
import { Request } from 'express';
import { createHash } from 'crypto';

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  category: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  resourceId?: string;
  resourceType?: string;
  status: 'success' | 'failure';
  details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  hash: string;
}

interface AuditLogOptions {
  resourceId?: string;
  resourceType?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  details?: any;
}

class AuditLogger {
  private static instance: AuditLogger;
  private supabase: SupabaseClient;
  private previousLogHash: string = '';

  private constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  static getInstance(supabase: SupabaseClient): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger(supabase);
    }
    return AuditLogger.instance;
  }

  /**
   * Create a cryptographic hash of the audit log entry
   */
  private createLogHash(log: Omit<AuditLog, 'id' | 'hash'>): string {
    const hash = createHash('sha3-512');
    hash.update(JSON.stringify(log) + this.previousLogHash);
    return hash.digest('hex');
  }

  /**
   * Log an audit event
   */
  async log(
    req: Request,
    action: string,
    category: string,
    status: 'success' | 'failure',
    options: AuditLogOptions = {}
  ): Promise<void> {
    const userId = req.user?.id || 'anonymous';
    const timestamp = new Date();

    const logEntry: Omit<AuditLog, 'id' | 'hash'> = {
      userId,
      action,
      category,
      timestamp,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || 'unknown',
      resourceId: options.resourceId,
      resourceType: options.resourceType,
      status,
      details: options.details || {},
      severity: options.severity || 'low',
    };

    // Create hash chain
    const hash = this.createLogHash(logEntry);
    this.previousLogHash = hash;

    // Store in database
    const { error } = await this.supabase
      .from('audit_logs')
      .insert({
        ...logEntry,
        hash,
      });

    if (error) {
      console.error('Failed to store audit log:', error);
      throw error;
    }

    // If high severity, trigger alert
    if (options.severity === 'high' || options.severity === 'critical') {
      await this.triggerSecurityAlert(logEntry);
    }
  }

  /**
   * Trigger security alert for high-severity events
   */
  private async triggerSecurityAlert(log: Omit<AuditLog, 'id' | 'hash'>): Promise<void> {
    // In production, this would integrate with your alert system
    console.warn('SECURITY ALERT:', {
      timestamp: log.timestamp,
      action: log.action,
      category: log.category,
      severity: log.severity,
      userId: log.userId,
      ipAddress: log.ipAddress,
    });
  }

  /**
   * Verify the integrity of the audit log chain
   */
  async verifyLogIntegrity(): Promise<boolean> {
    const { data: logs, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: true });

    if (error) throw error;

    let previousHash = '';
    for (const log of logs) {
      const { id, hash, ...logData } = log;
      const calculatedHash = createHash('sha3-512')
        .update(JSON.stringify(logData) + previousHash)
        .digest('hex');

      if (calculatedHash !== hash) {
        console.error('Audit log integrity violation detected:', {
          logId: id,
          timestamp: log.timestamp,
        });
        return false;
      }

      previousHash = hash;
    }

    return true;
  }

  /**
   * Get audit logs with filtering
   */
  async getLogs(filters: {
    userId?: string;
    category?: string;
    severity?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<AuditLog[]> {
    let query = this.supabase
      .from('audit_logs')
      .select('*');

    if (filters.userId) {
      query = query.eq('userId', filters.userId);
    }
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.severity) {
      query = query.eq('severity', filters.severity);
    }
    if (filters.startDate) {
      query = query.gte('timestamp', filters.startDate.toISOString());
    }
    if (filters.endDate) {
      query = query.lte('timestamp', filters.endDate.toISOString());
    }

    query = query
      .order('timestamp', { ascending: false })
      .limit(filters.limit || 100);

    const { data, error } = await query;

    if (error) throw error;
    return data as AuditLog[];
  }

  /**
   * Get security metrics
   */
  async getSecurityMetrics(): Promise<{
    totalLogs: number;
    criticalEvents: number;
    failedActions: number;
    uniqueUsers: number;
  }> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('severity, status, userId');

    if (error) throw error;

    const logs = data as AuditLog[];
    const uniqueUsers = new Set(logs.map(log => log.userId)).size;

    return {
      totalLogs: logs.length,
      criticalEvents: logs.filter(log => log.severity === 'critical').length,
      failedActions: logs.filter(log => log.status === 'failure').length,
      uniqueUsers,
    };
  }

  /**
   * Export audit logs for compliance
   */
  async exportLogs(startDate: Date, endDate: Date): Promise<string> {
    const logs = await this.getLogs({ startDate, endDate });
    return JSON.stringify(logs, null, 2);
  }
}

export default AuditLogger;