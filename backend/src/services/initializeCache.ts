import { supabase } from '../config/supabase';
import { redisClient } from '../config/redisClient';
import SupabaseRedisIntegration from './supabaseRedisIntegration';

// Table configurations with cache settings
const tableConfigs = [
  {
    name: 'users',
    cacheTTL: 3600, // 1 hour
    invalidationEvents: ['UPDATE', 'DELETE']
  },
  {
    name: 'transactions',
    cacheTTL: 300, // 5 minutes
    invalidationEvents: ['INSERT', 'UPDATE']
  },
  {
    name: 'security_logs',
    cacheTTL: 1800, // 30 minutes
    invalidationEvents: ['INSERT']
  },
  {
    name: 'api_keys',
    cacheTTL: 900, // 15 minutes
    invalidationEvents: ['UPDATE', 'DELETE']
  },
  {
    name: 'compliance_records',
    cacheTTL: 7200, // 2 hours
    invalidationEvents: ['INSERT', 'UPDATE']
  }
];

export async function initializeSupabaseRedis(): Promise<SupabaseRedisIntegration> {
  const integration = SupabaseRedisIntegration.getInstance(
    supabase,
    redisClient,
    {
      ttl: 3600,
      prefix: 'vg:cache:'
    }
  );

  // Configure caching for each table
  tableConfigs.forEach(config => {
    integration.configureTable(config);
  });

  // Set up error monitoring
  integration.onInvalidation('error_logs', async (data) => {
    console.error('Cache invalidation error:', data);
    // Additional error handling logic
  });

  // Schedule regular backups
  scheduleBackups(integration);

  return integration;
}

function scheduleBackups(integration: SupabaseRedisIntegration): void {
  // Backup every 6 hours
  setInterval(async () => {
    try {
      await integration.backupCache();
      console.log('Cache backup completed successfully');
    } catch (error) {
      console.error('Cache backup failed:', error);
    }
  }, 6 * 60 * 60 * 1000);

  // Initial backup
  integration.backupCache().catch(console.error);
}

export async function setupCacheTables(): Promise<void> {
  // Create required tables if they don't exist
  const { error: backupError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS cache_backups (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        timestamp TIMESTAMPTZ NOT NULL,
        data JSONB NOT NULL
      );
    `
  });

  const { error: metricsError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS cache_metrics (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        timestamp TIMESTAMPTZ NOT NULL,
        hits INTEGER NOT NULL,
        misses INTEGER NOT NULL,
        hit_rate FLOAT NOT NULL
      );
    `
  });

  if (backupError || metricsError) {
    throw new Error('Failed to create cache tables');
  }
}

// Usage example:
// async function main() {
//   await setupCacheTables();
//   const integration = await initializeSupabaseRedis();
//
//   // Example: Get user with caching
//   const user = await integration.get('users', 'user_id');
//
//   // Example: Get list of transactions with caching
//   const transactions = await integration.list('transactions');
//
//   // Example: Manual cache invalidation
//   await integration.invalidateCache('users', 'user_id');
// }