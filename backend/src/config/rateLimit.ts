import { Options } from 'express-rate-limit';

export const rateLimitConfig: any = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: any) => {
    // Skip rate limiting for health checks and static assets
    return req.path === '/health' || req.path.startsWith('/assets/');
  },
  keyGenerator: (req: any) => {
    // Use X-Forwarded-For header if behind a proxy, otherwise use IP
    return req.headers['x-forwarded-for'] as string || req.ip || req.connection.remoteAddress || 'unknown';
  },
  handler: (req: any, res: any) => {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 1000),
    });
  },
};

export default rateLimitConfig;
