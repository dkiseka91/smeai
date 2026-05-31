import type { Request, Response, NextFunction } from 'express';
import { redis } from '../lib/redis';
import { PLAN_LIMITS } from '@sme-pitch-ai/shared';

type LimitKey = 'monthlyPlans' | 'monthlyDecks' | 'chatQueries';

export function planGuard(limitKey: LimitKey) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }
    const planTier = req.user.planTier as keyof typeof PLAN_LIMITS;
    const limits = PLAN_LIMITS[planTier];
    const limit = limits[limitKey] as number;
    if (limit === -1) { next(); return; }
    const now = new Date();
    const monthKey = `usage:${req.user.id}:${limitKey}:${now.getFullYear()}-${now.getMonth() + 1}`;
    const current = await redis.incr(monthKey);
    if (current === 1) {
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const ttl = Math.floor((endOfMonth.getTime() - now.getTime()) / 1000);
      await redis.expire(monthKey, ttl);
    }
    if (current > limit) {
      res.status(402).json({
        error: {
          code: 'PLAN_LIMIT_REACHED',
          message: `Monthly ${limitKey} limit of ${limit} reached`,
          upgradeUrl: '/pricing',
        },
      });
      return;
    }
    next();
  };
}
