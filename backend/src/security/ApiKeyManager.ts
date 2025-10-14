import { createHash, randomBytes } from 'crypto';
import { SupabaseClient } from '@supabase/supabase-js';
import { redisClient } from '../config/redisClient';
import AuditLogger from './AuditLogger';
import AdvancedRateLimiter from './AdvancedRateLimiter';

interface ApiKey {
  id: string;
  key: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  lastUsed?: Date;
  rotationSchedule: 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  metadata: {
    permissions: string[];
    ipWhitelist?: string[];
    usageQuota?: number;
    rotationHistory?: Array<{
      timestamp: Date;
      reason: string;
    }>;
    securityLevel: 'standard' | 'high' | 'enterprise';
    lastRotation?: Date;
    rotationAttempts: number;
    failedAttempts: number;
    lastFailedAttempt?: Date;
  };
}

interface KeyRotationResult {
  success: boolean;
  newKey?: ApiKey;
  error?: string;
  rotationId?: string;
}

interface KeyValidationContext {
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  resource?: string;
  action?: string;
}

class ApiKeyManager {
  private supabase: SupabaseClient;
  private static instance: ApiKeyManager;
  private static readonly KEY_PREFIX = 'vg:apikey:';
  private static readonly ROTATION_LOCK_TTL = 300; // 5 minutes
  private static readonly MAX_FAILED_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 3600; // 1 hour
  private readonly auditLogger: AuditLogger;
  private readonly rateLimiter: AdvancedRateLimiter;

