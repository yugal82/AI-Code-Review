import Redis from 'ioredis';
import { logger } from '../utils/logger';

if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL is not set in environment variables');
}

export const redis = new Redis(process.env.REDIS_URL);
// export const redis = new Redis();

redis.on('connect', () => {
    logger.info('Connected to Redis');
});

redis.on('error', (error) => {
    logger.error('Redis connection error:', error);
});

// Cache TTL in seconds
export const CACHE_TTL = {
    CODE_ANALYSIS: 24 * 60 * 60, // 24 hours
    CODE_REFACTOR: 24 * 60 * 60, // 24 hours
};

// Cache key generators
export const generateCacheKey = {
    analysis: (code: string) => `analysis:${Buffer.from(code).toString('base64')}`,
    refactor: (code: string) => `refactor:${Buffer.from(code).toString('base64')}`,
}; 