import { Router, type Request, type Response } from 'express';
import { nanoid } from 'nanoid';
import { createReport, getReport, listRecentReports } from '../lib/db';
import { getHistory, subscribeProgress } from '../lib/progressBus';
import { runAuditSafely, validateAuditableUrl } from '../auditor/orchestrator';
import type { ProgressEvent } from '../lib/types';

const router = Router();

// Simple in-memory throttle so VibeCheck itself can't be used to hammer a
// target repeatedly — a handful of audits per IP every few minutes is plenty
// for a legitimate user iterating on their own site.
const RATE_WINDOW_MS = 5 * 60 * 1000;
const RATE_MAX_REQUESTS = 5;
const requestLog = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  timestamps.push(now);
  requestLog.set(key, timestamps);
  return timestamps.length > RATE_MAX_REQUESTS;
}

router.post('/', (req: Request, res: Response) => {
  const clientKey = req.ip ?? 'unknown';
  if (isRateLimited(clientKey)) {
    return res.status(429).json({ error: 'Too many audits requested. Please wait a few minutes and try again.' });
  }

  const { url } = req.body ?? {};
  if (typeof url !== 'string' || !url.trim()) {
    return res.status(400).json({ error: 'A "url" field is required.' });
  }

  const validation = validateAuditableUrl(url);
  if (!validation.ok) {
    return res.status(400).json({ error: validation.reason });
  }

  const id = nanoid(10);
  createReport(id, validation.url.toString());
  void runAuditSafely(id, validation.url.toString());

  res.status(201).json({ id });
});

router.get('/recent', (_req: Request, res: Response) => {
  res.json(listRecentReports(10).map((r) => ({ id: r.id, url: r.url, score: r.score, status: r.status, createdAt: r.createdAt })));
});

router.get('/:id', (req: Request, res: Response) => {
  const report = getReport(req.params.id);
  if (!report) return res.status(404).json({ error: 'Audit not found.' });
  res.json(report);
});

router.get('/:id/events', (req: Request, res: Response) => {
  const { id } = req.params;
  const report = getReport(id);
  if (!report) {
    res.status(404).end();
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders?.();

  const send = (event: ProgressEvent) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  if (report.status === 'complete' || report.status === 'error') {
    send(
      report.status === 'complete'
        ? { type: 'run:complete', id, report }
        : { type: 'run:error', id, message: report.error ?? 'Unknown error' }
    );
    res.end();
    return;
  }

  for (const event of getHistory(id)) send(event);

  const unsubscribe = subscribeProgress(id, (event) => {
    send(event);
    if (event.type === 'run:complete' || event.type === 'run:error') {
      res.end();
    }
  });

  const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 15_000);

  req.on('close', () => {
    clearInterval(heartbeat);
    unsubscribe();
  });
});

export default router;
