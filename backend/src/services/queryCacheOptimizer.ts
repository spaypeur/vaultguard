import { Redis } from 'ioredis';
import { createHash } from 'crypto';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

interface QueryCacheOptions {
  ttl?: number;
  prefix?: string;
  ignoreParams?: string[];
}

export default class QueryCacheOptimizer {
  private static instance: QueryCacheOptimizer;
  
  constructor(private redis: Redis) {}

  static getInstance(redis: Redis): QueryCacheOptimizer {
    if (!QueryCacheOptimizer.instance) {
      QueryCacheOptimizer.instance = new QueryCacheOptimizer(redis);
    }
    return QueryCacheOptimizer.instance;
  }

  /**
   * Generate cache key for a query
   */
  private generateQueryKey(
    table: string,
    queryParams: any,
    options: QueryCacheOptions = {}
  ): string {
    const { prefix = 'query:', ignoreParams = [] } = options;
    
    // Filter out ignored parameters
    const filteredParams = { ...queryParams };
    ignoreParams.forEach(param => delete filteredParams[param]);
    
    // Create consistent string representation
    const paramsString = JSON.stringify(filteredParams, Object.keys(filteredParams).sort());
    
    // Generate hash
    const hash = createHash('sha256')
      .update(`${table}:${paramsString}`)
      .digest('hex');
    
    return `${prefix}${table}:${hash}`;
  }

  /**
   * Cache query results with TTL
   */
  async cacheQueryResults(
    key: string,
    data: any,
    options: QueryCacheOptions = {}
  ): Promise<void> {
    const { ttl = 3600 } = options;
    await this.redis.setex(key, ttl, JSON.stringify(data));
  }

  /**
   * Wrap Supabase query with caching
   */
  async wrapWithCache<T>(
    query: any,
    table: string,
    queryParams: any,
    options: QueryCacheOptions = {}
  ): Promise<T> {
    const cacheKey = this.generateQueryKey(table, queryParams, options);
    
    // Try to get from cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Execute query if not cached
    const { data, error } = await query;
    if (error) throw error;

    // Cache results
    await this.cacheQueryResults(cacheKey, data, options);
    
    return data;
  }

  /**
   * Batch load multiple queries
   */
  async batchLoad<T>(
    queries: Array<{
      query: any;
      table: string;
      params: any;
      options?: QueryCacheOptions;
    }>
  ): Promise<T[]> {
    const results = await Promise.all(
      queries.map(({ query, table, params, options }) =>
        this.wrapWithCache<T>(query, table, params, options)
      )
    );
    
    return results;
  }

  /**
   * Invalidate queries by pattern
   */
  async invalidateByPattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(`query:${pattern}*`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  /**
   * Prefetch queries likely to be needed soon
   */
  async prefetchQueries(
    queries: Array<{
      query: any;
      table: string;
      params: any;
      options?: QueryCacheOptions;
    }>
  ): Promise<void> {
    // Execute in parallel but don't wait for results
    queries.forEach(({ query, table, params, options }) => {
      this.wrapWithCache(query, table, params, {
        ...options,
        ttl: options?.ttl || 300 // Short TTL for prefetched data
      }).catch(console.error); // Ignore errors for prefetch
    });
  }

  /**
   * Warm up cache with frequently used queries
   */
  async warmupCache(
    queries: Array<{
      query: any;
      table: string;
      params: any;
      options?: QueryCacheOptions;
    }>
  ): Promise<void> {
    await Promise.all(
      queries.map(({ query, table, params, options }) =>
        this.wrapWithCache(query, table, params, options)
      )
    );
  }
}