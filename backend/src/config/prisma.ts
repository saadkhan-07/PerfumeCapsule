import { PrismaClient } from '@prisma/client';
import { env } from './env';

/**
 * Single shared Prisma Client instance for the whole process.
 * In development we reuse it across hot reloads via globalThis to avoid
 * exhausting database connections.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
