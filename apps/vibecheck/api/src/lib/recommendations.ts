/**
 * Reusable copy-paste snippets shared across multiple check modules, so the
 * "Solution" panel of a finding card stays consistent no matter which stack
 * clue we detected (Express/Node, Next.js, Nginx, or a managed CDN).
 */

export const SNIPPETS = {
  helmetHeaders: `// Express / Node.js — install helmet: npm i helmet
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));`,

  nextHeaders: `// next.config.js
module.exports = {
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'Content-Security-Policy', value: "default-src 'self'" },
      ],
    }];
  },
};`,

  nginxHeaders: `# nginx.conf — inside your server { } block
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Content-Security-Policy "default-src 'self'" always;`,

  cloudflareTransformRules: `Cloudflare Dashboard steps:
1. Go to your zone → Rules → Transform Rules → Modify Response Header
2. Create a rule matching all incoming requests (hostname equals your domain)
3. Add headers: Strict-Transport-Security, X-Content-Type-Options,
   X-Frame-Options, Referrer-Policy, Permissions-Policy, Content-Security-Policy
4. Deploy — headers now apply at the edge, no app redeploy required`,
} as const;
