import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link2, Loader2, RefreshCw } from 'lucide-react';
import ScoreGauge from '@/components/ScoreGauge';
import ProgressChecklist, { type LiveStatus } from '@/components/ProgressChecklist';
import CategoryTabs from '@/components/CategoryTabs';
import FindingCard from '@/components/FindingCard';
import { fetchReport, subscribeAuditEvents } from '@/lib/api';
import type { CheckMeta, Category, Finding, Report } from '@/lib/types';

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [checksMeta, setChecksMeta] = useState<CheckMeta[]>([]);
  const [liveStatuses, setLiveStatuses] = useState<Record<string, LiveStatus>>({});
  const [liveFindings, setLiveFindings] = useState<Record<string, Finding>>({});
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [copied, setCopied] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    fetchReport(id)
      .then((initial) => {
        if (cancelled) return;
        setReport(initial);
        if (initial.status === 'complete' || initial.status === 'error') {
          if (initial.error) setError(initial.error);
          return;
        }
        unsubscribeRef.current = subscribeAuditEvents(id, (event) => {
          if (event.type === 'run:start') {
            setChecksMeta(event.checks);
            setLiveStatuses(Object.fromEntries(event.checks.map((c) => [c.id, 'pending' as LiveStatus])));
          } else if (event.type === 'check:start') {
            setLiveStatuses((prev) => ({ ...prev, [event.checkId]: 'running' }));
          } else if (event.type === 'check:complete') {
            setLiveStatuses((prev) => ({ ...prev, [event.finding.id]: event.finding.status }));
            setLiveFindings((prev) => ({ ...prev, [event.finding.id]: event.finding }));
          } else if (event.type === 'run:complete') {
            setReport(event.report);
            unsubscribeRef.current?.();
          } else if (event.type === 'run:error') {
            setError(event.message);
            unsubscribeRef.current?.();
          }
        });
      })
      .catch((err) => !cancelled && setError(err.message ?? 'Failed to load audit.'));

    return () => {
      cancelled = true;
      unsubscribeRef.current?.();
    };
  }, [id]);

  const isComplete = report?.status === 'complete';
  const findings = useMemo(() => (isComplete ? report!.findings : Object.values(liveFindings)), [isComplete, report, liveFindings]);
  const visibleFindings = useMemo(
    () => (activeCategory === 'all' ? findings : findings.filter((f) => f.category === activeCategory)),
    [findings, activeCategory]
  );

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-fail font-medium mb-2">Audit failed</p>
        <p className="text-ink-muted text-sm">{error}</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center py-32 text-ink-muted gap-2">
        <Loader2 className="animate-spin" size={18} /> Loading audit…
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <p className="text-xs text-ink-muted mb-1">Production Readiness Report</p>
          <h1 className="text-lg sm:text-xl font-semibold break-all">{report.url}</h1>
        </div>
        <button
          onClick={copyLink}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-ink-muted hover:text-ink hover:border-primary/50 transition-colors"
        >
          <Link2 size={13} />
          {copied ? 'Copied!' : 'Copy share link'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-8 mb-10 items-center">
        <ScoreGauge score={report.score} />
        <div>
          {isComplete ? (
            <>
              <p className="text-sm text-ink-muted mb-3">
                Overall production readiness score across {report.findings.length} automated checks.
              </p>
              <ScoreLegend />
            </>
          ) : (
            <>
              <p className="text-sm text-ink-muted mb-4 flex items-center gap-2">
                <RefreshCw className="animate-spin" size={14} />
                Running checks against your site — this usually takes 15-30 seconds.
              </p>
              {checksMeta.length > 0 && <ProgressChecklist checks={checksMeta} statuses={liveStatuses} />}
            </>
          )}
        </div>
      </div>

      {findings.length > 0 && (
        <>
          <CategoryTabs findings={findings} categoryScores={report.categoryScores} active={activeCategory} onChange={setActiveCategory} />
          <div className="space-y-4">
            {visibleFindings.map((finding) => (
              <FindingCard key={finding.id} finding={finding} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ScoreLegend() {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-muted">
      <LegendItem color="bg-pass" label="80-100 — Production ready" />
      <LegendItem color="bg-warn" label="50-79 — Needs attention" />
      <LegendItem color="bg-fail" label="0-49 — Critical gaps" />
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}
