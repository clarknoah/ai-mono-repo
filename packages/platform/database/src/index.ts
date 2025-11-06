/**
 * Database platform package.
 *
 * Exports Prisma client and database utilities.
 */
export { prisma, disconnectPrisma } from './client';
export type { Prisma, PrismaClient } from '@prisma/client';