  private constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
    this.auditLogger = AuditLogger.getInstance(supabase);
    this.rateLimiter = AdvancedRateLimiter.getInstance();
  }

  static getInstance(supabase: SupabaseClient): ApiKeyManager {
    if (!ApiKeyManager.instance) {
      ApiKeyManager.instance = new ApiKeyManager(supabase);
    }
    return ApiKeyManager.instance;
  }

  /**
   * Hash an API key for secure storage
   */
  private async hashKey(key: string): Promise<string> {
    return createHash('sha3-512').update(key).digest('hex');
  }

  /**
   * Generate a cryptographically secure API key with quantum resistance
   */
  private generateKey(): string {
    // Use multiple entropy sources for enhanced security
    const staticEntropy = randomBytes(32);
    const dynamicEntropy = randomBytes(32);
    const timestamp = Buffer.from(Date.now().toString());
    const environmentNoise = Buffer.from(process.memoryUsage().toString());

    // Combine entropy sources using SHA3-512
    const hash = createHash('sha3-512');
    const combinedEntropy = Buffer.concat([
      staticEntropy,
      dynamicEntropy,
      timestamp,
      environmentNoise
    ]);

    // Double hash for additional security
    const firstHash = hash.update(combinedEntropy).digest();
    const secondHash = createHash('sha3-512').update(firstHash).digest('hex');

    return `vg_${secondHash.substring(0, 64)}`;
  }

  /**
   * Create a new API key with enhanced security features
   */
  async createApiKey(
    userId: string,
    options: {
      rotationSchedule?: 'daily' | 'weekly' | 'monthly';
      permissions?: string[];
      ipWhitelist?: string[];
      usageQuota?: number;
      securityLevel?: 'standard' | 'high' | 'enterprise';
    } = {}
  ): Promise<ApiKey> {
    const key = this.generateKey();
    const now = new Date();
    const expiresAt = new Date();

    // Calculate expiration based on rotation schedule
    switch (options.rotationSchedule || 'monthly') {
      case 'daily':
        expiresAt.setDate(expiresAt.getDate() + 1);
        break;
      case 'weekly':
        expiresAt.setDate(expiresAt.getDate() + 7);
        break;
      case 'monthly':
        expiresAt.setMonth(expiresAt.getMonth() + 1);
        break;
    }

    const metadata = {
      permissions: options.permissions || ['basic'],
      ipWhitelist: options.ipWhitelist || [],
      usageQuota: options.usageQuota || 1000,
      securityLevel: options.securityLevel || 'standard',
      rotationHistory: [] as Array<{
        timestamp: Date;
        reason: string;
      }>,
      rotationAttempts: 0,
      failedAttempts: 0
    };

    try {
      const { data, error } = await this.supabase
        .from('api_keys')
        .insert({
          key: await this.hashKey(key),
          userId,
          createdAt: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
          rotationSchedule: options.rotationSchedule || 'monthly',
          isActive: true,
          metadata
        })
        .select()
        .single();

      if (error) throw error;

      // Cache the API key with metadata
      await redisClient.setex(
        `${ApiKeyManager.KEY_PREFIX}${key}`,
        Math.floor((expiresAt.getTime() - now.getTime()) / 1000),
        JSON.stringify({ userId, isActive: true, metadata })
      );

      await this.auditLogger.log(
        { user: { id: userId } } as any,
        'api_key_created',
        'security',
        'success',
        {
          severity: 'medium',
          details: {
            keyId: data.id,
            rotationSchedule: options.rotationSchedule,
            securityLevel: metadata.securityLevel
          }
        }
      );

      // Schedule automatic rotation
      await this.scheduleKeyRotation(key);

      return { ...data, key } as ApiKey;
    } catch (error) {
      await this.auditLogger.log(
        { user: { id: userId } } as any,
        'api_key_creation_failed',
        'security',
        'failure',
        {
          severity: 'high',
          details: { error: error instanceof Error ? error.message : 'Unknown error occurred' }
        }
      );
      throw error;
    }
  }

  /**
   * Rotate an API key with failure handling and locking
   */
  async rotateApiKey(oldKey: string, context: KeyValidationContext): Promise<KeyRotationResult> {
    const lockKey = `${ApiKeyManager.KEY_PREFIX}rotation:${oldKey}`;
    const hasLock = await redisClient.set(lockKey, '1', 'EX', ApiKeyManager.ROTATION_LOCK_TTL, 'NX');

    if (!hasLock) {
      return {
        success: false,
        error: 'Key rotation already in progress'
      };
    }

    try {
      // Get current key data
      const { data: oldKeyData, error: fetchError } = await this.supabase
        .from('api_keys')
        .select()
        .eq('key', await this.hashKey(oldKey))
        .eq('isActive', true)
        .single();

      if (fetchError || !oldKeyData) {
        throw new Error('Invalid or inactive API key');
      }

      // Verify IP whitelist if configured
      if (oldKeyData.metadata.ipWhitelist?.length > 0 &&
          !oldKeyData.metadata.ipWhitelist.includes(context.ipAddress)) {
        throw new Error('IP not authorized for key rotation');
      }

      // Create new key with same configuration
      const newKey = await this.createApiKey(oldKeyData.userId, {
        rotationSchedule: oldKeyData.rotationSchedule,
        permissions: oldKeyData.metadata.permissions,
        ipWhitelist: oldKeyData.metadata.ipWhitelist,
        usageQuota: oldKeyData.metadata.usageQuota,
        securityLevel: oldKeyData.metadata.securityLevel
      });

      // Update rotation history
      const rotationHistory = [
        ...(oldKeyData.metadata.rotationHistory || []),
        {
          timestamp: new Date(),
          reason: 'scheduled_rotation'
        }
      ];

      // Deactivate old key
      const { error: updateError } = await this.supabase
        .from('api_keys')
        .update({
          isActive: false,
          metadata: {
            ...oldKeyData.metadata,
            rotationHistory,
            deactivatedAt: new Date().toISOString(),
            deactivationReason: 'rotation'
          }
        })
        .eq('key', await this.hashKey(oldKey));

      if (updateError) {
        // Rollback new key creation if update fails
        await this.revokeApiKey(newKey.key);
        throw updateError;
      }

      // Remove old key from Redis
      await redisClient.del(`${ApiKeyManager.KEY_PREFIX}${oldKey}`);

      await this.auditLogger.log(
        { user: { id: oldKeyData.userId } } as any,
        'api_key_rotated',
        'security',
        'success',
        {
          severity: 'medium',
          details: {
            oldKeyId: oldKeyData.id,
            newKeyId: newKey.id,
            rotationReason: 'scheduled'
          }
        }
      );

      return {
        success: true,
        newKey,
        rotationId: `rot_${Date.now()}`
      };
    } catch (error) {
      await this.auditLogger.log(
        { user: { id: 'system' } } as any,
        'api_key_rotation_failed',
        'security',
        'failure',
        {
          severity: 'high',
          details: {
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            key: oldKey
          }
        }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    } finally {
      await redisClient.del(lockKey);
    }
  }

  /**
   * Validate an API key
   */
  async validateApiKey(key: string): Promise<boolean> {
    // First check Redis cache
    const cachedKey = await redisClient.get(`${ApiKeyManager.KEY_PREFIX}${key}`);
    if (cachedKey) {
      const { isActive } = JSON.parse(cachedKey);
      return isActive;
    }

    // If not in cache, check database
    const { data, error } = await this.supabase
      .from('api_keys')
      .select()
      .eq('key', key)
      .eq('isActive', true)
      .single();

    if (error || !data) return false;

    // Check if key has expired
    if (new Date(data.expiresAt) < new Date()) {
      await this.revokeApiKey(key);
      return false;
    }

    // Update last used timestamp
    await this.supabase
      .from('api_keys')
      .update({ lastUsed: new Date().toISOString() })
      .eq('key', key);

    return true;
  }

  /**
   * Revoke an API key
   */
  async revokeApiKey(key: string): Promise<void> {
    const { error } = await this.supabase
      .from('api_keys')
      .update({ isActive: false })
      .eq('key', key);

    if (error) throw error;

    // Remove from Redis cache
    await redisClient.del(`${ApiKeyManager.KEY_PREFIX}${key}`);
  }

  /**
   * Schedule automatic key rotation
   */
  async scheduleKeyRotation(key: string): Promise<void> {
    const { data, error } = await this.supabase
      .from('api_keys')
      .select()
      .eq('key', key)
      .single();

    if (error || !data) throw new Error('Invalid API key');

    const rotationInterval = data.rotationSchedule === 'daily'
      ? 24 * 60 * 60 * 1000 // 1 day
      : data.rotationSchedule === 'weekly'
      ? 7 * 24 * 60 * 60 * 1000 // 1 week
      : 30 * 24 * 60 * 60 * 1000; // ~1 month

    setTimeout(async () => {
      try {
        await this.rotateApiKey(key, {
          ipAddress: 'system',
          userAgent: 'system',
          timestamp: new Date(),
          action: 'auto_rotation'
        });
      } catch (error) {
        await this.auditLogger.log(
          { user: { id: 'system' } } as any,
          'auto_rotation_failed',
          'security',
          'failure',
          {
            severity: 'high',
            details: {
              key,
              error: error instanceof Error ? error.message : 'Unknown error occurred'
            }
          }
        );
      }
    }, rotationInterval);
  }
}

export default ApiKeyManager;