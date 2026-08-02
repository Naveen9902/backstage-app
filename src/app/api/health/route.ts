import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { redis } from '@/lib/auth';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();
  
  let dbStatus = 'ok';
  let redisStatus = 'ok';
  let dbLatency = 0;
  let redisLatency = 0;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - dbStart;
  } catch (error) {
    dbStatus = 'error';
    logger.error('Health Check: Database connection failed', error);
  }

  try {
    const redisStart = Date.now();
    await redis.ping();
    redisLatency = Date.now() - redisStart;
  } catch (error) {
    redisStatus = 'error';
    logger.error('Health Check: Redis connection failed', error);
  }

  const overallLatency = Date.now() - start;
  const isHealthy = dbStatus === 'ok' && redisStatus === 'ok';

  const responsePayload = {
    status: isHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      database: {
        status: dbStatus,
        latencyMs: dbLatency
      },
      redis: {
        status: redisStatus,
        latencyMs: redisLatency
      }
    },
    totalLatencyMs: overallLatency
  };

  if (!isHealthy) {
    return NextResponse.json(responsePayload, { status: 503 });
  }

  return NextResponse.json(responsePayload, { status: 200 });
}
