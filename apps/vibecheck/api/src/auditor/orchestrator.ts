import { CHECKS, checksMeta } from './checks';
import type { Finding, Report } from '../lib/types';
import { computeScores } from '../lib/scoring';
import { emitProgress } from '../lib/progressBus';
import { getReport, updateReport } from '../lib/db';

const CHECK_TIMEOUT_MS = 15_000;

async function runSingleCheck(meta: (typeof CHECKS)[number], url: URL): Promise<Finding> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
  try {
    const result = await meta.run({ url, baseOrigin: url.origin, signal: controller.signal });
    return { id: meta.id, label: meta.label, category: meta.category, weight: meta.weight, ...result };
  } catch (err) {
    return {
      id: meta.id,
      label: meta.label,
      category: meta.category,
      weight: meta.weight,
      status: 'fail',
      summary: 'Check crashed unexpectedly',
      problem: `The "${meta.label}" check failed to complete: ${err instanceof Error ? err.message : 'unknown error'}.`,
      risk: 'This is a VibeCheck internal error, not necessarily a problem with your site — re-run the audit to confirm.',
      solution: 'If this keeps happening for the same URL, the site may be blocking automated requests entirely.',
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function runAudit(runId: string, rawUrl: string): Promise<void> {
  const url = new URL(rawUrl);
  updateReport(runId, { status: 'running' });
  emitProgress(runId, { type: 'run:start', id: runId, url: url.toString(), checks: checksMeta() });

  const findings: Finding[] = [];

  await Promise.all(
    CHECKS.map(async (meta) => {
      emitProgress(runId, { type: 'check:start', id: runId, checkId: meta.id });
      const finding = await runSingleCheck(meta, url);
      findings.push(finding);
      emitProgress(runId, { type: 'check:complete', id: runId, finding });
    })
  );

  // Keep the report's finding order stable and matching the check registry
  // rather than "whoever finished first", so the UI doesn't jump around.
  const orderedFindings = CHECKS.map((meta) => findings.find((f) => f.id === meta.id)!).filter(Boolean);

  const { overall, byCategory } = computeScores(orderedFindings);

  updateReport(runId, {
    status: 'complete',
    completedAt: new Date().toISOString(),
    score: overall,
    categoryScores: byCategory,
    findings: orderedFindings,
  });

  const finalReport = getReport(runId)!;
  emitProgress(runId, { type: 'run:complete', id: runId, report: finalReport });
}

export async function runAuditSafely(runId: string, rawUrl: string): Promise<void> {
  try {
    await runAudit(runId, rawUrl);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error running audit';
    updateReport(runId, { status: 'error', error: message, completedAt: new Date().toISOString() });
    emitProgress(runId, { type: 'run:error', id: runId, message });
  }
}

export function validateAuditableUrl(input: string): { ok: true; url: URL } | { ok: false; reason: string } {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return { ok: false, reason: 'That doesn\'t look like a valid URL. Include the protocol, e.g. https://example.com' };
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    return { ok: false, reason: 'Only http:// and https:// URLs are supported.' };
  }
  const hostname = url.hostname.toLowerCase();
  const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
  const isPrivateIp = /^(10\.|172\.(1[6-9]|2\d|3[0-1])\.|192\.168\.|169\.254\.)/.test(hostname);
  if (blockedHosts.includes(hostname) || isPrivateIp || hostname.endsWith('.local')) {
    return { ok: false, reason: 'Local/private network addresses cannot be audited from this hosted tool.' };
  }
  return { ok: true, url };
}
