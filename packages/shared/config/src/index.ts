/**
 * Application configuration with environment variable validation.
 */
import { z } from 'zod';
import type { Environment } from '@iam/shared-types';

/**
 * Base environment schema shared across all runtimes.
 */
export const baseEnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'staging', 'production', 'test'])
    .default('development') as z.ZodType<Environment>,

  LOG_LEVEL: z
    .enum(['debug', 'info', 'warn', 'error', 'fatal'])
    .default('info'),

  // Database
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_URL: z.string().url(),

  // Neo4j
  NEO4J_URL: z.string().url(),
  NEO4J_USERNAME: z.string(),
  NEO4J_PASSWORD: z.string(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // Email (optional for now)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // Object Storage (optional for now)
  S3_ENDPOINT: z.string().url().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
});

export type BaseEnv = z.infer<typeof baseEnvSchema>;

/**
 * Validates environment variables against a schema.
 *
 * @param schema - Zod schema to validate against
 * @returns Validated environment object
 * @throws ZodError if validation fails
 */
export function validateEnv<T extends z.ZodType>(schema: T): z.infer<T> {
  const result = schema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.format());
    throw new Error('Invalid environment variables');
  }

  return result.data;
}

/**
 * Example usage:
 *
 * ```typescript
 * // In your runtime (e.g., runtimes/api/src/config.ts)
 * import { baseEnvSchema, validateEnv } from '@iam/shared-config';
 *
 * const apiEnvSchema = baseEnvSchema.extend({
 *   PORT: z.coerce.number().default(3000),
 *   CORS_ORIGIN: z.string().default('*'),
 * });
 *
 * export const config = validateEnv(apiEnvSchema);
 * ```
 */
