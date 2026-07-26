import { CheckCircle2, AlertTriangle, XCircle, Loader2, Circle } from 'lucide-react';
import clsx from 'clsx';
import type { CheckStatus } from '@/lib/types';

type ExtendedStatus = CheckStatus | 'running' | 'pending';

const CONFIG: Record<ExtendedStatus, { label: string; icon: typeof CheckCircle2; classes: string }> = {
  pass: { label: 'Pass', icon: CheckCircle2, classes: 'bg-pass/15 text-pass border-pass/30' },
  warn: { label: 'Warning', icon: AlertTriangle, classes: 'bg-warn/15 text-warn border-warn/30' },
  fail: { label: 'Critical Fail', icon: XCircle, classes: 'bg-fail/15 text-fail border-fail/30' },
  running: { label: 'Running', icon: Loader2, classes: 'bg-accent/15 text-accent border-accent/30' },
  pending: { label: 'Queued', icon: Circle, classes: 'bg-ink-muted/10 text-ink-muted border-border' },
};

export default function StatusBadge({ status, size = 'md' }: { status: ExtendedStatus; size?: 'sm' | 'md' }) {
  const { label, icon: Icon, classes } = CONFIG[status];
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap',
        classes,
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      )}
    >
      <Icon size={size === 'sm' ? 11 : 13} className={status === 'running' ? 'animate-spin' : ''} />
      {label}
    </span>
  );
}
