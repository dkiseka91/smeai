import type { CheckContext, CheckStatus, Finding } from '../../lib/types';
import { safeFetch } from '../../lib/fetchWithTimeout';
import { mapLimit } from '../../lib/concurrency';

interface SecretPattern {
  label: string;
  pattern: RegExp;
}

// Patterns are intentionally specific (fixed prefixes/lengths) to keep the
// false-positive rate low — we'd rather under-report than cry wolf.
const SECRET_PATTERNS: SecretPattern[] = [
  { label: 'AWS Access Key ID', pattern: /AKIA[0-9A-Z]{16}/ },
  { label: 'Google API Key', pattern: /AIza[0-9A-Za-z\-_]{35}/ },
  { label: 'Stripe Live Secret Key', pattern: /sk_live_[0-9a-zA-Z]{24,}/ },
  { label: 'Stripe Live Publishable Key', pattern: /pk_live_[0-9a-zA-Z]{24,}/ },
  { label: 'Slack Token', pattern: /xox[baprs]-[0-9A-Za-z-]{10,}/ },
  { label: 'GitHub Personal Access Token', pattern: /gh[pousr]_[0-9A-Za-z]{36,}/ },
  { label: 'Private Key Block', pattern: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { label: 'Generic hardcoded secret/token', pattern: /(?:api[_-]?key|secret[_-]?key|access[_-]?token|client[_-]?secret)\s*[:=]\s*["'][A-Za-z0-9_\-/+]{16,}["']/i },
];

const SCRIPT_SRC_RE = /<script[^>]+src=["']([^"']+)["']/gi;
const INLINE_SCRIPT_RE = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
const API_PATH_RE = /["'](\/api\/[a-zA-Z0-9_\-./]*)["']/g;

const MAX_BUNDLES = 3;
const MAX_BUNDLE_BYTES = 300_000;

function findSecrets(text: string): Set<string> {
  const found = new Set<string>();
  for (const { label, pattern } of SECRET_PATTERNS) {
    if (pattern.test(text)) found.add(label);
  }
  return found;
}

function extractApiPaths(text: string): Set<string> {
  const paths = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = API_PATH_RE.exec(text))) paths.add(match[1]);
  return paths;
}

export async function checkEndpointDiscovery(ctx: CheckContext): Promise<Omit<Finding, 'id' | 'label' | 'category' | 'weight'>> {
  const pageRes = await safeFetch(ctx.url.toString());
  const html = pageRes.text;

  const inlineScripts = [...html.matchAll(INLINE_SCRIPT_RE)].map((m) => m[1]).join('\n');
  const scriptSrcs = [...html.matchAll(SCRIPT_SRC_RE)]
    .map((m) => m[1])
    .filter((src) => !/^(https?:)?\/\/(?!.*vibecheck)/i.test(src) || src.includes(ctx.url.hostname)) // prefer same-origin bundles
    .slice(0, MAX_BUNDLES);

  const bundles = await mapLimit(scriptSrcs, 3, async (src) => {
    try {
      const bundleUrl = new URL(src, ctx.baseOrigin).toString();
      const res = await safeFetch(bundleUrl, { timeoutMs: 6000, maxBodyBytes: MAX_BUNDLE_BYTES });
      return res.error ? '' : res.text;
    } catch {
      return '';
    }
  });

  const combinedText = [html, inlineScripts, ...bundles].join('\n');
  const secrets = findSecrets(combinedText);
  const apiPaths = extractApiPaths(combinedText);
  const versioned = [...apiPaths].filter((p) => /^\/api\/v\d+\//.test(p));
  const unversioned = [...apiPaths].filter((p) => !/^\/api\/v\d+\//.test(p));

  let status: CheckStatus;
  if (secrets.size > 0) status = 'fail';
  else if (unversioned.length > 0) status = 'warn';
  else status = 'pass';

  const problemParts: string[] = [];
  if (secrets.size > 0) {
    problemParts.push(`VibeCheck found what looks like ${secrets.size} hardcoded secret(s) in your public HTML/JS: ${[...secrets].join(', ')}.`);
  }
  if (unversioned.length > 0) {
    problemParts.push(
      `Found ${apiPaths.size} API path(s) referenced in the page/bundles, ${unversioned.length} without a version prefix (e.g. \`${unversioned[0]}\` instead of \`/api/v1/...\`).`
    );
  }
  if (problemParts.length === 0) {
    problemParts.push(`Scanned the page and ${scriptSrcs.length} linked script bundle(s) — no hardcoded secrets and no unversioned API paths were found.`);
  }

  return {
    status,
    summary:
      secrets.size > 0
        ? `${secrets.size} likely secret(s) found in public assets`
        : unversioned.length > 0
        ? `${unversioned.length} unversioned API path(s) found`
        : 'No leaked secrets or unversioned endpoints found',
    problem: problemParts.join(' '),
    risk:
      secrets.size > 0
        ? 'Any API key shipped in your frontend JavaScript is public — anyone can open DevTools, copy it, and use it to rack up charges on your account, access data behind that key, or impersonate your app. This is the single most common and most damaging mistake in AI-assisted ("vibecoded") apps, where a server-only key gets pasted straight into client code.'
        : 'Unversioned API endpoints (`/api/thing` instead of `/api/v1/thing`) make it impossible to change your API\'s shape later without silently breaking every client already using it — you lose the ability to evolve your backend safely.',
    solution:
      secrets.size > 0
        ? [
            '**Rotate every exposed key immediately** — assume it is already compromised.',
            'Move secret keys server-side only. In the browser, only ever ship keys explicitly designed to be public (e.g. Stripe **publishable** keys `pk_...`, not secret keys `sk_...`).',
            '```js\n// Wrong: key baked into frontend code\nconst client = new SomeSDK({ apiKey: \'sk_live_...\' });\n\n// Right: frontend calls YOUR backend, which holds the real key\nconst res = await fetch(\'/api/checkout\', { method: \'POST\' });\n```',
            'If you\'re using Vite/Next.js/CRA, remember any env var prefixed `VITE_` / `NEXT_PUBLIC_` / `REACT_APP_` is bundled into public JS — never put secret keys behind those prefixes.',
          ].join('\n\n')
        : unversioned.length > 0
        ? '`/api/v1/...` (instead of bare `/api/...`) lets you introduce breaking changes behind a new `/api/v2/` path while old clients keep working against `/v1/`. Add a version segment to new routes going forward.'
        : 'Nothing to do.',
    evidence: {
      scannedBundles: scriptSrcs.length,
      leakedSecretTypes: [...secrets],
      apiPathsFound: [...apiPaths].slice(0, 25),
      unversionedCount: unversioned.length,
      versionedCount: versioned.length,
    },
  };
}
