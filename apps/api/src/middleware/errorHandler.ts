import type { Request, Response, NextFunction } from 'express';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  console.error('[Error]', err);
  if (err instanceof Error && err.name === 'ZodError') {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: err } });
    return;
  }
  const statusCode = (err as { statusCode?: number })?.statusCode ?? 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : (err instanceof Error ? err.message : 'Unknown error');
  res.status(statusCode).json({ error: { code: 'SERVER_ERROR', message } });
}
