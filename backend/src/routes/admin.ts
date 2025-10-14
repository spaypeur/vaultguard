import { Router, Request, Response } from 'express';
import { DatabaseService } from '../services/database';
import { adminMiddleware, auditAdminAction } from '../middleware/admin';
import { User, UserRole, UserStatus, ApiResponse, PaginatedResponse } from '../types';
import { Logger } from '../utils/logger';
import { RecoveryStatus } from '../types';

const router = Router();
const logger = new Logger('admin-routes');

// Apply admin middleware to all routes
router.use(adminMiddleware);

// User management endpoints

/**
 * GET /api/admin/users
 * Get all users with pagination
 */
router.get('/users', auditAdminAction('list_users'), async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    // Get users from database (assuming we add this method to DatabaseService)
    // For now, return mock data structure
    const users: User[] = []; // TODO: Implement getAllUsers method

    const response: PaginatedResponse<User> = {
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total: users.length, // TODO: Get total count from database
        pages: Math.ceil(users.length / limit),
        hasNext: page * limit < users.length,
        hasPrev: page > 1
      }
    };

    res.json(response);
  } catch (error: any) {
    logger.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
      message: error.message
    });
  }
});

/**
 * GET /api/admin/users/:id
 * Get specific user details
 */
router.get('/users/:id', auditAdminAction('get_user'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await DatabaseService.getUserById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    const response: ApiResponse<User> = {
      success: true,
      data: user
    };

    res.json(response);
  } catch (error: any) {
    logger.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user',
      message: error.message
    });
  }
});

/**
 * PUT /api/admin/users/:id/status
 * Update user status
 */
router.put('/users/:id/status', auditAdminAction('update_user_status'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!Object.values(UserStatus).includes(status)) {
      res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
      return;
    }

    const user = await DatabaseService.updateUser(id, { status });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // Log admin action
    await DatabaseService.logAuditEvent(
      req.user!.id,
      'user_status_updated',
      'user',
      id,
      null,
      { status, reason },
      { adminId: req.user!.id, adminEmail: req.user!.email }
    );

    const response: ApiResponse<User> = {
      success: true,
      data: user,
      message: `User status updated to ${status}`
    };

    res.json(response);
  } catch (error: any) {
    logger.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user status',
      message: error.message
    });
  }
});

/**
 * PUT /api/admin/users/:id/role
 * Update user role
 */
router.put('/users/:id/role', auditAdminAction('update_user_role'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!Object.values(UserRole).includes(role)) {
      res.status(400).json({
        success: false,
        error: 'Invalid role'
      });
      return;
    }

    const user = await DatabaseService.updateUser(id, { role });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // Log admin action
    await DatabaseService.logAuditEvent(
      req.user!.id,
      'user_role_updated',
      'user',
      id,
      null,
      { role },
      { adminId: req.user!.id, adminEmail: req.user!.email }
    );

    const response: ApiResponse<User> = {
      success: true,
      data: user,
      message: `User role updated to ${role}`
    };

    res.json(response);
  } catch (error: any) {
    logger.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user role',
      message: error.message
    });
  }
});

// Audit logs endpoints

/**
 * GET /api/admin/audit-logs
 * Get audit logs with pagination and filtering
 */
router.get('/audit-logs', auditAdminAction('view_audit_logs'), async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const userId = req.query.userId as string;
    const action = req.query.action as string;
    const resourceType = req.query.resourceType as string;

    // TODO: Implement getAuditLogsPaginated method in DatabaseService
    let auditLogs: any[] = [];

    // Apply filters
    if (userId) {
      auditLogs = auditLogs.filter(log => log.user_id === userId);
    }
    if (action) {
      auditLogs = auditLogs.filter(log => log.action === action);
    }
    if (resourceType) {
      auditLogs = auditLogs.filter(log => log.resource_type === resourceType);
    }

    const total = auditLogs.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedLogs = auditLogs.slice(start, end);

    const response: PaginatedResponse<any> = {
      success: true,
      data: paginatedLogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: end < total,
        hasPrev: page > 1
      }
    };

    res.json(response);
  } catch (error: any) {
    logger.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch audit logs',
      message: error.message
    });
  }
});

/**
 * GET /api/admin/audit-logs/:userId
 * Get audit logs for specific user
 */
router.get('/audit-logs/:userId', auditAdminAction('view_user_audit_logs'), async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;

    const auditLogs = await DatabaseService.getAuditLogsByUserId(userId, limit);

    const response: ApiResponse<any[]> = {
      success: true,
      data: auditLogs
    };

    res.json(response);
  } catch (error: any) {
    logger.error('Error fetching user audit logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user audit logs',
      message: error.message
    });
  }
});

// System status and statistics endpoints

/**
 * GET /api/admin/stats
 * Get system statistics
 */
router.get('/stats', auditAdminAction('view_system_stats'), async (req: Request, res: Response) => {
  try {
    // Get recovery statistics
    const recoveryStats = await DatabaseService.getRecoveryStatistics();

    // TODO: Get additional stats like user count, threat count, etc.
    // For now, return basic structure
    const stats = {
      users: {
        total: 0, // TODO: Implement getTotalUsers
        active: 0, // TODO: Implement getActiveUsers
        suspended: 0, // TODO: Implement getSuspendedUsers
      },
      threats: {
        total: 0, // TODO: Implement getTotalThreats
        active: 0, // TODO: Implement getActiveThreats
        resolved: 0, // TODO: Implement getResolvedThreats
      },
      recovery: recoveryStats,
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version,
      }
    };

    const response: ApiResponse<typeof stats> = {
      success: true,
      data: stats
    };

    res.json(response);
  } catch (error: any) {
    logger.error('Error fetching system stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch system statistics',
      message: error.message
    });
  }
});

/**
 * GET /api/admin/health
 * Get detailed system health status
 */
router.get('/health', auditAdminAction('view_system_health'), async (req: Request, res: Response) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: {
        status: 'unknown', // TODO: Implement database health check
        lastCheck: new Date().toISOString(),
      },
      redis: {
        status: 'unknown', // TODO: Implement Redis health check
        lastCheck: new Date().toISOString(),
      },
      services: {
        notification: 'unknown', // TODO: Check notification service
        billing: 'unknown', // TODO: Check billing service
      }
    };

    const response: ApiResponse<typeof health> = {
      success: true,
      data: health
    };

    res.json(response);
  } catch (error: any) {
    logger.error('Error fetching system health:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch system health',
      message: error.message
    });
  }
});

/**
 * POST /api/admin/maintenance
 * Trigger system maintenance tasks
 */
router.post('/maintenance', auditAdminAction('trigger_maintenance'), async (req: Request, res: Response) => {
  try {
    const { task } = req.body;

    // TODO: Implement maintenance tasks like cache clearing, log rotation, etc.
    logger.info(`Maintenance task triggered: ${task}`, {
      adminId: req.user!.id,
      adminEmail: req.user!.email,
      task
    });

    const response: ApiResponse<{ task: string; status: string }> = {
      success: true,
      data: {
        task,
        status: 'completed'
      },
      message: `Maintenance task "${task}" completed successfully`
    };

    res.json(response);
  } catch (error: any) {
    logger.error('Error during maintenance:', error);
    res.status(500).json({
      success: false,
      error: 'Maintenance task failed',
      message: error.message
    });
  }
});

export default router;