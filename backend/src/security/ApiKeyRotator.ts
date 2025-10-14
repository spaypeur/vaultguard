import { ApiKeyManager } from './ApiKeyManager';
import { RedisClient } from '../config/redisClient';
import { AuditLogger } from './AuditLogger';
import crypto from 'crypto';

export class ApiKeyRotator {
  private static readonly KEY_ROTATION_PREFIX = 'api_key_rotation:';
  private static readonly DEFAULT_ROTATION_INTERVAL = 7 * 24 * 60 * 60; // 7 days in seconds

  constructor(
    private apiKeyManager: ApiKeyManager,
    private redisClient: RedisClient,
    private auditLogger: AuditLogger
  ) {}

  async scheduleKeyRotation(userId: string, interval: number = ApiKeyRotator.DEFAULT_ROTATION_INTERVAL): Promise<void> {
    const rotationKey = `${ApiKeyRotator.KEY_ROTATION_PREFIX}${userId}`;
    
    // Schedule next rotation
    await this.redisClient.set(rotationKey, Date.now().toString(), 'EX', interval);
    
    // Generate new API key
    const newApiKey = this.generateSecureApiKey();
    const oldApiKey = await this.apiKeyManager.getCurrentApiKey(userId);
    
    // Store both keys temporarily during transition
    await this.apiKeyManager.storeApiKey(userId, newApiKey);
    await this.apiKeyManager.storeTemporaryKey(userId, oldApiKey, 3600); // 1 hour overlap
    
    // Log rotation event
    await this.auditLogger.log({
      userId,
      action: 'API_KEY_ROTATION',
      details: 'Scheduled API key rotation completed',
      timestamp: new Date()
    });
  }

  private generateSecureApiKey(): string {
    const keyBuffer = crypto.randomBytes(32);
    return keyBuffer.toString('base64url');
  }

  async verifyApiKey(userId: string, apiKey: string): Promise<boolean> {
    const currentKey = await this.apiKeyManager.getCurrentApiKey(userId);
    const tempKey = await this.apiKeyManager.getTemporaryKey(userId);
    
    return apiKey === currentKey || apiKey === tempKey;
  }

  async forceRotation(userId: string): Promise<void> {
    await this.scheduleKeyRotation(userId, 0);
  }
}