import type { CheckFn, CheckMeta } from '../../lib/types';
import { checkSecurityHeaders } from './securityHeaders';
import { checkSsl } from './ssl';
import { checkCors } from './cors';
import { checkExposedAssets } from './exposedAssets';
import { checkCdnEdge } from './cdnEdge';
import { checkCacheControl } from './cacheControl';
import { checkCompressionLatency } from './compressionLatency';
import { checkRateLimiting } from './rateLimiting';
import { checkErrorHandling } from './errorHandling';
import { checkWaf } from './waf';
import { checkEndpointDiscovery } from './endpointDiscovery';

export const CHECKS: Array<CheckMeta & { run: CheckFn }> = [
  { id: 'security-headers', label: 'Security Headers', category: 'security', weight: 10, run: checkSecurityHeaders },
  { id: 'ssl', label: 'SSL/TLS & HTTPS Enforcement', category: 'security', weight: 10, run: checkSsl },
  { id: 'cors', label: 'CORS Policy', category: 'security', weight: 8, run: checkCors },
  { id: 'exposed-assets', label: 'Exposed Sensitive Files', category: 'security', weight: 12, run: checkExposedAssets },

  { id: 'cdn-edge', label: 'CDN & Edge Network', category: 'performance', weight: 6, run: checkCdnEdge },
  { id: 'cache-control', label: 'Cache-Control Strategy', category: 'performance', weight: 6, run: checkCacheControl },
  { id: 'compression-latency', label: 'Compression & TTFB', category: 'performance', weight: 6, run: checkCompressionLatency },

  { id: 'rate-limiting', label: 'Rate Limiting', category: 'resiliency', weight: 10, run: checkRateLimiting },
  { id: 'error-handling', label: 'Error & 404 Handling', category: 'resiliency', weight: 10, run: checkErrorHandling },

  { id: 'waf', label: 'WAF & DDoS Protection', category: 'infrastructure', weight: 6, run: checkWaf },
  { id: 'endpoint-discovery', label: 'Leaked Keys & API Surface', category: 'infrastructure', weight: 16, run: checkEndpointDiscovery },
];

export function checksMeta(): CheckMeta[] {
  return CHECKS.map(({ id, label, category, weight }) => ({ id, label, category, weight }));
}
