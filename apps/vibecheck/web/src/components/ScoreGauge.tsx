import clsx from 'clsx';

function colorFor(score: number): string {
  if (score >= 80) return '#22C55E';
  if (score >= 50) return '#F5A623';
  return '#EF4444';
}

export default function ScoreGauge({ score, size = 160 }: { score: number | null; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = score ?? 0;
  const offset = circumference * (1 - pct / 100);
  const color = colorFor(pct);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={12} fill="none" className="text-surface-alt" />
        {score !== null && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={12}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {score !== null ? (
          <>
            <span className={clsx('text-4xl font-bold tabular-nums')} style={{ color }}>
              {score}
            </span>
            <span className="text-xs text-ink-muted mt-0.5">/ 100</span>
          </>
        ) : (
          <span className="text-sm text-ink-muted animate-pulse">Auditing…</span>
        )}
      </div>
    </div>
  );
}
