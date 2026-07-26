import type { CheckContext, CheckStatus, Finding } from '../../lib/types';
import { safeFetch } from '../../lib/fetchWithTimeout';

const LEAK_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /at\s+[\w.$]+\s+\(.*:\d+:\d+\)/, label: 'Node.js stack trace' },
  { pattern: /Traceback \(most recent call last\)/, label: 'Python traceback' },
  { pattern: /django\.(db|core|urls)/i, label: 'Django internals' },
  { pattern: /at\s+System\.\w+/, label: '.NET stack trace' },
  { pattern: /org\.springframework/, label: 'Spring Framework internals' },
  { pattern: /Whitelabel Error Page/i, label: 'Spring Boot default error page' },
  { pattern: /in <module>/, label: 'Python interpreter internals' },
  { pattern: /PHP (Fatal error|Warning|Notice)/, label: 'PHP error output' },
  { pattern: /\/(home|usr\/src|var\/www)\/[\w./-]+\.(js|ts|py|php|rb)/, label: 'server filesystem path' },
  { pattern: /ECONNREFUSED|ER_ACCESS_DENIED|SequelizeConnectionError/, label: 'database connection error detail' },
];

export async function checkErrorHandling(ctx: CheckContext): Promise<Omit<Finding, 'id' | 'label' | 'category' | 'weight'>> {
  const url = new URL('/non-existent-vibe-path-12345', ctx.baseOrigin).toString();
  const res = await safeFetch(url);

  const leaks = LEAK_PATTERNS.filter((p) => p.pattern.test(res.text)).map((p) => p.label);
  const isServerError = res.status >= 500;
  const isProperNotFound = res.status === 404;
  const genericFrameworkDefault = /Cannot GET|Cannot POST|404 Not Found<\/title>\s*<\/head>\s*<body>\s*<center>nginx/i.test(res.text);

  let status: CheckStatus;
  if (leaks.length > 0 || isServerError) status = 'fail';
  else if (!isProperNotFound || genericFrameworkDefault) status = 'warn';
  else status = 'pass';

  const problemParts: string[] = [];
  problemParts.push(`Requesting a non-existent route returned HTTP ${res.status}.`);
  if (leaks.length > 0) problemParts.push(`The response body leaks internal details: ${leaks.join(', ')}.`);
  if (isServerError) problemParts.push('A missing route should return 404, not a 5xx server error — this suggests unhandled exceptions rather than routing.');
  if (genericFrameworkDefault) problemParts.push('The response is a raw framework/server default error page rather than a custom, branded 404.');

  return {
    status,
    summary: `Unknown route → HTTP ${res.status}${leaks.length ? `, leaked: ${leaks.join(', ')}` : ''}`,
    problem: problemParts.join(' '),
    risk:
      leaks.length > 0
        ? 'Leaked stack traces hand attackers a roadmap of your tech stack, file paths, and internal logic — turning a routine 404 into free reconnaissance for a targeted attack. This is one of the most common findings on AI-generated apps where the framework\'s default (verbose) error handler was never replaced.'
        : 'Unhandled errors and generic default error pages look unprofessional to visitors and, if they leak status codes or timing differences, can help attackers map out which routes/resources exist on your server.',
    solution:
      status === 'pass'
        ? 'Nothing to do.'
        : [
            '**Express / Node.js** — add a catch-all 404 and a generic error handler that never leaks stack traces in production:',
            '```js\napp.use((req, res) => res.status(404).json({ error: \'Not found\' }));\n\napp.use((err, req, res, next) => {\n  console.error(err); // log full detail server-side only\n  res.status(err.status || 500).json({ error: \'Something went wrong\' });\n});\n```',
            '**Next.js** — add a custom `app/not-found.tsx` and `app/error.tsx`, and ensure `NODE_ENV=production` so default verbose error overlays are disabled.',
            'Always set `NODE_ENV=production` (or your framework\'s equivalent) on your live deployment — most frameworks only show stack traces in development mode.',
          ].join('\n\n'),
    evidence: { status: res.status, leakedPatterns: leaks, bodyPreview: res.text.slice(0, 300) },
  };
}
