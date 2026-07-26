import type { CheckContext, CheckStatus, Finding } from '../../lib/types';
import { safeFetch } from '../../lib/fetchWithTimeout';
import { mapLimit } from '../../lib/concurrency';

interface ProbePath {
  path: string;
  severity: 'critical' | 'moderate';
  note: string;
}

const PROBE_PATHS: ProbePath[] = [
  { path: '/.env', severity: 'critical', note: 'raw environment file (DB passwords, API keys, secrets)' },
  { path: '/.env.local', severity: 'critical', note: 'raw environment file (DB passwords, API keys, secrets)' },
  { path: '/.git/config', severity: 'critical', note: 'exposed git repository — source code and history can be reconstructed' },
  { path: '/.git/HEAD', severity: 'critical', note: 'exposed git repository — source code and history can be reconstructed' },
  { path: '/.aws/credentials', severity: 'critical', note: 'AWS credentials file' },
  { path: '/wp-config.php.bak', severity: 'critical', note: 'backup file that may contain database credentials' },
  { path: '/config.json', severity: 'moderate', note: 'application config, may contain internal settings' },
  { path: '/api/docs', severity: 'moderate', note: 'API documentation exposed publicly' },
  { path: '/swagger.json', severity: 'moderate', note: 'OpenAPI schema exposing your full API surface' },
  { path: '/swagger/index.html', severity: 'moderate', note: 'Swagger UI exposing your full API surface' },
  { path: '/metrics', severity: 'moderate', note: 'Prometheus metrics endpoint, can leak internal topology' },
  { path: '/server-status', severity: 'moderate', note: 'Apache server-status page, leaks internal request data' },
];

const GIT_HEAD_SIGNATURE = /^ref:\s*refs\//;
const ENV_SIGNATURE = /^[A-Z0-9_]+\s*=.+/m;

export async function checkExposedAssets(ctx: CheckContext): Promise<Omit<Finding, 'id' | 'label' | 'category' | 'weight'>> {
  const baseline = await safeFetch(new URL('/__vibecheck_baseline_404_check__', ctx.baseOrigin).toString());

  const results = await mapLimit(PROBE_PATHS, 4, async (probe) => {
    const res = await safeFetch(new URL(probe.path, ctx.baseOrigin).toString());
    const looksLikeBaseline = res.status === baseline.status && res.text.length > 0 && res.text.trim() === baseline.text.trim();
    const isPlausible404 = res.status === 404 || res.status >= 500 || res.status === 0;

    let exposed = res.ok && res.status === 200 && !looksLikeBaseline && res.text.trim().length > 0;

    if (exposed && probe.path === '/.env' || (exposed && probe.path === '/.env.local')) {
      exposed = ENV_SIGNATURE.test(res.text) || res.headers['content-type']?.includes('text/plain') === true;
    }
    if (exposed && probe.path === '/.git/HEAD') {
      exposed = GIT_HEAD_SIGNATURE.test(res.text.trim());
    }
    if (exposed && (probe.path === '/swagger.json')) {
      exposed = /"(swagger|openapi)"/.test(res.text);
    }

    return { probe, exposed: exposed && !isPlausible404, status: res.status, snippet: res.text.slice(0, 200) };
  });

  const exposedResults = results.filter((r) => r.exposed);
  const criticalHits = exposedResults.filter((r) => r.probe.severity === 'critical');
  const moderateHits = exposedResults.filter((r) => r.probe.severity === 'moderate');

  let status: CheckStatus;
  if (criticalHits.length > 0) status = 'fail';
  else if (moderateHits.length > 0) status = 'warn';
  else status = 'pass';

  const list = exposedResults.map((r) => `\`${r.probe.path}\` (HTTP ${r.status}) — ${r.probe.note}`).join('\n- ');

  return {
    status,
    summary:
      exposedResults.length === 0
        ? `No sensitive files exposed across ${PROBE_PATHS.length} probed paths`
        : `${exposedResults.length} sensitive path(s) publicly accessible`,
    problem:
      exposedResults.length === 0
        ? `VibeCheck probed ${PROBE_PATHS.length} common sensitive paths (\`.env\`, \`.git/\`, API docs, metrics endpoints, etc.) and none were publicly accessible.`
        : `VibeCheck found ${exposedResults.length} sensitive path(s) that are publicly accessible:\n\n- ${list}`,
    risk:
      criticalHits.length > 0
        ? 'An exposed `.env` or `.git` folder is a game-over vulnerability — attackers routinely scan the entire internet for these paths within minutes of a site going live, and a leaked database password or API key can lead to full data theft or a takeover of your cloud account.'
        : 'Exposed docs/metrics endpoints hand attackers a map of your internal API surface and infrastructure, making targeted attacks much easier even though no secret was leaked directly.',
    solution:
      exposedResults.length === 0
        ? 'Nothing to do — keep secret files (`.env`, `.git`) out of your deploy output when you make future changes.'
        : [
            '**Immediate action if `.env` or `.git` was exposed:** treat every secret in that file as compromised — rotate all API keys, database passwords, and tokens right now, then fix the exposure below.',
            '**Static hosts (Vercel/Netlify/Cloudflare Pages):** only deploy your build output directory, never the project root. Confirm `.env`, `.git`, and config files are not part of the publish directory.',
            '**Nginx / custom server** — explicitly deny dotfiles and doc/metrics routes:',
            '```nginx\nlocation ~ /\\.(?!well-known) { deny all; }\nlocation ~ ^/(\\.env|\\.git) { deny all; }\n```',
            '**Any framework:** add a `.dockerignore` / deploy-ignore entry for `.env*` and `.git`, and put API docs (`/swagger.json`, `/api/docs`) behind authentication in production.',
          ].join('\n\n'),
    evidence: { probed: PROBE_PATHS.length, exposed: exposedResults.map((r) => ({ path: r.probe.path, status: r.status })) },
  };
}
