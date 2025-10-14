import { SupabaseClient } from '@supabase/supabase-js';
import { Redis } from 'ioredis';
import { EventEmitter } from 'events';
import RedisConnectionPool from './redisConnectionPool';
import CachePerformanceMonitor from './cachePerformanceMonitor';
import QueryCacheOptimizer from './queryCacheOptimizer';

interface CacheConfig {
  ttl: number;
  prefix: string;
}

interface TableConfig {
  name: string;
  cacheTTL: number;
  invalidationEvents: string[];
}

class SupabaseRedisIntegration {
  private static instance: SupabaseRedisIntegration;
  private eventEmitter: EventEmitter;
  private tableConfigs: Map<string, TableConfig>;
  private subscriptions: Map<string, () => void>;

  private readonly defaultConfig: CacheConfig = {
    ttl: 3600, // 1 hour default TTL
    prefix: 'vg:cache:'
  };

  private connectionPool: RedisConnectionPool;
  private performanceMonitor: CachePerformanceMonitor;
  private queryCacheOptimizer: QueryCacheOptimizer;

  private constructor(
    private supabase: SupabaseClient,
    private redis: Redis,
    private config: CacheConfig = {} as CacheConfig
  ) {
    this.config = { ...this.defaultConfig, ...config };
    this.eventEmitter = new EventEmitter();
    this.tableConfigs = new Map();
    this.subscriptions = new Map();
    
    // Initialize optimizations
    this.connectionPool = RedisConnectionPool.getInstance({
      min: 5,
      max: 20,
      acquireTimeout: 30000,
      idleTimeout: 60000
    }, {
      host: redis.options.host,
      port: redis.options.port,
      password: redis.options.password,
      tls: redis.options.tls
    });
    
    this.performanceMonitor = CachePerformanceMonitor.getInstance(redis);
    this.queryCacheOptimizer = QueryCacheOptimizer.getInstance(redis);
    
    this.setupErrorHandling();
  }

  static getInstance(
    supabase: SupabaseClient,
    redis: Redis,
    config?: CacheConfig
  ): SupabaseRedisIntegration {
    if (!SupabaseRedisIntegration.instance) {
      SupabaseRedisIntegration.instance = new SupabaseRedisIntegration(
        supabase,
        redis,
        config
      );
    }
    return SupabaseRedisIntegration.instance;
  }

  /**
   * Configure caching for a specific table
   */
  configureTable(config: TableConfig): void {
    this.tableConfigs.set(config.name, {
      ...config,
      cacheTTL: config.cacheTTL || this.config.ttl
    });

    // Set up real-time subscription for this table
    this.setupTableSubscription(config.name);
  }

