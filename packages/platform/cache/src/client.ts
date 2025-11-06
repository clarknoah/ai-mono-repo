/**
 * Redis client instance with connection management.
 */
import Redis from 'ioredis';
import { logger } from '@iam/shared-utils';

/**
 * Creates and configures a Redis client instance.
 */
function createRedisClient(): Redis {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  const client = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  client.on('connect', () => {
    logger.info('Redis connected');
  });

  client.on('error', (error) => {
    logger.error('Redis error', error);
  });

  client.on('close', () => {
    logger.info('Redis connection closed');
  });

  return client;
}

/**
 * Singleton Redis client instance.
 */
export const redis = createRedisClient();

/**
 * Disconnects from Redis.
 *
 * Call this in graceful shutdown handlers.
 */
export async function disconnectRedis(): Promise<void> {
  await redis.quit();
  logger.info('Disconnected from Redis');
}
