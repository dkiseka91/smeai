import Redis from 'ioredis';

if (!process.env.REDIS_URL) {
  console.warn('[Redis] REDIS_URL not set — rate-limiting and plan-guard will be disabled');
}

export const redis: Redis | null = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      connectTimeout: 5000,
      enableOfflineQueue: false,
    })
  : null;

redis?.on('error', (err) => console.error('[Redis] Error:', err));
