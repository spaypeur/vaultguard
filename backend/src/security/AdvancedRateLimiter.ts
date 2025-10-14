import rateLimit from 'express-rate-limit';
import Redis from 'ioredis';
import { Request, Response } from 'express';
import { config } from '../config/redis';

const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  tls: config.redis.tls ? {} : undefined
});

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  statusCode?: number;
  skipFailedRequests?: boolean;
  skipSuccessfulRequests?: boolean;
  burstMax?: number;          // Maximum requests allowed in burst
  burstTime?: number;         // Time window for burst in ms
  adaptiveScore?: boolean;    // Enable adaptive rate limiting based on client behavior
  penaltyBoxTime?: number;    // Time in penalty box for repeated violations
}

interface RateLimitInfo {
  limit: number;
  current: number;
  remaining: number;
  reset: number;
}

class AdvancedRateLimiter {
  private static instance: AdvancedRateLimiter;
  private baseConfig: RateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.',
    statusCode: 429,
    burstMax: 150, // Allow 150 requests in burst
    burstTime: 60 * 1000, // 1 minute burst window
    adaptiveScore: true, // Enable adaptive rate limiting
    penaltyBoxTime: 30 * 60 * 1000, // 30 minutes in penalty box
  };

  private constructor() {}

  static getInstance(): AdvancedRateLimiter {
    if (!AdvancedRateLimiter.instance) {
      AdvancedRateLimiter.instance = new AdvancedRateLimiter();
    }
    return AdvancedRateLimiter.instance;
  }

  /**
   * Create a rate limiter with Redis store
   */
  createLimiter(config: Partial<RateLimitConfig> = {}) {
    const finalConfig = { ...this.baseConfig, ...config };

    return rateLimit({
      ...finalConfig,
      store: {
        incr: async (key: string): Promise<number> => {
          const current = await redis.incr(key);
          if (current === 1) {
            await redis.pexpire(key, finalConfig.windowMs);
          }
          return current;
        },
        decrement: (key: string): Promise<void> => {
          return redis.decr(key).then(() => {});
        },
        resetKey: (key: string): Promise<void> => {
          return redis.del(key).then(() => {});
        },
      },
      keyGenerator: (req: Request): string => {
        // Generate a unique key based on multiple factors
        const factors = [
          req.ip,
          req.headers['user-agent'] || 'unknown',
          req.headers['x-forwarded-for'] || '',
          req.headers['x-real-ip'] || '',
        ];
        return `rate-limit:${factors.join(':')}`;
      },
      handler: (req: Request, res: Response): void => {
        const retryAfter = Math.ceil(finalConfig.windowMs / 1000);
        res.set('Retry-After', String(retryAfter));
        res.status(finalConfig.statusCode || 429).json({
          error: 'Too Many Requests',
          message: finalConfig.message,
          retryAfter,
        });
      },
      skip: (req: Request): boolean => {
        // Whitelist certain IPs or user agents
        const whitelist = process.env.RATE_LIMIT_WHITELIST?.split(',') || [];
        const clientIp = req.ip || '';
        return whitelist.includes(clientIp);
      },
    });
  }

  /**
   * Create a strict rate limiter for sensitive endpoints
   */
  createStrictLimiter(windowMs = 60 * 1000, max = 5) {
    return this.createLimiter({
      windowMs,
      max,
      message: 'Rate limit exceeded for sensitive operation',
      skipFailedRequests: false, // Count failed requests
      skipSuccessfulRequests: false, // Count successful requests
    });
  }

  /**
   * Create a dynamic rate limiter based on user tier
   */
  createTieredLimiter(req: Request): RateLimitConfig {
    const userTier = req.user?.tier || 'free';
    const tierLimits = {
      free: 100,
      premium: 500,
      enterprise: 1000,
    };

    return {
      windowMs: 15 * 60 * 1000,
      max: tierLimits[userTier as keyof typeof tierLimits],
      message: `Rate limit exceeded for ${userTier} tier`,
    };
  }

  /**
   * Get current rate limit info for a request
   */
  async getRateLimitInfo(req: Request): Promise<RateLimitInfo> {
    const key = `rate-limit:${req.ip}`;
    const current = await redis.get(key);
    const ttl = await redis.pttl(key);

    return {
      limit: this.baseConfig.max,
      current: current ? parseInt(current) : 0,
      remaining: Math.max(0, this.baseConfig.max - (current ? parseInt(current) : 0)),
      reset: Date.now() + ttl,
    };
  }

  /**
   * Clear rate limit for a specific key
   */
  async clearRateLimit(key: string): Promise<void> {
    await redis.del(`rate-limit:${key}`);
  }

  /**
   * Monitor rate limit violations
   */
  async monitorViolations(req: Request): Promise<void> {
    const key = `rate-limit-violations:${req.ip}`;
    const violations = await redis.incr(key);

    if (violations >= 10) {
      // Add IP to blacklist
      await redis.sadd('rate-limit-blacklist', req.ip);
      await redis.expire(key, 24 * 60 * 60); // 24 hours
    }
  }

  /**
   * Check if an IP is blacklisted
   */
  async isBlacklisted(ip: string): Promise<boolean> {
    return await redis.sismember('rate-limit-blacklist', ip) === 1;
  }
}

export default AdvancedRateLimiter;