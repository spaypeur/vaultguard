import { Redis } from 'ioredis';
import { EventEmitter } from 'events';

interface PoolConfig {
  min: number;
  max: number;
  acquireTimeout?: number;
  idleTimeout?: number;
}

interface PooledConnection {
  client: Redis;
  lastUsed: number;
  inUse: boolean;
}

export default class RedisConnectionPool {
  private static instance: RedisConnectionPool;
  private pool: PooledConnection[] = [];
  private waiting: ((client: Redis) => void)[] = [];
  private events: EventEmitter;

  private constructor(
    private config: Required<PoolConfig>,
    private redisConfig: any
  ) {
    this.events = new EventEmitter();
    this.initialize();
  }

  static getInstance(config: PoolConfig, redisConfig: any): RedisConnectionPool {
    if (!RedisConnectionPool.instance) {
      const fullConfig: Required<PoolConfig> = {
        min: config.min,
        max: config.max,
        acquireTimeout: config.acquireTimeout || 30000,
        idleTimeout: config.idleTimeout || 60000
      };
      RedisConnectionPool.instance = new RedisConnectionPool(fullConfig, redisConfig);
    }
    return RedisConnectionPool.instance;
  }

  private async initialize(): Promise<void> {
    // Create minimum connections
    for (let i = 0; i < this.config.min; i++) {
      await this.createConnection();
    }

    // Start maintenance interval
    setInterval(() => this.maintenance(), 30000);
  }

  private async createConnection(): Promise<PooledConnection> {
    const client = new Redis(this.redisConfig);
    
    client.on('error', (error) => {
      this.events.emit('error', error);
    });

    const connection: PooledConnection = {
      client,
      lastUsed: Date.now(),
      inUse: false
    };

    this.pool.push(connection);
    return connection;
  }

  async acquire(): Promise<Redis> {
    // Find available connection
    const available = this.pool.find(conn => !conn.inUse);
    
    if (available) {
      available.inUse = true;
      available.lastUsed = Date.now();
      return available.client;
    }

    // Create new connection if possible
    if (this.pool.length < this.config.max) {
      const connection = await this.createConnection();
      connection.inUse = true;
      return connection.client;
    }

    // Wait for available connection
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.waiting = this.waiting.filter(cb => cb !== callback);
        reject(new Error('Connection acquisition timeout'));
      }, this.config.acquireTimeout);

      const callback = (client: Redis) => {
        clearTimeout(timeout);
        resolve(client);
      };

      this.waiting.push(callback);
    });
  }

  release(client: Redis): void {
    const connection = this.pool.find(conn => conn.client === client);
    if (connection) {
      connection.inUse = false;
      connection.lastUsed = Date.now();

      // Check waiting queue
      if (this.waiting.length > 0) {
        const next = this.waiting.shift();
        if (next) {
          connection.inUse = true;
          next(client);
        }
      }
    }
  }

  private async maintenance(): Promise<void> {
    const now = Date.now();

    // Remove idle connections above minimum
    const idleConnections = this.pool
      .filter(conn => !conn.inUse && now - conn.lastUsed > this.config.idleTimeout)
      .slice(this.config.min);

    for (const conn of idleConnections) {
      await conn.client.quit();
      this.pool = this.pool.filter(c => c !== conn);
    }

    // Check health of remaining connections
    for (const conn of this.pool) {
      try {
        await conn.client.ping();
      } catch (error) {
        this.events.emit('error', error);
        // Replace failed connection
        await conn.client.quit();
        this.pool = this.pool.filter(c => c !== conn);
        await this.createConnection();
      }
    }
  }

  async cleanup(): Promise<void> {
    // Close all connections
    await Promise.all(
      this.pool.map(async conn => {
        try {
          await conn.client.quit();
        } catch (error) {
          this.events.emit('error', error);
        }
      })
    );
    this.pool = [];
  }

  onError(callback: (error: Error) => void): void {
    this.events.on('error', callback);
  }

  getStats(): {
    total: number;
    active: number;
    idle: number;
    waiting: number;
  } {
    const active = this.pool.filter(conn => conn.inUse).length;
    return {
      total: this.pool.length,
      active,
      idle: this.pool.length - active,
      waiting: this.waiting.length
    };
  }
}