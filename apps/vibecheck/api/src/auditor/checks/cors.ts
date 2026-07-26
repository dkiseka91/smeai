import type { CheckContext, CheckStatus, Finding } from '../../lib/types';
import { safeFetch } from '../../lib/fetchWithTimeout';

const PROBE_ORIGIN_A = 'https://vibecheck-probe-a.example.test';
const PROBE_ORIGIN_B = 'https://vibecheck-probe-b.example.test';

export async function checkCors(ctx: CheckContext): Promise<Omit<Finding, 'id' | 'label' | 'category' | 'weight'>> {
  const [resA, resB] = await Promise.all([
    safeFetch(ctx.url.toString(), { headers: { Origin: PROBE_ORIGIN_A } }),
    safeFetch(ctx.url.toString(), { headers: { Origin: PROBE_ORIGIN_B } }),
  ]);

  const acaoA = resA.headers['access-control-allow-origin'];
  const acaoB = resB.headers['access-control-allow-origin'];
  const acacA = resA.headers['access-control-allow-credentials'];

  let status: CheckStatus = 'pass';
  let problem: string;
  const reflectsArbitraryOrigin = !!acaoA && acaoA === PROBE_ORIGIN_A && !!acaoB && acaoB === PROBE_ORIGIN_B;
  const wildcardWithCredentials = acaoA === '*' && acacA === 'true';

  if (wildcardWithCredentials) {
    status = 'fail';
    problem = `The site sends \`Access-Control-Allow-Origin: *\` together with \`Access-Control-Allow-Credentials: true\`. Modern browsers block this exact combination, but it signals a broken CORS configuration that was likely meant to allow credentialed cross-origin requests from anywhere.`;
  } else if (reflectsArbitraryOrigin) {
    status = 'fail';
    problem = `The site reflects **any** \`Origin\` header sent to it back as \`Access-Control-Allow-Origin\` (tested with two unrelated fake origins, both were accepted). This means any website on the internet can make authenticated cross-origin requests to your API on behalf of a logged-in visitor.`;
  } else if (acaoA === '*') {
    status = 'warn';
    problem = `The site sends \`Access-Control-Allow-Origin: *\`, allowing any website to read its responses. This is normal for a public, read-only API, but risky if any of these endpoints return private or user-specific data.`;
  } else if (acaoA) {
    status = 'pass';
    problem = `CORS is restricted to a specific allow-listed origin (\`${acaoA}\`) rather than \`*\` or a reflected value.`;
  } else {
    status = 'pass';
    problem = 'No permissive CORS headers were found — cross-origin requests are blocked by default, which is the safest baseline.';
  }

  return {
    status,
    summary: acaoA ? `Access-Control-Allow-Origin: ${acaoA}` : 'No Access-Control-Allow-Origin header returned',
    problem,
    risk:
      'Overly permissive CORS is one of the most common "vibecoded" mistakes: it turns any authenticated API call (fetch user profile, change settings, read invoices) into something a malicious website can trigger on a victim\'s behalf just by getting them to open a link, silently exfiltrating their data or performing actions as them.',
    solution:
      status === 'pass'
        ? 'No action needed. If you do need cross-origin access later, allow-list specific origins rather than using `*` or reflecting the request Origin.'
        : [
            '**Express / Node.js** — use an explicit allow-list instead of `*` or reflecting the Origin header:',
            '```js\nimport cors from \'cors\';\n\nconst allowedOrigins = [\'https://app.yourdomain.com\'];\n\napp.use(cors({\n  origin: (origin, cb) => {\n    if (!origin || allowedOrigins.includes(origin)) cb(null, true);\n    else cb(new Error(\'Not allowed by CORS\'));\n  },\n  credentials: true,\n}));\n```',
            '**Next.js API routes** — set the header conditionally per allow-listed origin rather than statically to `*`.',
            'Never combine `Access-Control-Allow-Origin: *` with `Access-Control-Allow-Credentials: true` — pick one: public+stateless, or credentialed+allow-listed.',
          ].join('\n\n'),
    evidence: { acaoProbeA: acaoA ?? null, acaoProbeB: acaoB ?? null, allowCredentials: acacA ?? null },
  };
}
