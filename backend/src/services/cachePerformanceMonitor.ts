import { Redis } from 'ioredis';
import { EventEmitter } from 'events';

interface PerformanceMetrics {
  cacheHits: number;
  cacheMisses: number;
  queryLatency: number[];
  errorCount: number;
  operationsPerSecond: number;
  memoryUsage: number;
  clientCount: number;
}

export default class CachePerformanceMonitor {
  private static instance: CachePerformanceMonitor;
  private metrics: PerformanceMetrics;
  private events: EventEmitter;
  private metricsInterval: NodeJS.Timeout | null = null;

  private constructor(private redis: Redis) {
    this.events = new EventEmitter();
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      queryLatency: [],
      errorCount: 0,
      operationsPerSecond: 0,
      memoryUsage: 0,
      clientCount: 0
    };
    this.startMonitoring();
  }

  static getInstance(redis: Redis): CachePerformanceMonitor {
    if (!CachePerformanceMonitor.instance) {
      CachePerformanceMonitor.instance = new CachePerformanceMonitor(redis);
    }
    return CachePerformanceMonitor.instance;
  }

  private async startMonitoring(): Promise<void> {
    // Collect metrics every 5 seconds
    this.metricsInterval = setInterval(async () => {
      await this.collectMetrics();
    }, 5000);

    // Monitor Redis events
    this.redis.on('error', () => {
      this.metrics.errorCount++;
    });
  }

  private async collectMetrics(): Promise<void> {
    try {
      // Get Redis INFO
      const info = await this.redis.info();
      
      // Parse memory usage
      const memMatch = info.match(/used_memory:(\d+)/);
      if (memMatch) {
        this.metrics.memoryUsage = parseInt(memMatch[1], 10);
      }

      // Parse client count
      const clientMatch = info.match(/connected_clients:(\d+)/);
      if (clientMatch) {
        this.metrics.clientCount = parseInt(clientMatch[1], 10);
      }

      // Parse operations per second
      const opsMatch = info.match(/instantaneous_ops_per_sec:(\d+)/);
      if (opsMatch) {
        this.metrics.operationsPerSecond = parseInt(opsMatch[1], 10);
      }

      // Calculate hit rate
      const hitRate = this.metrics.cacheHits / 
        (this.metrics.cacheHits + this.metrics.cacheMisses || 1);

      // Calculate average latency
      const avgLatency = this.metrics.queryLatency.length > 0
        ? this.metrics.queryLatency.reduce((a, b) => a + b, 0) / this.metrics.queryLatency.length
        : 0;

      // Emit metrics event
      this.events.emit('metrics', {
        ...this.metrics,
        hitRate,
        avgLatency
      });

      // Reset rolling metrics
      this.metrics.queryLatency = [];
      this.metrics.errorCount = 0;

    } catch (error) {
      console.error('Error collecting metrics:', error);
    }
  }

  recordHit(): void {
    this.metrics.cacheHits++;
  }

  recordMiss(): void {
    this.metrics.cacheMisses++;
  }

  recordLatency(milliseconds: number): void {
    this.metrics.queryLatency.push(milliseconds);
  }

  onMetrics(callback: (metrics: any) => void): void {
    this.events.on('metrics', callback);
  }

  async getMemoryAnalysis(): Promise<{
    totalKeys: number;
    keySize: { [key: string]: number };
    expiring: number;
    persistent: number;
  }> {
    const keys = await this.redis.keys('*');
    const analysis = {
      totalKeys: keys.length,
      keySize: {} as { [key: string]: number },
      expiring: 0,
      persistent: 0
    };

    for (const key of keys) {
      const ttl = await this.redis.ttl(key);
      const size = await this.redis.memory('USAGE', key);
      
      analysis.keySize[key] = size;
      if (ttl > 0) {
        analysis.expiring++;
      } else {
        analysis.persistent++;
      }
    }

    return analysis;
  }

  async getSlowQueries(): Promise<any[]> {
    const slowlog = await this.redis.slowlog('GET', 10);
    return slowlog as any[];
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  stop(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
    this.events.removeAllListeners();
  }
}