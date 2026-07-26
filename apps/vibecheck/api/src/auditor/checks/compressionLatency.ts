import type { CheckContext, CheckStatus, Finding } from '../../lib/types';
import { safeFetch } from '../../lib/fetchWithTimeout';

export async function checkCompressionLatency(ctx: CheckContext): Promise<Omit<Finding, 'id' | 'label' | 'category' | 'weight'>> {
  // A couple of samples smooths out one-off network jitter.
  const samples = await Promise.all([
    safeFetch(ctx.url.toString(), { headers: { 'Accept-Encoding': 'gzip, br' } }),
    safeFetch(ctx.url.toString(), { headers: { 'Accept-Encoding': 'gzip, br' } }),
  ]);
  const okSamples = samples.filter((s) => !s.error);
  const avgTtfb = okSamples.length ? Math.round(okSamples.reduce((sum, s) => sum + s.ttfbMs, 0) / okSamples.length) : null;
  const contentEncoding = okSamples[0]?.headers['content-encoding'];
  const compressed = !!contentEncoding && /(gzip|br|deflate)/i.test(contentEncoding);

  const issues: string[] = [];
  if (avgTtfb === null) issues.push('Site was unreachable during latency sampling.');
  else if (avgTtfb > 1500) issues.push(`Average Time To First Byte is ${avgTtfb}ms — visitors wait over 1.5s before anything starts rendering.`);
  else if (avgTtfb > 600) issues.push(`Average Time To First Byte is ${avgTtfb}ms — noticeably slower than the ~200-600ms visitors expect.`);
  if (!compressed) issues.push('Responses are not compressed (no gzip/brotli `Content-Encoding`), sending more bytes over the wire than necessary.');

  let status: CheckStatus;
  if (avgTtfb === null || (avgTtfb > 1500 && !compressed)) status = 'fail';
  else if (issues.length > 0) status = 'warn';
  else status = 'pass';

  return {
    status,
    summary: avgTtfb !== null ? `Avg TTFB ${avgTtfb}ms · ${compressed ? `compressed (${contentEncoding})` : 'not compressed'}` : 'Unable to measure latency',
    problem: issues.length === 0 ? `Fast response time (avg TTFB ${avgTtfb}ms) with ${contentEncoding} compression enabled.` : issues.join(' '),
    risk:
      'Slow initial response times and uncompressed payloads directly hurt bounce rate, conversion, and SEO ranking (Google factors page speed into search results) — every extra 100ms of load time measurably reduces how many visitors stick around.',
    solution:
      status === 'pass'
        ? 'Nothing to do.'
        : [
            !compressed &&
              [
                '**Enable compression:**',
                '- Express: `npm i compression` then `app.use(compression())`',
                '- Nginx: `gzip on; gzip_types text/plain application/json application/javascript text/css;`',
                '- Most CDNs (Cloudflare, Vercel, CloudFront) compress automatically once enabled in their dashboard/settings.',
              ].join('\n'),
            avgTtfb !== null &&
              avgTtfb > 600 &&
              [
                '**Reduce TTFB:**',
                '- Move the site behind a CDN/edge network so requests are served closer to visitors (see the CDN finding).',
                '- Check for slow database queries or unbounded API calls blocking the initial response.',
                '- Cache expensive computed responses (Redis, in-memory cache, or HTTP caching headers).',
              ].join('\n'),
          ]
            .filter(Boolean)
            .join('\n\n'),
    evidence: { avgTtfbMs: avgTtfb, contentEncoding: contentEncoding ?? null, samples: okSamples.map((s) => s.ttfbMs) },
  };
}
