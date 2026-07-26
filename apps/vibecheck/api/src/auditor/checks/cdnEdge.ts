import type { CheckContext, CheckStatus, Finding } from '../../lib/types';
import { safeFetch } from '../../lib/fetchWithTimeout';

interface Signature {
  provider: string;
  test: (h: Record<string, string>) => boolean;
}

const SIGNATURES: Signature[] = [
  { provider: 'Cloudflare', test: (h) => 'cf-ray' in h || h['server']?.toLowerCase() === 'cloudflare' },
  { provider: 'Vercel Edge Network', test: (h) => 'x-vercel-id' in h || h['server']?.toLowerCase().includes('vercel') },
  { provider: 'AWS CloudFront', test: (h) => 'x-amz-cf-id' in h || 'x-amz-cf-pop' in h || h['via']?.toLowerCase().includes('cloudfront') },
  { provider: 'Fastly', test: (h) => 'x-served-by' in h && h['x-served-by'].toLowerCase().includes('cache') || 'x-fastly-request-id' in h },
  { provider: 'Netlify', test: (h) => h['server']?.toLowerCase().includes('netlify') || 'x-nf-request-id' in h },
  { provider: 'Google Cloud CDN', test: (h) => h['via']?.toLowerCase().includes('google') },
];

export async function checkCdnEdge(ctx: CheckContext): Promise<Omit<Finding, 'id' | 'label' | 'category' | 'weight'>> {
  const res = await safeFetch(ctx.url.toString());
  const headers = res.headers;

  const detected = SIGNATURES.filter((s) => s.test(headers)).map((s) => s.provider);
  const genericEdgeClues = ['x-cache', 'via', 'age'].filter((h) => h in headers);

  let status: CheckStatus;
  if (detected.length > 0) status = 'pass';
  else if (genericEdgeClues.length > 0) status = 'warn';
  else status = 'warn';

  return {
    status,
    summary: detected.length > 0 ? `Served via ${detected.join(', ')}` : 'No CDN/edge network signature detected',
    problem:
      detected.length > 0
        ? `Your site is served through ${detected.join(' and ')}, which caches static content close to visitors worldwide.`
        : genericEdgeClues.length > 0
        ? `No named CDN was identified, but generic caching headers (${genericEdgeClues.join(', ')}) suggest some edge layer is in front of the origin.`
        : 'No CDN, reverse proxy, or edge caching layer was detected — every request appears to hit your origin server directly.',
    risk:
      'Without a CDN, every visitor request travels all the way to your origin server, and a traffic spike (a viral post, a bot crawl, a launch) can slow the site to a crawl or take it down entirely — plus visitors far from your server region get a noticeably slower experience.',
    solution:
      detected.length > 0
        ? 'Nothing to do. Make sure static assets (images, JS, CSS) carry long `Cache-Control` max-age values so the CDN can actually cache them — see the Cache-Control finding.'
        : [
            '**Fastest fix — Cloudflare (free tier):** point your domain\'s nameservers at Cloudflare, enable proxying (orange cloud) on your DNS record. No code changes needed.',
            '**If you deploy to Vercel/Netlify:** their edge network is automatic once your custom domain is connected — confirm your DNS `CNAME`/`A` record actually points at the platform, not directly at your origin server.',
            '**Self-hosted:** put your app behind a CDN/reverse proxy such as Cloudflare, AWS CloudFront, or Fastly, and set long-lived cache headers on static assets.',
          ].join('\n\n'),
    evidence: { detectedProviders: detected, relevantHeaders: pick(headers, ['server', 'via', 'x-cache', 'cf-ray', 'x-vercel-id', 'x-amz-cf-id', 'x-served-by', 'age']) },
  };
}

function pick(obj: Record<string, string>, keys: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of keys) if (k in obj) out[k] = obj[k];
  return out;
}
