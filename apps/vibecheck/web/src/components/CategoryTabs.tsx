import clsx from 'clsx';
import { CATEGORY_LABELS, CATEGORY_ORDER, type Category, type Finding } from '@/lib/types';

interface Props {
  findings: Finding[];
  categoryScores: Record<Category, number> | null;
  active: Category | 'all';
  onChange: (category: Category | 'all') => void;
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-pass';
  if (score >= 50) return 'text-warn';
  return 'text-fail';
}

export default function CategoryTabs({ findings, categoryScores, active, onChange }: Props) {
  const tabs: Array<{ key: Category | 'all'; label: string }> = [
    { key: 'all', label: 'All Checks' },
    ...CATEGORY_ORDER.map((c) => ({ key: c, label: CATEGORY_LABELS[c] })),
  ];

  return (
    <div className="flex flex-wrap gap-2 border-b border-border pb-3 mb-6">
      {tabs.map((tab) => {
        const count = tab.key === 'all' ? findings.length : findings.filter((f) => f.category === tab.key).length;
        const score = tab.key !== 'all' ? categoryScores?.[tab.key] : undefined;
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={clsx(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors border',
              isActive ? 'bg-surface-alt border-primary/50 text-ink' : 'border-transparent text-ink-muted hover:text-ink hover:bg-surface'
            )}
          >
            {tab.label}
            <span className="text-[11px] text-ink-muted">({count})</span>
            {score !== undefined && <span className={clsx('text-[11px] font-semibold tabular-nums', scoreColor(score))}>{score}%</span>}
          </button>
        );
      })}
    </div>
  );
}
