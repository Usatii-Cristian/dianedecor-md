import { PrismaClient } from '@prisma/client'

/**
 * Cached on globalThis so Next.js dev hot-reload reuses one connection pool
 * instead of opening a new one on every save.
 */
const globalForPrisma = globalThis

export const prisma =
  globalForPrisma.prismaClient ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaClient = prisma
}

/**
 * True when DATABASE_URL still holds the placeholder from `.env.example`, i.e.
 * the studio's real Atlas cluster has not been wired up yet. Used to skip the
 * connection attempt entirely instead of waiting for it to time out.
 */
export function isDatabaseConfigured() {
  const url = process.env.DATABASE_URL
  return Boolean(url) && !url.includes('user:password@cluster.mongodb.net')
}
