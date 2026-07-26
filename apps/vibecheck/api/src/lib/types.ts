export type CheckStatus = 'pass' | 'warn' | 'fail';

export type Category = 'security' | 'performance' | 'resiliency' | 'infrastructure';

export const CATEGORY_LABELS: Record<Category, string> = {
  security: 'Security & Perimeter Defenses',
  performance: 'Performance, Edge & Caching',
  resiliency: 'Resiliency & Traffic Controls',
  infrastructure: 'Infrastructure & Observability',
};

export interface CheckMeta {
  id: string;
  label: string;
  category: Category;
  weight: number;
}

export interface Finding {
  id: string;
  label: string;
  category: Category;
  status: CheckStatus;
  weight: number;
  /** Short technical one-liner, e.g. "3 of 6 recommended headers present" */
  summary: string;
  /** Plain-English: what was detected */
  problem: string;
  /** Plain-English: why it matters in production */
  risk: string;
  /** Markdown with copy-paste snippets / dashboard steps */
  solution: string;
  /** Raw evidence for the "show details" view */
  evidence?: Record<string, unknown>;
}

export type RunStatus = 'pending' | 'running' | 'complete' | 'error';

export interface Report {
  id: string;
  url: string;
  createdAt: string;
  completedAt: string | null;
  status: RunStatus;
  score: number | null;
  categoryScores: Record<Category, number> | null;
  findings: Finding[];
  error: string | null;
}

export type ProgressEvent =
  | { type: 'run:start'; id: string; url: string; checks: CheckMeta[] }
  | { type: 'check:start'; id: string; checkId: string }
  | { type: 'check:complete'; id: string; finding: Finding }
  | { type: 'run:complete'; id: string; report: Report }
  | { type: 'run:error'; id: string; message: string };

export interface CheckContext {
  url: URL;
  baseOrigin: string;
  signal?: AbortSignal;
}

export type CheckFn = (ctx: CheckContext) => Promise<Omit<Finding, 'id' | 'label' | 'category' | 'weight'>>;
