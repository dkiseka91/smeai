import type { CheckMeta, CheckStatus } from '@/lib/types';
import StatusBadge from './StatusBadge';

export type LiveStatus = CheckStatus | 'running' | 'pending';

interface Props {
  checks: CheckMeta[];
  statuses: Record<string, LiveStatus>;
}

export default function ProgressChecklist({ checks, statuses }: Props) {
  return (
    <ul className="divide-y divide-border rounded-xl border border-border overflow-hidden bg-surface">
      {checks.map((check) => (
        <li key={check.id} className="flex items-center justify-between gap-3 px-4 py-3">
          <span className="text-sm text-ink">{check.label}</span>
          <StatusBadge status={statuses[check.id] ?? 'pending'} size="sm" />
        </li>
      ))}
    </ul>
  );
}
