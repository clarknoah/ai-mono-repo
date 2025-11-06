/**
 * High-level cache interface with typed keys and values.
 */
import { redis } from './client';
import { logger } from '@iam/shared-utils';
import { CACHE_TTL } from '@iam/shared-constants';

export interface CacheOptions {
  ttl?: number;
  prefix?: string;
}

/**
 * Cache wrapper providing type-safe caching operations.
 */
export class Cache {
  constructor(private readonly options: CacheOptions = {}) {}

  /**
   * Gets a value from cache.
   *
   * @param key - Cache key
   * @returns Cached value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.getFullKey(key);

    try {
      const value = await redis.get(fullKey);
      if (!value) return null;

      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Cache get error', error instanceof Error ? error : new Error(String(error)), {
        key: fullKey,
      });
      return null;
    }
  }

  /**
   * Sets a value in cache.
   *
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in seconds (optional, uses default from options)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const fullKey = this.getFullKey(key);
    const cacheTtl = ttl ?? this.options.ttl ?? CACHE_TTL.MEDIUM;

    try {
      const serialized = JSON.stringify(value);
      await redis.set(fullKey, serialized, 'EX', cacheTtl);
    } catch (error) {
      logger.error('Cache set error', error instanceof Error ? error : new Error(String(error)), {
        key: fullKey,
      });
    }
  }

  /**
   * Deletes a value from cache.
   *
   * @param key - Cache key
   */
  async del(key: string): Promise<void> {
    const fullKey = this.getFullKey(key);

    try {
      await redis.del(fullKey);
    } catch (error) {
      logger.error(
        'Cache delete error',
        error instanceof Error ? error : new Error(String(error)),
        { key: fullKey }
      );
    }
  }

  /**
   * Deletes multiple keys matching a pattern.
   *
   * @param pattern - Key pattern (e.g., "user:*")
   */
  async delPattern(pattern: string): Promise<void> {
    const fullPattern = this.getFullKey(pattern);

    try {
      const keys = await redis.keys(fullPattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      logger.error(
        'Cache delete pattern error',
        error instanceof Error ? error : new Error(String(error)),
        { pattern: fullPattern }
      );
    }
  }

  /**
   * Checks if a key exists in cache.
   *
   * @param key - Cache key
   * @returns True if key exists, false otherwise
   */
  async exists(key: string): Promise<boolean> {
    const fullKey = this.getFullKey(key);

    try {
      const result = await redis.exists(fullKey);
      return result === 1;
    } catch (error) {
      logger.error(
        'Cache exists error',
        error instanceof Error ? error : new Error(String(error)),
        { key: fullKey }
      );
      return false;
    }
  }

  /**
   * Gets the full cache key with prefix.
   */
  private getFullKey(key: string): string {
    return this.options.prefix ? `${this.options.prefix}:${key}` : key;
  }
}

/**
 * Default cache instance.
 */
export const cache = new Cache({ prefix: 'iam' });
