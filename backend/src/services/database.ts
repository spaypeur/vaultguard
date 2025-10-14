import { supabase } from '@/config/database';
import { User, Portfolio, Asset, Threat, ComplianceRecord, RecoveryCase, RecoveryTransaction } from '@/types';
import { DbUser, DbPortfolio, DbAsset, DbThreat, DbComplianceRecord, DbRecoveryCase, DbRecoveryTransaction } from '@/types/database';
import { Logger } from '../utils/logger';

export class DatabaseService {
  private static logger = new Logger('DatabaseService');

  // User operations
  static async createUser(userData: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) throw error;
      return data as User;
    } catch (error) {
      DatabaseService.logger.error('Error creating user:', error);
      return null;
    }
  }

  static async getUserById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as User;
    } catch (error) {
      DatabaseService.logger.error('Error fetching user:', error);
      return null;
    }
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .limit(1);

      if (error) throw error;
      return data && data.length > 0 ? data[0] as User : null;
    } catch (error) {
      DatabaseService.logger.error('Error fetching user by email:', error);
      return null;
    }
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as User;
    } catch (error) {
      DatabaseService.logger.error('Error updating user:', error);
      return null;
    }
  }

  static async updateUserBalance(userId: string, amount: number): Promise<boolean> {
    try {
      DatabaseService.logger.info(`Updating balance for user ${userId} with amount ${amount}`);
      
      // Update user's balance in the database
      const { error } = await supabase
        .from('users')
        .update({ 
          balance: amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      
      // Log the balance update
      await DatabaseService.logAuditEvent(
        userId,
        'balance_updated',
        'user',
        userId,
        null,
        { amount }
      );
      
      return true;
    } catch (error) {
      DatabaseService.logger.error('Error updating user balance:', error);
      return false;
    }
  }

  // Portfolio operations
  static async createPortfolio(portfolioData: Partial<Portfolio>): Promise<Portfolio | null> {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .insert([portfolioData])
        .select()
        .single();

      if (error) throw error;
      return data as Portfolio;
    } catch (error) {
      DatabaseService.logger.error('Error creating portfolio:', error);
      return null;
    }
  }

  static async getPortfoliosByUserId(userId: string): Promise<Portfolio[]> {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Portfolio[];
    } catch (error) {
      DatabaseService.logger.error('Error fetching portfolios:', error);
      return [];
    }
  }

  static async getPortfolioById(id: string): Promise<Portfolio | null> {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Portfolio;
    } catch (error) {
      DatabaseService.logger.error('Error fetching portfolio:', error);
      return null;
    }
  }

  // Asset operations
  static async createAsset(assetData: Partial<Asset>): Promise<Asset | null> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .insert([assetData])
        .select()
        .single();

      if (error) throw error;
      return data as Asset;
    } catch (error) {
      DatabaseService.logger.error('Error creating asset:', error);
      return null;
    }
  }

  static async getAssetsByPortfolioId(portfolioId: string): Promise<Asset[]> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Asset[];
    } catch (error) {
      DatabaseService.logger.error('Error fetching assets:', error);
      return [];
    }
  }

  static async getAssetsByUserId(userId: string): Promise<Asset[]> {
    try {
      const portfolios = await this.getPortfoliosByUserId(userId);
      const portfolioIds = portfolios.map(p => p.id);

      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .in('portfolio_id', portfolioIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Asset[];
    } catch (error) {
      DatabaseService.logger.error('Error fetching assets for user:', error);
      return [];
    }
  }

  static async getAssetById(id: string): Promise<Asset | null> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Asset;
    } catch (error) {
      DatabaseService.logger.error('Error fetching asset:', error);
      return null;
    }
  }

  static async updateAsset(id: string, updates: Partial<Asset>): Promise<Asset | null> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Asset;
    } catch (error) {
      DatabaseService.logger.error('Error updating asset:', error);
      return null;
    }
  }

  static async updatePortfolio(portfolioId: string, updates: Partial<Portfolio>): Promise<Portfolio | null> {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .update(updates)
        .eq('id', portfolioId)
        .select()
        .single();

      if (error) throw error;
      return data as Portfolio;
    } catch (error) {
      DatabaseService.logger.error('Error updating portfolio:', error);
      return null;
    }
  }

  // Threat operations
  static async createThreat(threatData: Partial<Threat>): Promise<Threat | null> {
    try {
      const { data, error } = await supabase
        .from('threats')
        .insert([threatData])
        .select()
        .single();

      if (error) throw error;
      return data as Threat;
    } catch (error) {
      DatabaseService.logger.error('Error creating threat:', error);
      return null;
    }
  }

  static async getThreatsByUserId(userId: string, limit: number = 50): Promise<Threat[]> {
    try {
      const { data, error } = await supabase
        .from('threats')
        .select('*')
        .eq('user_id', userId)
        .order('detected_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Threat[];
    } catch (error) {
      DatabaseService.logger.error('Error fetching threats:', error);
      return [];
    }
  }

  static async getThreatById(id: string): Promise<Threat | null> {
    try {
      const { data, error } = await supabase
        .from('threats')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Threat;
    } catch (error) {
      DatabaseService.logger.error('Error fetching threat:', error);
      return null;
    }
  }

  static async updateThreatStatus(id: string, status: string, resolutionNotes?: string): Promise<boolean> {
    try {
      const updates: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'resolved') {
        updates.resolved_at = new Date().toISOString();
      }

      if (resolutionNotes) {
        updates.resolution_notes = resolutionNotes;
      }

      const { error } = await supabase
        .from('threats')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      DatabaseService.logger.error('Error updating threat status:', error);
      return false;
    }
  }

  // Compliance operations
  static async createComplianceRecord(recordData: Partial<ComplianceRecord>): Promise<ComplianceRecord | null> {
    try {
      const { data, error } = await supabase
        .from('compliance_records')
        .insert([recordData])
        .select()
        .single();

      if (error) throw error;
      return data as ComplianceRecord;
    } catch (error) {
      DatabaseService.logger.error('Error creating compliance record:', error);
      return null;
    }
  }

  static async getComplianceRecordsByUserId(userId: string): Promise<ComplianceRecord[]> {
    try {
      const { data, error } = await supabase
        .from('compliance_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ComplianceRecord[];
    } catch (error) {
      DatabaseService.logger.error('Error fetching compliance records:', error);
      return [];
    }
  }

  // Recovery Case operations
  static async createRecoveryCase(caseData: Partial<DbRecoveryCase>): Promise<RecoveryCase | null> {
    try {
      const { data, error } = await supabase
        .from('recovery_cases')
        .insert([{
          ...caseData,
          stolen_assets: JSON.stringify(caseData.stolen_assets),
          audit_log: JSON.stringify(caseData.audit_log),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return data as RecoveryCase;
    } catch (error) {
      DatabaseService.logger.error('Error creating recovery case:', error);
      return null;
    }
  }

  static async getRecoveryCaseById(id: string): Promise<RecoveryCase | null> {
    try {
      const { data, error } = await supabase
        .from('recovery_cases')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? { ...data, stolenAssets: JSON.parse(data.stolen_assets), auditLog: JSON.parse(data.audit_log) } as RecoveryCase : null;
    } catch (error) {
      DatabaseService.logger.error('Error fetching recovery case:', error);
      return null;
    }
  }

  static async updateRecoveryCase(id: string, updates: Partial<DbRecoveryCase>): Promise<RecoveryCase | null> {
    try {
      const processedUpdates: Partial<DbRecoveryCase> = { ...updates };
      if (updates.stolen_assets) {
        processedUpdates.stolen_assets = JSON.stringify(updates.stolen_assets);
      }
      if (updates.audit_log) {
        processedUpdates.audit_log = JSON.stringify(updates.audit_log);
      }
      processedUpdates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('recovery_cases')
        .update(processedUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data ? { ...data, stolenAssets: JSON.parse(data.stolen_assets), auditLog: JSON.parse(data.audit_log) } as RecoveryCase : null;
    } catch (error) {
      DatabaseService.logger.error('Error updating recovery case:', error);
      return null;
    }
  }

  // Recovery Transaction operations
  static async createRecoveryTransaction(transactionData: Partial<DbRecoveryTransaction>): Promise<RecoveryTransaction | null> {
    try {
      const { data, error } = await supabase
        .from('recovery_transactions')
        .insert([{
          ...transactionData,
          metadata: JSON.stringify(transactionData.metadata),
          transaction_date: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return data as RecoveryTransaction;
    } catch (error) {
      DatabaseService.logger.error('Error creating recovery transaction:', error);
      return null;
    }
  }

  static async getRecoveryTransactionById(id: string): Promise<RecoveryTransaction | null> {
    try {
      const { data, error } = await supabase
        .from('recovery_transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? { ...data, metadata: JSON.parse(data.metadata) } as RecoveryTransaction : null;
    } catch (error) {
      DatabaseService.logger.error('Error fetching recovery transaction:', error);
      return null;
    }
  }

  // Audit logging
  static async logAuditEvent(
    userId: string | null,
    action: string,
    resourceType: string,
    resourceId: string | null,
    oldValues?: any,
    newValues?: any,
    metadata?: any
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert([{
          user_id: userId,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          old_values: oldValues,
          new_values: newValues,
          metadata,
        }]);

      if (error) throw error;
      return true;
    } catch (error) {
      DatabaseService.logger.error('Error logging audit event:', error);
      return false;
    }
  }

  static async getAuditLogsByUserId(userId: string, limit: number = 100): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      DatabaseService.logger.error('Error fetching audit logs:', error);
      return [];
    }
  }

  /**
   * Get incident details by ID
   */
  static async getIncidentById(incidentId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .eq('id', incidentId)
        .single();

      if (error) throw error;
      return data ? {
        ...data,
        stolen_assets: JSON.parse(data.stolen_assets || '[]'),
        transaction_hashes: JSON.parse(data.transaction_hashes || '[]'),
        exchange_accounts: JSON.parse(data.exchange_accounts || '[]'),
        suspect_addresses: JSON.parse(data.suspect_addresses || '[]'),
        metadata: JSON.parse(data.metadata || '{}')
      } : null;
    } catch (error) {
      DatabaseService.logger.error('Error fetching incident:', error);
      return null;
    }
  }

  /**
   * Get recovery statistics
   */
  static async getRecoveryStatistics(): Promise<{
    total_cases: number;
    successful_recoveries: number;
    total_recovered: number;
    total_fees: number;
    average_recovery_time: number;
  }> {
    try {
      const { data: cases, error: casesError } = await supabase
        .from('recovery_cases')
        .select('*');

      if (casesError) throw casesError;

      const { data: transactions, error: txError } = await supabase
        .from('recovery_transactions')
        .select('*');

      if (txError) throw txError;

      // Calculate statistics
      const successfulCases = cases.filter((c: any) => c.status === 'COMPLETED');
      const totalRecovered = transactions.reduce((sum: number, tx: any) => sum + (tx.recovered_amount || 0), 0);
      const totalFees = transactions.reduce((sum: number, tx: any) => sum + (tx.fee_amount || 0), 0);
      
      // Calculate average recovery time in days
      const recoveryTimes = successfulCases
        .map((c: any) => {
          const start = new Date(c.created_at).getTime();
          const end = new Date(c.updated_at).getTime();
          return (end - start) / (1000 * 60 * 60 * 24); // Convert to days
        });

      const averageRecoveryTime = recoveryTimes.length > 0
        ? recoveryTimes.reduce((sum: number, time: number) => sum + time, 0) / recoveryTimes.length
        : 0;

      return {
        total_cases: cases.length,
        successful_recoveries: successfulCases.length,
        total_recovered: totalRecovered,
        total_fees: totalFees,
        average_recovery_time: Math.round(averageRecoveryTime)
      };
    } catch (error) {
      DatabaseService.logger.error('Error fetching recovery statistics:', error);
      return {
        total_cases: 0,
        successful_recoveries: 0,
        total_recovered: 0,
        total_fees: 0,
        average_recovery_time: 0
      };
    }
  }

  /**
   * Get user activity for a specific time period
   */
  static async getUserActivity(userId: string, hours: number = 24): Promise<{ type: string; timestamp: Date }[]> {
    try {
      const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data.map((activity: any) => ({
        type: activity.type,
        timestamp: new Date(activity.timestamp)
      }));
    } catch (error) {
      DatabaseService.logger.error('Error fetching user activity:', error);
      return [];
    }
  }

  /**
   * Get user network data
   */
  static async getUserNetworkData(userId: string): Promise<{
    ip_addresses: string[];
    locations: string[];
    userAgents: string[];
  }> {
    try {
      const { data, error } = await supabase
        .from('user_network_data')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return {
        ip_addresses: [...new Set(data.map((d: any) => d.ip_address))] as string[],
        locations: [...new Set(data.map((d: any) => d.location))] as string[],
        userAgents: [...new Set(data.map((d: any) => d.user_agent))] as string[]
      };
    } catch (error) {
      DatabaseService.logger.error('Error fetching user network data:', error);
      return {
        ip_addresses: [],
        locations: [],
        userAgents: []
      };
    }
  }

  /**
   * Get user wallets
   */
  static async getUserWallets(userId: string): Promise<{
    address: string;
    chain: string;
    label?: string;
  }[]> {
    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) throw error;
      return data.map((wallet: any) => ({
        address: wallet.address,
        chain: wallet.chain,
        label: wallet.label
      }));
    } catch (error) {
      DatabaseService.logger.error('Error fetching user wallets:', error);
      return [];
    }
  }

  /**
   * Get security events for a user
   */
  static async getSecurityEvents(userId: string, days: number = 7): Promise<{
    type: string;
    severity: string;
    timestamp: Date;
    details?: any;
  }[]> {
    try {
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data.map((event: any) => ({
        type: event.type,
        severity: event.severity,
        timestamp: new Date(event.timestamp),
        details: event.details ? JSON.parse(event.details) : undefined
      }));
    } catch (error) {
      DatabaseService.logger.error('Error fetching security events:', error);
      return [];
    }
  }

  /**
   * Get threat intelligence data
   */
  static async getThreatIntelligence(): Promise<{
    type: string;
    source: string;
    severity: string;
    indicators: string[];
    timestamp: Date;
  }[]> {
    try {
      const { data, error } = await supabase
        .from('threat_intelligence')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data.map((threat: any) => ({
        type: threat.type,
        source: threat.source,
        severity: threat.severity,
        indicators: Array.isArray(threat.indicators) ? threat.indicators : [],
        timestamp: new Date(threat.timestamp)
      }));
    } catch (error) {
      DatabaseService.logger.error('Error fetching threat intelligence:', error);
      return [];
    }
  }
}

export default DatabaseService;
