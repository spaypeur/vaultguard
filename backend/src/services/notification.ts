import { Logger } from '../utils/logger';
import { RedisClient } from '../utils/redis';
import { EventEmitter } from 'events';

export interface NotificationOptions {
    type: string;
    severity?: string;
    data: any;
}

export class NotificationService extends EventEmitter {
    private static instance: NotificationService;
    private readonly logger: Logger;
    private readonly redis: RedisClient | null;
    private readonly NOTIFICATION_CHANNEL = 'vaultguard:notifications';

    private constructor() {
        super();
        this.logger = new Logger('NotificationService');
        try {
            this.redis = RedisClient.getInstance();
            this.initialize();
        } catch (error) {
            this.logger.warn('Redis not available, running in degraded mode:', error.message);
            this.redis = null;
        }
    }

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    private async initialize(): Promise<void> {
        if (this.redis) {
            await this.setupRedisSubscriber();
        } else {
            this.logger.warn('Skipping Redis initialization - Redis is not available');
        }
    }

    private async setupRedisSubscriber(): Promise<void> {
        if (this.redis) {
            await this.redis.subscribe(this.NOTIFICATION_CHANNEL, (message: string) => {
                try {
                    const notification = JSON.parse(message);
                    this.emit('notification', notification);
                } catch (error) {
                    this.logger.error('Error processing notification:', error);
                }
            });
        }
    }

    public async send(options: NotificationOptions): Promise<void> {
        try {
            const notification = {
                id: crypto.randomUUID(),
                timestamp: new Date(),
                ...options
            };

            if (this.redis) {
                await this.redis.publish(
                    this.NOTIFICATION_CHANNEL,
                    JSON.stringify(notification)
                );
            } else {
                this.logger.warn('Notification send skipped - Redis not available:', notification);
                // In degraded mode, just emit locally
                this.emit('notification', notification);
            }
        } catch (error) {
            this.logger.error('Error sending notification:', error);
            throw error;
        }
    }

    public async sendHighPriority(options: NotificationOptions): Promise<void> {
        try {
            const notification = {
                id: crypto.randomUUID(),
                timestamp: new Date(),
                priority: 'HIGH',
                ...options
            };

            if (this.redis) {
                // Send to Redis for real-time notifications
                await this.redis.publish(
                    this.NOTIFICATION_CHANNEL,
                    JSON.stringify(notification)
                );

                // Store in Redis for guaranteed delivery
                await this.redis.set(
                    `notification:${notification.id}`,
                    JSON.stringify(notification),
                    3600 // 1h TTL
                );

                // Emit event for internal handlers
                this.emit('highPriorityNotification', notification);
            } else {
                this.logger.warn('High priority notification send skipped - Redis not available:', notification);
                // In degraded mode, just emit locally
                this.emit('highPriorityNotification', notification);
            }
        } catch (error) {
            this.logger.error('Error sending high priority notification:', error);
            throw error;
        }
    }
}
