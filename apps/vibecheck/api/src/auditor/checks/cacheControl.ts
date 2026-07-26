import type { CheckContext, CheckStatus, Finding } from '../../lib/types';
import { safeFetch } from '../../lib/fetchWithTimeout';

function extractFirstAssetUrl(html: string, baseOrigin: string): string | null {
  const match = html.match(/<(?:script|link)[^>]+(?:src|href)=["']([^"']+\.(?:js|css|png|jpg|svg|woff2?))["']/i);
  if (!match) return null;
  try {
    return new URL(match[1], baseOrigin).toString();
  } catch {
    return null;
  }
}

function parseMaxAge(cacheControl: string | undefined): number | null {
  if (!cacheControl) return null;
  const m = cacheControl.match(/max-age=(\d+)/i);
  return m ? parseInt(m[1], 10) : null;
}

export async function checkCacheControl(ctx: CheckContext): Promise<Omit<Finding, 'id' | 'label' | 'category' | 'weight'>> {
  const pageRes = await safeFetch(ctx.url.toString());
  const assetUrl = extractFirstAssetUrl(pageRes.text, ctx.baseOrigin);
  const assetRes = assetUrl ? await safeFetch(assetUrl) : null;

  const pageCacheControl = pageRes.headers['cache-control'];
  const assetCacheControl = assetRes?.headers['cache-control'];
  const assetMaxAge = parseMaxAge(assetCacheControl);

  const issues: string[] = [];
  if (!assetUrl) {
    // Nothing to compare — informational only.
  } else if (!assetCacheControl) {
    issues.push('The static asset was served with no Cache-Control header at all, so browsers and CDNs re-fetch it every time.');
  } else if (assetMaxAge !== null && assetMaxAge < 3600) {
    issues.push(`The static asset's cache lifetime is only ${assetMaxAge}s — far below the day+ typical for hashed, immutable assets.`);
  }

  let status: CheckStatus;
  if (!assetUrl) status = 'warn';
  else if (issues.length === 0) status = 'pass';
  else if (assetCacheControl) status = 'warn';
  else status = 'warn';

  return {
    status,
    summary: assetUrl
      ? `Page: ${pageCacheControl ?? 'no cache-control'} · Static asset: ${assetCacheControl ?? 'no cache-control'}`
      : 'No static asset link found on the page to compare',
    problem: !assetUrl
      ? 'VibeCheck could not find a linked static asset (script/stylesheet/image) on the page to evaluate caching strategy.'
      : issues.length === 0
      ? `Static assets are cached aggressively (${assetCacheControl}), while the HTML page itself uses \`${pageCacheControl ?? 'no explicit cache-control'}\` — a healthy split between long-lived assets and fresh content.`
      : issues.join(' '),
    risk:
      'Under-caching static assets (JS/CSS/images) means every page view re-downloads the same bytes, slowing your site and increasing hosting/bandwidth costs. Over-caching dynamic or personalized responses (like `/api/user`) risks one user seeing another user\'s cached data.',
    solution:
      status === 'pass'
        ? 'Nothing to do.'
        : [
            'For static, hashed build assets (e.g. `app.a1b2c3.js`), set a long, immutable cache lifetime:',
            '```\nCache-Control: public, max-age=31536000, immutable\n```',
            'Most modern bundlers (Vite, Next.js, webpack) do this automatically for hashed filenames — if you see a short max-age, check your hosting platform\'s default static-file headers or CDN caching rules.',
            'For dynamic HTML/API responses that are user-specific, make sure they are **not** cached publicly:',
            '```\nCache-Control: private, no-store\n```',
          ].join('\n\n'),
    evidence: { pageCacheControl: pageCacheControl ?? null, assetUrl, assetCacheControl: assetCacheControl ?? null },
  };
}
