export interface SafeFetchResult {
  ok: boolean;
  status: number;
  headers: Record<string, string>;
  text: string;
  ttfbMs: number;
  totalMs: number;
  error?: string;
  finalUrl: string;
  redirected: boolean;
}

export interface SafeFetchOptions extends RequestInit {
  timeoutMs?: number;
  maxBodyBytes?: number;
}

const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_MAX_BODY_BYTES = 2 * 1024 * 1024; // 2MB cap so we never buffer huge assets
const USER_AGENT = 'VibeCheckAuditor/1.0 (+https://vibecheck.aelevate.co.ug; automated production-readiness audit)';

/**
 * fetch() resolves as soon as response headers arrive, so the time to that
 * resolution is a solid proxy for TTFB without needing raw socket access.
 */
export async function safeFetch(url: string, options: SafeFetchOptions = {}): Promise<SafeFetchResult> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, maxBodyBytes = DEFAULT_MAX_BODY_BYTES, headers, ...rest } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const start = performance.now();

  try {
    const res = await fetch(url, {
      ...rest,
      redirect: rest.redirect ?? 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT, ...headers },
    });
    const ttfbMs = performance.now() - start;

    const reader = res.body?.getReader();
    let received = 0;
    const chunks: Uint8Array[] = [];
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          received += value.byteLength;
          if (received <= maxBodyBytes) chunks.push(value);
          if (received > maxBodyBytes) {
            await reader.cancel().catch(() => {});
            break;
          }
        }
      }
    }
    const text = Buffer.concat(chunks.map((c) => Buffer.from(c))).toString('utf-8');
    const totalMs = performance.now() - start;

    const headersObj: Record<string, string> = {};
    res.headers.forEach((v, k) => (headersObj[k] = v));

    return {
      ok: res.ok,
      status: res.status,
      headers: headersObj,
      text,
      ttfbMs: Math.round(ttfbMs),
      totalMs: Math.round(totalMs),
      finalUrl: res.url || url,
      redirected: res.redirected,
    };
  } catch (err) {
    const totalMs = performance.now() - start;
    return {
      ok: false,
      status: 0,
      headers: {},
      text: '',
      ttfbMs: Math.round(totalMs),
      totalMs: Math.round(totalMs),
      error: err instanceof Error ? (err.name === 'AbortError' ? 'Request timed out' : err.message) : 'Unknown fetch error',
      finalUrl: url,
      redirected: false,
    };
  } finally {
    clearTimeout(timer);
  }
}
