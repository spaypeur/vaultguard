import ApiKeyManager from './ApiKeyManager';
import { redisClient } from '../config/redisClient';
import AuditLogger from './AuditLogger';
import crypto from 'crypto';

export class ApiKeyRotator {
  private static readonly KEY_ROTATION_PREFIX = 'api_key_rotation:';
  private static readonly DEFAULT_ROTATION_INTERVAL = 7 * 24 * 60 * 60; // 7 days in seconds

  constructor(
    private apiKeyManager: ApiKeyManager,
    private auditLogger: AuditLogger
  ) {}

  async scheduleKeyRotation(userId: string, interval: number = ApiKeyRotator.DEFAULT_ROTATION_INTERVAL): Promise<void> {
    const rotationKey = `${ApiKeyRotator.KEY_ROTATION_PREFIX}${userId}`;

    // Schedule next rotation using redisClient
    await redisClient.set(rotationKey, Date.now().toString(), 'EX', interval);

    // Generate new API key (simplified for now)
    const newApiKey = this.generateSecureApiKey();

    // Log rotation event with correct parameters
    await this.auditLogger.log(
      { user: { id: userId } } as any,
      'api_key_rotation',
      'security',
      'success',
      {
        severity: 'medium',
        details: 'API key rotation scheduled'
      }
    );
  }

  private generateSecureApiKey(): string {
    const keyBuffer = crypto.randomBytes(32);
    return keyBuffer.toString('base64url');
  }

  async forceRotation(userId: string): Promise<void> {
    await this.scheduleKeyRotation(userId, 0);
  }
}