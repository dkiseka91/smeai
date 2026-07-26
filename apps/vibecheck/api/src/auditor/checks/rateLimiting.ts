import type { CheckContext, CheckStatus, Finding } from '../../lib/types';
import { safeFetch } from '../../lib/fetchWithTimeout';
import { mapLimit } from '../../lib/concurrency';

// Deliberately small burst — enough to reveal throttling behaviour without
// putting any real load on the target site.
const BURST_SIZE = 20;
const BURST_CONCURRENCY = 10;

export async function checkRateLimiting(ctx: CheckContext): Promise<Omit<Finding, 'id' | 'label' | 'category' | 'weight'>> {
  const results = await mapLimit(Array.from({ length: BURST_SIZE }), BURST_CONCURRENCY, () =>
    safeFetch(ctx.url.toString(), { method: 'GET', timeoutMs: 5000 })
  );

  const statuses = results.map((r) => r.status);
  const throttled = results.filter((r) => r.status === 429);
  const serverErrors = results.filter((r) => r.status >= 500);
  const succeeded = results.filter((r) => r.status >= 200 && r.status < 400);

  let status: CheckStatus;
  let problem: string;

  if (serverErrors.length > 0) {
    status = 'fail';
    problem = `${serverErrors.length} of ${BURST_SIZE} rapid requests returned a 5xx server error — the site appears to buckle under even a small burst of ${BURST_SIZE} concurrent-ish requests, rather than gracefully throttling.`;
  } else if (throttled.length > 0) {
    status = 'pass';
    problem = `${throttled.length} of ${BURST_SIZE} rapid requests were throttled with HTTP 429, confirming rate limiting or anti-abuse protection is active.`;
  } else {
    status = 'warn';
    problem = `All ${BURST_SIZE} rapid requests succeeded (${succeeded.length} with 2xx/3xx) with no throttling observed. This burst is too small to prove an attacker could overwhelm the site, but no rate limiting was detected either.`;
  }

  return {
    status,
    summary: `${throttled.length}/${BURST_SIZE} throttled (429), ${serverErrors.length}/${BURST_SIZE} server errors`,
    problem,
    risk:
      'Without rate limiting, a single script (or a curious visitor) can hammer your login form, signup endpoint, or AI-powered feature thousands of times a minute — running up cloud/API bills, enabling credential-stuffing attacks, or taking the whole site down (a "friendly-fire" DoS with no attacker required).',
    solution:
      status === 'pass'
        ? 'Nothing to do — keep the limiter\'s thresholds sensible for real user traffic.'
        : [
            '**Express / Node.js** — add `express-rate-limit`:',
            '```js\nimport rateLimit from \'express-rate-limit\';\n\napp.use(rateLimit({\n  windowMs: 60_000,\n  max: 100, // 100 requests per minute per IP\n  standardHeaders: true,\n}));\n```',
            '**No server access (static hosting)?** Enable rate limiting at the edge instead — Cloudflare\'s free "Rate Limiting Rules" (Security → WAF → Rate limiting rules) work without touching code.',
            '**Serverless (Vercel/Next.js API routes):** use a shared store like Upstash Redis with the `@upstash/ratelimit` package, since in-memory limiters don\'t work across serverless invocations.',
          ].join('\n\n'),
    evidence: { burstSize: BURST_SIZE, statusCounts: countBy(statuses) },
  };
}

function countBy(values: number[]): Record<string, number> {
  return values.reduce<Record<string, number>>((acc, v) => {
    const key = String(v);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}
