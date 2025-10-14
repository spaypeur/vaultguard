import Redis from 'ioredis';
import { config } from './redis';

const redisClient = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    tls: config.redis.tls ? {} : undefined,
    retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: config.redis.maxRetriesPerRequest,
    enableReadyCheck: config.redis.enableReadyCheck
});

redisClient.on('error', (error) => {
    console.error('Redis Client Error:', error);
});

redisClient.on('connect', () => {
    console.log('Redis Client Connected');
});

export { redisClient };