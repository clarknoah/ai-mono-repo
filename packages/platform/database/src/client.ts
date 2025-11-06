/**
 * Prisma client instance with logging and connection management.
 */
import { PrismaClient } from '@prisma/client';
import { logger } from '@iam/shared-utils';

/**
 * Global Prisma client instance.
 *
 * Reuses connection in development to avoid "too many connections" errors.
 */
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

/**
 * Creates and configures a Prisma client instance.
 */
function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'event' },
      { level: 'warn', emit: 'event' },
    ],
  });

  // Log queries in development
  if (process.env.NODE_ENV === 'development') {
    client.$on('query', (e: any) => {
      logger.debug('Prisma Query', {
        query: e.query,
        params: e.params,
        duration: e.duration,
      });
    });
  }

  // Log errors
  client.$on('error', (e: any) => {
    logger.error('Prisma Error', e);
  });

  // Log warnings
  client.$on('warn', (e: any) => {
    logger.warn('Prisma Warning', { message: e.message });
  });

  return client;
}

/**
 * Singleton Prisma client instance.
 *
 * In development, reuses the same instance across hot reloads.
 * In production, creates a new instance.
 */
export const prisma = global.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

/**
 * Disconnects from the database.
 *
 * Call this in graceful shutdown handlers.
 */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Disconnected from database');
}
