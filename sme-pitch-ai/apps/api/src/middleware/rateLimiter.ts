import type { Request, Response, NextFunction } from 'express';
import { redis } from '../lib/redis';

async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;
  const pipeline = redis.pipeline();
  pipeline.zremrangebyscore(key, 0, windowStart);
  pipeline.zadd(key, now, `${now}`);
  pipeline.zcard(key);
  pipeline.expire(key, windowSeconds);
  const results = await pipeline.exec();
  const count = (results?.[2]?.[1] as number) ?? 0;
  return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
}

export function createRateLimiter(limit: number, windowSeconds: number, keyPrefix: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const identifier = req.user?.id ?? req.ip ?? 'unknown';
    const key = `ratelimit:${keyPrefix}:${identifier}`;
    try {
      const { allowed, remaining } = await checkRateLimit(key, limit, windowSeconds);
      res.setHeader('X-RateLimit-Remaining', remaining);
      if (!allowed) {
        res.status(429).json({ error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' } });
        return;
      }
      next();
    } catch {
      next();
    }
  };
}

export const aiRateLimiter = createRateLimiter(10, 3600, 'ai');
export const authRateLimiter = createRateLimiter(5, 900, 'auth');
export const generalRateLimiter = createRateLimiter(200, 60, 'general');
