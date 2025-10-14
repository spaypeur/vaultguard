import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, User, UserStatus, UserRole } from '../types';
import { Logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const logger = new Logger('auth-middleware');

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check for token in authorization header first (primary method)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies as fallback
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    // Check for token in request body (legacy support)
    if (!token && (req as any).body?.accessToken) {
      token = (req as any).body.accessToken;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.',
      });
      return;
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      // Check if user is active
      if (decoded.status !== UserStatus.ACTIVE) {
        res.status(401).json({
          success: false,
          error: 'Account is not active.',
        });
        return;
      }

      // Attach user to request
      req.user = decoded as User;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'Invalid token.',
      });
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error.',
    });
  }
};

// Optional authentication middleware (for endpoints that work with or without auth)
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        if (decoded.status === UserStatus.ACTIVE) {
          req.user = decoded as User;
        }
      } catch (error) {
        // Token is invalid but we don't fail the request
        logger.warn('Invalid token in optional auth:', error);
      }
    }

    next();
  } catch (error) {
    logger.error('Optional auth middleware error:', error);
    next();
  }
};

// Role-based authorization middleware
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Access denied. Insufficient permissions.',
      });
      return;
    }

    next();
  };
};

export const authenticateToken = authMiddleware; // Export alias for backward compatibility

// Client access middleware (clients and family members can access their own data)
export const clientAccess = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required.',
    });
    return;
  }

  const allowedRoles = [UserRole.CLIENT, UserRole.FAMILY_MEMBER];

  if (!allowedRoles.includes(req.user.role)) {
    res.status(403).json({
      success: false,
      error: 'Access denied. Client access required.',
    });
    return;
  }

  next();
};
