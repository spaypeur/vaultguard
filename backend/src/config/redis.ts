import { RedisOptions } from 'ioredis';

interface RedisConfig {
    redis: {
        host: string;
        port: number;
        password?: string;
        tls?: boolean;
        retryStrategy?: (times: number) => number;
        enableReadyCheck?: boolean;
        maxRetriesPerRequest?: number;
        connectTimeout?: number;
        keepAlive?: number;
        family?: number;
        keyPrefix?: string;
    };
}

const config: RedisConfig = {
    redis: {
        host: process.env.REDIS_HOST || 'redis.cloud.vaultguard.io',
        port: parseInt(process.env.REDIS_PORT || '6380'),
        password: process.env.REDIS_PASSWORD || 'A3zv0p8z0fswbdvjjq748c3u3glcokpw5mx9ac0bclau3snhoi3',
        tls: true, // Always use TLS in production
        retryStrategy: (times: number) => Math.min(times * 50, 2000), // Exponential backoff
        enableReadyCheck: true,
        maxRetriesPerRequest: 3
    }
};

export { config, RedisConfig };