import type { ProgressEvent, Report } from './types';

const API_BASE = import.meta.env.VITE_VIBECHECK_API_URL ?? '';

export class ApiError extends Error {}

export async function startAudit(url: string): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/api/audit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error ?? `Request failed (${res.status})`);
  return data;
}

export async function fetchReport(id: string): Promise<Report> {
  const res = await fetch(`${API_BASE}/api/audit/${id}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error ?? `Request failed (${res.status})`);
  return data;
}

export function subscribeAuditEvents(id: string, onEvent: (event: ProgressEvent) => void): () => void {
  const source = new EventSource(`${API_BASE}/api/audit/${id}/events`);
  source.onmessage = (msg) => {
    try {
      onEvent(JSON.parse(msg.data) as ProgressEvent);
    } catch {
      // ignore malformed frames (e.g. heartbeat comments never reach onmessage)
    }
  };
  return () => source.close();
}
