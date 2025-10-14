import { Logger } from '../../utils/logger';
import DatabaseService from '../database';
import { ApiResponseHelper, ErrorHandler } from '../../utils/apiResponse';
import { Response } from 'express';

// Base service class to eliminate duplicate CRUD patterns across services
export abstract class BaseService<T> {
  protected logger: Logger;
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.logger = new Logger(`${tableName}-service`);
  }

  // Replace duplicate CRUD operations across all services
  async findById(id: string): Promise<T | null> {
    try {
      // This would be implemented by subclasses for specific table queries
      this.logger.info(`Finding ${this.tableName} by ID: ${id}`);
      return null;
    } catch (error) {
      this.logger.error(`Error finding ${this.tableName} by ID:`, error);
      return null;
    }
  }

  async findByUserId(userId: string): Promise<T[]> {
    try {
      this.logger.info(`Finding ${this.tableName} records for user: ${userId}`);
      return [];
    } catch (error) {
      this.logger.error(`Error finding ${this.tableName} records by user ID:`, error);
      return [];
    }
  }

  async findAll(filters: Record<string, any> = {}): Promise<T[]> {
    try {
      this.logger.info(`Finding all ${this.tableName} records with filters:`, filters);
      return [];
    } catch (error) {
      this.logger.error(`Error finding all ${this.tableName} records:`, error);
      return [];
    }
  }

  async create(data: Partial<T>): Promise<T | null> {
    try {
      this.logger.info(`Creating new ${this.tableName} record:`, data);
      return null;
    } catch (error) {
      this.logger.error(`Error creating ${this.tableName} record:`, error);
      throw error;
    }
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    try {
      this.logger.info(`Updating ${this.tableName} record ${id}:`, data);
      return null;
    } catch (error) {
      this.logger.error(`Error updating ${this.tableName} record:`, error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      this.logger.info(`Deleting ${this.tableName} record: ${id}`);
      return false;
    } catch (error) {
      this.logger.error(`Error deleting ${this.tableName} record:`, error);
      return false;
    }
  }

  // Replace duplicate auth checks across all service methods
  protected requireAuth(userId?: string): void {
    if (!userId) {
      throw new Error('Authentication required');
    }
  }

  // Replace duplicate audit logging patterns
  protected async logAudit(
    userId: string,
    event: string,
    entityType: string,
    entityId: string,
    oldData?: any,
    newData?: any
  ): Promise<void> {
    try {
      await DatabaseService.logAuditEvent(userId, event, entityType, entityId, oldData, newData);
      this.logger.info(`Audit logged: ${event} for ${entityType}:${entityId}`);
    } catch (error) {
      this.logger.error('Failed to log audit event:', error);
    }
  }

  // Replace duplicate validation helpers
  protected validateRequired(value: any, fieldName: string): void {
    if (!value) {
      throw new Error(`${fieldName} is required`);
    }
  }

  protected validateOwnership(record: any, userId: string): void {
    if (record.userId !== userId && record.user_id !== userId) {
      throw new Error('Access denied: record does not belong to user');
    }
  }

  // Replace duplicate response helpers across services
  async handleResponse<T>(
    res: Response,
    operation: () => Promise<T>,
    successMessage: string = 'Operation completed successfully'
  ): Promise<T | null> {
    try {
      const result = await operation();
      ApiResponseHelper.success(res, result, successMessage);
      return result;
    } catch (error: any) {
      this.logger.error(`${successMessage} failed:`, error);
      ApiResponseHelper.error(res, error.message || 'Operation failed');
      return null;
    }
  }
}

// Specialized service base classes for common patterns
export abstract class UserOwnedService<T> extends BaseService<T> {
  protected userField: string;

  constructor(tableName: string, userField: string = 'userId') {
    super(tableName);
    this.userField = userField;
  }

  // Override to enforce user ownership
  override async findByUserId(userId: string): Promise<T[]> {
    if (!userId) throw new Error('User ID required');
    return super.findByUserId(userId);
  }

  // Override create method - this is not compatible with base class signature
  // Services should implement their own create methods with userId parameter
  // async create(data: Partial<T>, userId: string): Promise<T | null> {
  //   if (!userId) throw new Error('User ID required');
  //   (data as any)[this.userField] = userId;
  //   return await super.create(data);
  // }

  // Override update method - this is not compatible with base class signature
  // async update(id: string, data: Partial<T>, userId: string): Promise<T | null> {
  //   if (!userId) throw new Error('User ID required');
  //   // Get existing record first to validate ownership
  //   const existing = await this.findById(id);
  //   if (existing) {
  //     this.validateOwnership(existing, userId);
  //   }
  //   return super.update(id, data);
  // }

  // Override delete method - this is not compatible with base class signature
  // async delete(id: string, userId: string): Promise<boolean> {
  //   if (!userId) throw new Error('User ID required');
  //   // Verify ownership before deletion
  //   const existing = await this.findById(id);
  //   if (existing) {
  //     this.validateOwnership(existing, userId);
  //   }
  //   return super.delete(id);
  // }
}

// Specialized service for paginated collections
export abstract class PaginatedService<T> extends UserOwnedService<T> {
  async findPaginated(
    userId: string,
    page: number = 1,
    limit: number = 10,
    filters: Record<string, any> = {}
  ): Promise<{ data: T[]; total: number; pages: number }> {
    try {
      this.logger.info(`Finding paginated ${this.tableName} for user ${userId}:`, { page, limit, filters });

      // This would be implemented by subclasses
      return { data: [], total: 0, pages: 0 };
    } catch (error) {
      this.logger.error(`Error finding paginated ${this.tableName}:`, error);
      return { data: [], total: 0, pages: 0 };
    }
  }
}
