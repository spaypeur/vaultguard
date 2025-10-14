import Redis from 'ioredis';
import { Logger } from './logger';

export class RedisClient {
    private static instance: RedisClient | null;
    private readonly client: Redis | null;
    private readonly logger: Logger;
    private available: boolean;

    constructor() {
        this.logger = new Logger('RedisClient');
        this.available = false;

        const redisUrl = process.env.REDIS_URL;

        // If REDIS_URL is empty, disable Redis completely
        if (!redisUrl || redisUrl.trim() === '') {
            this.logger.warn('Redis disabled - REDIS_URL is empty or not set');
            this.client = null;
            return;
        }

        try {
            this.client = new Redis({
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379'),
                password: process.env.REDIS_PASSWORD,
                retryDelayOnFailover: 100,
            } as any);

            this.client.on('error', (error) => {
                this.logger.error('Redis Client Error:', error);
                this.available = false;
            });

            this.client.on('connect', () => {
                this.logger.info('Redis Client Connected');
                this.available = true;
            });

            this.client.on('ready', () => {
                this.available = true;
            });
        } catch (error) {
            this.logger.warn('Redis initialization failed:', error);
            this.client = null;
        }
    }

    public static getInstance(): RedisClient {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }
        return RedisClient.instance;
    }

    public isAvailable(): boolean {
        return this.available && this.client !== null;
    }

    public async set(key: string, value: string, ttl?: number): Promise<void> {
        try {
            if (ttl) {
                await this.client.set(key, value, 'EX', ttl);
            } else {
                await this.client.set(key, value);
            }
        } catch (error) {
            this.logger.error('Redis SET Error:', error);
            throw error;
        }
    }

    public async get(key: string): Promise<string | null> {
        try {
            return await this.client.get(key);
        } catch (error) {
            this.logger.error('Redis GET Error:', error);
            throw error;
        }
    }

    public async del(key: string): Promise<void> {
        try {
            await this.client.del(key);
        } catch (error) {
            this.logger.error('Redis DEL Error:', error);
            throw error;
        }
    }

    public async hset(key: string, field: string, value: string): Promise<void> {
        try {
            await this.client.hset(key, field, value);
        } catch (error) {
            this.logger.error('Redis HSET Error:', error);
            throw error;
        }
    }

    public async hget(key: string, field: string): Promise<string | null> {
        try {
            return await this.client.hget(key, field);
        } catch (error) {
            this.logger.error('Redis HGET Error:', error);
            throw error;
        }
    }

    public async publish(channel: string, message: string): Promise<void> {
        try {
            await this.client.publish(channel, message);
        } catch (error) {
            this.logger.error('Redis PUBLISH Error:', error);
            throw error;
        }
    }

    public async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
        try {
            await this.client.subscribe(channel);
            this.client.on('message', (ch: string, message: string) => {
                if (ch === channel) {
                    callback(message);
                }
            });
        } catch (error) {
            this.logger.error('Redis SUBSCRIBE Error:', error);
            throw error;
        }
    }
}
