import type { CheckContext, CheckStatus, Finding } from '../../lib/types';
import { safeFetch } from '../../lib/fetchWithTimeout';
import { SNIPPETS } from '../../lib/recommendations';

interface HeaderSpec {
  header: string;
  why: string;
}

const REQUIRED_HEADERS: HeaderSpec[] = [
  { header: 'strict-transport-security', why: 'forces browsers to always use HTTPS for your domain' },
  { header: 'content-security-policy', why: 'blocks malicious scripts injected via XSS' },
  { header: 'x-frame-options', why: 'stops your site being embedded in a hidden clickjacking iframe' },
  { header: 'x-content-type-options', why: 'stops browsers guessing (and misusing) file types' },
  { header: 'referrer-policy', why: 'controls how much of your URL leaks to third-party sites' },
  { header: 'permissions-policy', why: 'restricts access to camera, mic, and location APIs' },
];

export async function checkSecurityHeaders(ctx: CheckContext): Promise<Omit<Finding, 'id' | 'label' | 'category' | 'weight'>> {
  const res = await safeFetch(ctx.url.toString());

  if (res.error) {
    return {
      status: 'fail',
      summary: `Could not reach the site: ${res.error}`,
      problem: `VibeCheck couldn't load ${ctx.url.href} to inspect its headers (${res.error}).`,
      risk: 'If real visitors also can\'t reach your site, you have a bigger problem than headers — check your hosting/DNS first.',
      solution: 'Confirm the site is publicly reachable (try it in an incognito browser tab), then re-run the audit.',
      evidence: { error: res.error },
    };
  }

  const present = REQUIRED_HEADERS.filter((h) => res.headers[h.header]);
  const missing = REQUIRED_HEADERS.filter((h) => !res.headers[h.header]);

  let status: CheckStatus;
  if (present.length >= 5) status = 'pass';
  else if (present.length >= 3) status = 'warn';
  else status = 'fail';

  const missingList = missing.map((h) => `\`${h.header}\` — ${h.why}`).join('\n- ');

  return {
    status,
    summary: `${present.length} of ${REQUIRED_HEADERS.length} recommended security headers present`,
    problem:
      missing.length === 0
        ? 'All six recommended security headers are present on your responses.'
        : `Your server response is missing ${missing.length} recommended security header${missing.length > 1 ? 's' : ''}:\n\n- ${missingList}`,
    risk:
      'Security headers are free, browser-enforced guardrails. Without them, a single XSS bug or stray click can let attackers run scripts, steal session cookies, or trick users into clicking hidden buttons on your site — no server breach required.',
    solution:
      missing.length === 0
        ? 'Nothing to do — keep this configuration when you redeploy.'
        : `Add the missing headers at your app layer or edge. Pick the snippet that matches your stack:\n\n**Express / Node.js**\n\`\`\`js\n${SNIPPETS.helmetHeaders}\n\`\`\`\n\n**Next.js**\n\`\`\`js\n${SNIPPETS.nextHeaders}\n\`\`\`\n\n**Nginx**\n\`\`\`nginx\n${SNIPPETS.nginxHeaders}\n\`\`\`\n\n**No server access? Use Cloudflare:**\n${SNIPPETS.cloudflareTransformRules}`,
    evidence: {
      present: present.map((h) => h.header),
      missing: missing.map((h) => h.header),
      rawHeaders: res.headers,
    },
  };
}
