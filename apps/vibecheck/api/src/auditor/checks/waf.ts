import type { CheckContext, CheckStatus, Finding } from '../../lib/types';
import { safeFetch } from '../../lib/fetchWithTimeout';

interface Signature {
  provider: string;
  test: (h: Record<string, string>) => boolean;
}

const SIGNATURES: Signature[] = [
  { provider: 'Cloudflare', test: (h) => 'cf-ray' in h || h['server']?.toLowerCase() === 'cloudflare' },
  { provider: 'AWS WAF / CloudFront', test: (h) => 'x-amz-cf-id' in h || 'x-amzn-requestid' in h },
  { provider: 'Fastly', test: (h) => 'x-served-by' in h || 'x-fastly-request-id' in h },
  { provider: 'Sucuri', test: (h) => 'x-sucuri-id' in h || 'x-sucuri-cache' in h },
  { provider: 'Akamai', test: (h) => Object.keys(h).some((k) => k.startsWith('akamai-')) },
  { provider: 'Imperva/Incapsula', test: (h) => 'x-iinfo' in h || Object.keys(h).some((k) => k.includes('incap_ses')) },
  { provider: 'DataDome', test: (h) => 'x-datadome' in h },
];

// A harmless probe string that a WAF's generic rule set commonly flags, sent
// once as a single extra query param on the root path — not aimed at any
// real input field or endpoint, so nothing is actually attacked.
const PROBE_QUERY = "?vibecheck_waf_probe=<script>alert(1)</script>' OR '1'='1";

export async function checkWaf(ctx: CheckContext): Promise<Omit<Finding, 'id' | 'label' | 'category' | 'weight'>> {
  const baseline = await safeFetch(ctx.url.toString());
  const probe = await safeFetch(new URL(ctx.url.pathname + PROBE_QUERY, ctx.baseOrigin).toString());

  const detected = SIGNATURES.filter((s) => s.test(baseline.headers)).map((s) => s.provider);
  const probeBlocked = probe.status !== baseline.status && [401, 403, 406, 419, 429, 999].includes(probe.status);

  let status: CheckStatus;
  if (detected.length > 0 || probeBlocked) status = 'pass';
  else status = 'warn';

  return {
    status,
    summary:
      detected.length > 0
        ? `${detected.join(', ')} detected via response headers`
        : probeBlocked
        ? `No named WAF header signature, but a malicious-looking request was blocked (HTTP ${probe.status})`
        : 'No WAF or DDoS protection signature detected',
    problem:
      detected.length > 0
        ? `Response headers indicate traffic passes through ${detected.join(' / ')}, which typically includes WAF and DDoS mitigation.`
        : probeBlocked
        ? `A request containing an obvious XSS/SQLi-style payload was blocked (HTTP ${probe.status}) while the same clean request returned HTTP ${baseline.status}, suggesting some filtering layer is active even without an identifiable vendor signature.`
        : 'No evidence of a Web Application Firewall or DDoS protection service was found — a test request containing an XSS/SQLi-style payload was processed identically to a normal request.',
    risk:
      'A WAF is your first line of defense against automated attacks (SQL injection, XSS probing, credential stuffing, volumetric DDoS) before they ever reach your application code — without one, every bug in your app is directly exposed to the entire internet\'s attack traffic with no filtering layer in front of it.',
    solution:
      status === 'pass'
        ? 'Nothing to do.'
        : [
            '**Fastest fix — Cloudflare (free tier):** move your DNS to Cloudflare and enable proxying. This alone adds a WAF, DDoS mitigation, and bot filtering with zero code changes.',
            '**AWS-hosted apps:** enable AWS WAF on your CloudFront distribution or Application Load Balancer, using the managed "Core rule set" to start.',
            '**Already on Vercel/Netlify?** their platform includes basic DDoS protection, but consider adding Cloudflare in front for WAF-level rules (SQLi/XSS filtering, custom rate limiting).',
          ].join('\n\n'),
    evidence: {
      detectedProviders: detected,
      baselineStatus: baseline.status,
      probeStatus: probe.status,
      probeBlocked,
    },
  };
}
