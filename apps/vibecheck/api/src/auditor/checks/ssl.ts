import tls from 'tls';
import type { CheckContext, CheckStatus, Finding } from '../../lib/types';
import { safeFetch } from '../../lib/fetchWithTimeout';

interface CertInfo {
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  issuer: string;
  authorized: boolean;
  error?: string;
}

function inspectCertificate(hostname: string, port = 443, timeoutMs = 6000): Promise<CertInfo> {
  return new Promise((resolve) => {
    const socket = tls.connect(
      { host: hostname, port, servername: hostname, timeout: timeoutMs, rejectUnauthorized: false },
      () => {
        const cert = socket.getPeerCertificate();
        const authorized = socket.authorized;
        socket.end();
        if (!cert || Object.keys(cert).length === 0) {
          resolve({ validFrom: '', validTo: '', daysRemaining: 0, issuer: '', authorized: false, error: 'No certificate returned' });
          return;
        }
        const validTo = new Date(cert.valid_to);
        const daysRemaining = Math.round((validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        resolve({
          validFrom: cert.valid_from,
          validTo: cert.valid_to,
          daysRemaining,
          issuer: String(cert.issuer?.O ?? cert.issuer?.CN ?? 'Unknown'),
          authorized,
        });
      }
    );
    socket.on('error', (err) => resolve({ validFrom: '', validTo: '', daysRemaining: 0, issuer: '', authorized: false, error: err.message }));
    socket.on('timeout', () => {
      socket.destroy();
      resolve({ validFrom: '', validTo: '', daysRemaining: 0, issuer: '', authorized: false, error: 'TLS handshake timed out' });
    });
  });
}

export async function checkSsl(ctx: CheckContext): Promise<Omit<Finding, 'id' | 'label' | 'category' | 'weight'>> {
  const hostname = ctx.url.hostname;
  const httpUrl = `http://${hostname}${ctx.url.port && ctx.url.port !== '443' ? `:${ctx.url.port}` : ''}${ctx.url.pathname}`;

  const [cert, httpRes] = await Promise.all([
    inspectCertificate(hostname),
    safeFetch(httpUrl, { redirect: 'manual', timeoutMs: 6000 }),
  ]);

  const redirectsToHttps =
    httpRes.status >= 300 &&
    httpRes.status < 400 &&
    (httpRes.headers['location']?.startsWith('https://') ?? false);

  const issues: string[] = [];
  if (cert.error) issues.push(`TLS handshake failed: ${cert.error}`);
  if (!cert.error && !cert.authorized) issues.push('Certificate is not trusted by standard root CAs (self-signed or misconfigured chain)');
  if (!cert.error && cert.daysRemaining <= 14 && cert.daysRemaining >= 0) issues.push(`Certificate expires in ${cert.daysRemaining} day(s)`);
  if (!cert.error && cert.daysRemaining < 0) issues.push('Certificate has already expired');
  if (httpRes.status === 0) {
    // Plain HTTP not reachable at all — often fine if HTTPS-only at the network level, treat neutrally.
  } else if (!redirectsToHttps) {
    issues.push('Plain HTTP requests are not redirected to HTTPS');
  }

  let status: CheckStatus;
  if (cert.error || (!cert.authorized && !cert.error) || cert.daysRemaining < 0) status = 'fail';
  else if (issues.length > 0) status = 'warn';
  else status = 'pass';

  return {
    status,
    summary: cert.error
      ? 'TLS certificate could not be verified'
      : `Certificate valid for ${cert.daysRemaining} more day(s), issued by ${cert.issuer}${redirectsToHttps ? ', HTTP→HTTPS redirect confirmed' : ''}`,
    problem:
      issues.length === 0
        ? `HTTPS is enforced with a valid certificate from ${cert.issuer}, and HTTP requests correctly redirect to HTTPS.`
        : `VibeCheck found ${issues.length} TLS/HTTPS issue${issues.length > 1 ? 's' : ''}:\n\n- ${issues.join('\n- ')}`,
    risk:
      'A weak or missing TLS setup means visitor traffic (passwords, session cookies, form data) can be intercepted or tampered with on the network, and browsers will show scary "Not Secure" or "Your connection is not private" warnings that destroy user trust — and search engines rank HTTP sites lower.',
    solution:
      issues.length === 0
        ? 'Nothing to do. Consider enabling HSTS preload once you are confident every subdomain also runs HTTPS.'
        : [
            '**If you use a managed platform (Vercel, Netlify, Railway, Cloudflare Pages):** HTTPS certificates are automatic — just make sure your custom domain\'s DNS points at the platform (not a plain A record to a raw server) and that "Force HTTPS" is enabled in your dashboard.',
            '**If you run your own server:** use [Certbot](https://certbot.eff.org/) to get a free Let\'s Encrypt certificate, and add this HTTP→HTTPS redirect:',
            '```nginx\nserver {\n  listen 80;\n  server_name yourdomain.com;\n  return 301 https://$host$request_uri;\n}\n```',
            '**If you use Cloudflare:** set SSL/TLS mode to "Full (strict)" and turn on "Always Use HTTPS" under SSL/TLS → Edge Certificates.',
          ].join('\n\n'),
    evidence: { certificate: cert, httpRedirectStatus: httpRes.status, redirectsToHttps },
  };
}
