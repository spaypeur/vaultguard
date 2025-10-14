import { Response, NextFunction } from 'express';
import { authorize, authMiddleware } from './auth';
import { UserRole } from '../types';
import { Logger } from '../utils/logger';

const logger = new Logger('admin-middleware');

// Admin-only middleware
export const adminOnly = authorize(UserRole.ADMIN);

// Combined admin middleware (auth + admin role check)
export const adminMiddleware = [authMiddleware, adminOnly];

// Audit middleware for admin actions
export const auditAdminAction = (action: string) => {
  return (req: any, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const timestamp = new Date().toISOString();

    logger.info(`Admin action: ${action}`, {
      userId,
      action,
      path: req.path,
      method: req.method,
      ip: req.ip,
      timestamp
    });

    // Add audit logging here if needed
    // This could integrate with DatabaseService.logAuditEvent

    next();
  };
};

export default adminMiddleware;