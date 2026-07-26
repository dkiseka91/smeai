import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Gauge, Activity, Radar } from 'lucide-react';
import UrlForm from '@/components/UrlForm';
import { startAudit, ApiError } from '@/lib/api';

const FEATURES = [
  { icon: ShieldCheck, title: 'Security & Perimeter', desc: 'Headers, TLS, CORS, and exposed .env/.git files.' },
  { icon: Gauge, title: 'Performance & Edge', desc: 'CDN detection, cache strategy, compression & TTFB.' },
  { icon: Activity, title: 'Resiliency', desc: 'Rate limiting and graceful error handling.' },
  { icon: Radar, title: 'Infrastructure', desc: 'WAF detection and leaked API keys in your JS bundle.' },
];

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const { id } = await startAudit(url);
      navigate(`/report/${id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong starting the audit.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      <section className="pt-16 sm:pt-24 pb-14 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-ink-muted mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-pass animate-pulse" />
          Built for AI-assisted "vibecoders" shipping fast
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
          Is your app actually <span className="text-primary">production ready?</span>
        </h1>
        <p className="text-ink-muted max-w-xl mx-auto mb-10 text-base sm:text-lg">
          Paste your URL. VibeCheck runs 11 automated security, performance and infrastructure checks and hands
          you a plain-English fix for every issue it finds.
        </p>
        <UrlForm onSubmit={handleSubmit} loading={loading} error={error} />
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-24">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-xl border border-border bg-surface p-5">
            <Icon className="text-primary mb-3" size={22} />
            <h3 className="font-medium text-sm mb-1">{title}</h3>
            <p className="text-xs text-ink-muted leading-relaxed">{desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