  /**
   * Set up real-time subscription for a table
   */
  private setupTableSubscription(tableName: string): void {
    const subscription = this.supabase
      .channel(`${tableName}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName
        },
        async (payload) => {
          await this.handleDatabaseChange(tableName, payload);
        }
      )
      .subscribe();

    // Store subscription cleanup function
    this.subscriptions.set(tableName, () => subscription.unsubscribe());
  }

  /**
   * Handle database changes and invalidate cache
   */
  private async handleDatabaseChange(
    tableName: string,
    payload: any
  ): Promise<void> {
    const config = this.tableConfigs.get(tableName);
    if (!config) return;

    const cacheKey = this.buildCacheKey(tableName, payload.new?.id);
    
    switch (payload.eventType) {
      case 'INSERT':
        await this.invalidateListCache(tableName);
        await this.setCache(cacheKey, payload.new, config.cacheTTL);
        break;
      
      case 'UPDATE':
        await this.setCache(cacheKey, payload.new, config.cacheTTL);
        await this.invalidateListCache(tableName);
        break;
      
      case 'DELETE':
        await this.redis.del(cacheKey);
        await this.invalidateListCache(tableName);
        break;
    }

    // Emit events for external handlers
    this.eventEmitter.emit(`${tableName}:changed`, {
      type: payload.eventType,
      data: payload.new || payload.old
    });
  }

  /**
   * Build cache key for a table and id
   */
  private buildCacheKey(tableName: string, id?: string): string {
    return id
      ? `${this.config.prefix}${tableName}:${id}`
      : `${this.config.prefix}${tableName}:list`;
  }

  /**
   * Get data with caching
   */
  async get<T>(
    tableName: string,
    id: string,
    fetchFn?: () => Promise<T>
  ): Promise<T | null> {
    const cacheKey = this.buildCacheKey(tableName, id);
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // If no custom fetch function provided, use default Supabase query
    const data = await (fetchFn?.() ??
      this.supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data }) => data));

    if (data) {
      const config = this.tableConfigs.get(tableName);
      await this.setCache(cacheKey, data, config?.cacheTTL);
    }

    return data;
  }

  /**
   * Get list of items with caching
   */
  async list<T>(
    tableName: string,
    query?: any,
    fetchFn?: () => Promise<T[]>
  ): Promise<T[]> {
    const cacheKey = this.buildCacheKey(tableName);
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // If no custom fetch function provided, use default Supabase query
    const data = await (fetchFn?.() ??
      this.supabase
        .from(tableName)
        .select('*')
        .then(({ data }) => data));

    if (data) {
      const config = this.tableConfigs.get(tableName);
      await this.setCache(cacheKey, data, config?.cacheTTL);
    }

    return data || [];
  }

  /**
   * Set cache with TTL
   */
  private async setCache(
    key: string,
    data: any,
    ttl: number = this.config.ttl
  ): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(data));
  }

  /**
   * Invalidate list cache for a table
   */
  private async invalidateListCache(tableName: string): Promise<void> {
    const listCacheKey = this.buildCacheKey(tableName);
    await this.redis.del(listCacheKey);
  }

  /**
   * Subscribe to cache invalidation events
   */
  onInvalidation(tableName: string, callback: (data: any) => void): void {
    this.eventEmitter.on(`${tableName}:changed`, callback);
  }

  /**
   * Manual cache invalidation
   */
  async invalidateCache(tableName: string, id?: string): Promise<void> {
    if (id) {
      const cacheKey = this.buildCacheKey(tableName, id);
      await this.redis.del(cacheKey);
    }
    await this.invalidateListCache(tableName);
  }

  /**
   * Backup cache to persistent storage
   */
  async backupCache(): Promise<void> {
    const timestamp = new Date().toISOString();
    const backup: Record<string, any> = {};
    
    // Get all keys with our prefix
    const keys = await this.redis.keys(`${this.config.prefix}*`);
    
    // Get all values
    for (const key of keys) {
      const value = await this.redis.get(key);
      if (value) {
        backup[key] = JSON.parse(value);
      }
    }

    // Store backup in Supabase
    await this.supabase
      .from('cache_backups')
      .insert({
        timestamp,
        data: backup
      });
  }

  /**
   * Restore cache from backup
   */
  async restoreCache(timestamp?: string): Promise<void> {
    const { data: backup } = await this.supabase
      .from('cache_backups')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (backup?.data) {
      await Promise.all(
        Object.entries(backup.data).map(([key, value]) =>
          this.redis.set(key, JSON.stringify(value))
        )
      );
    }
  }

  /**
   * Setup error handling and monitoring
   */
  private setupErrorHandling(): void {
    this.redis.on('error', async (error) => {
      console.error('Redis error:', error);
      // Log error to Supabase
      await this.supabase
        .from('error_logs')
        .insert({
          service: 'redis',
          error: error.message,
          timestamp: new Date().toISOString()
        });
    });

    // Monitor cache hit/miss rates
    this.redis.on('ready', () => {
      setInterval(async () => {
        const stats = await this.getCacheStats();
        await this.supabase
          .from('cache_metrics')
          .insert({
            ...stats,
            timestamp: new Date().toISOString()
          });
      }, 300000); // Every 5 minutes
    });
  }

  /**
   * Get cache statistics
   */
  private async getCacheStats(): Promise<{
    hits: number;
    misses: number;
    hitRate: number;
  }> {
    const info = await this.redis.info();
    const hits = parseInt(info.match(/keyspace_hits:(\d+)/)?.[1] || '0');
    const misses = parseInt(info.match(/keyspace_misses:(\d+)/)?.[1] || '0');
    const hitRate = hits / (hits + misses || 1);

    return { hits, misses, hitRate };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    // Unsubscribe from all real-time subscriptions
    for (const [tableName, unsubscribe] of this.subscriptions.entries()) {
      unsubscribe();
      this.subscriptions.delete(tableName);
    }

    // Clear event listeners
    this.eventEmitter.removeAllListeners();

    // Backup cache before cleanup
    await this.backupCache();
  }
}

export default SupabaseRedisIntegration;