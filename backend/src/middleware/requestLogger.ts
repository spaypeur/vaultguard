import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

const logger = new Logger('request-logger');

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Simple logging middleware - can be enhanced later
  if (process.env.NODE_ENV === 'development') {
    logger.info(`${req.method} ${req.originalUrl}`);
  }
  next();
};
