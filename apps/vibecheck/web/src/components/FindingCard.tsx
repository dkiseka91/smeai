import { useState, type ReactNode } from 'react';
import { ChevronDown, Search, TriangleAlert, Wrench } from 'lucide-react';
import clsx from 'clsx';
import type { Finding } from '@/lib/types';
import StatusBadge from './StatusBadge';
import { MarkdownLite } from '@/lib/markdownLite';

const BORDER_BY_STATUS: Record<Finding['status'], string> = {
  pass: 'border-l-pass',
  warn: 'border-l-warn',
  fail: 'border-l-fail',
};

export default function FindingCard({ finding }: { finding: Finding }) {
  const [showEvidence, setShowEvidence] = useState(false);

  return (
    <div className={clsx('rounded-xl border border-border bg-surface border-l-4', BORDER_BY_STATUS[finding.status])}>
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-ink">{finding.label}</h3>
          <StatusBadge status={finding.status} />
        </div>
        <p className="text-xs text-ink-muted font-mono mb-4">{finding.summary}</p>

        <div className="space-y-4">
          <Section icon={Search} title="What was detected">
            <MarkdownLite text={finding.problem} />
          </Section>
          <Section icon={TriangleAlert} title="Why it matters">
            <MarkdownLite text={finding.risk} />
          </Section>
          <Section icon={Wrench} title="How to fix it">
            <MarkdownLite text={finding.solution} />
          </Section>
        </div>

        {finding.evidence && (
          <div className="mt-4">
            <button
              onClick={() => setShowEvidence((v) => !v)}
              className="flex items-center gap-1 text-xs text-ink-muted hover:text-ink transition-colors"
            >
              <ChevronDown size={13} className={clsx('transition-transform', showEvidence && 'rotate-180')} />
              {showEvidence ? 'Hide' : 'Show'} raw evidence
            </button>
            {showEvidence && (
              <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-bg border border-border p-3 text-[11px] text-ink-muted scrollbar-thin">
                {JSON.stringify(finding.evidence, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: typeof Search; title: string; children: ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
        <Icon size={13} />
        {title}
      </div>
      {children}
    </div>
  );
}
