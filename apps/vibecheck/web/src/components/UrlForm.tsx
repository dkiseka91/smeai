import { useState, type FormEvent } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

interface Props {
  onSubmit: (url: string) => void;
  loading: boolean;
  error: string | null;
}

function normalize(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export default function UrlForm({ onSubmit, loading, error }: Props) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const url = normalize(value);
    if (!url) return;
    onSubmit(url);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          inputMode="url"
          autoFocus
          placeholder="yourapp.com"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={loading}
          className="flex-1 rounded-xl bg-surface border border-border px-4 py-3.5 text-base placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-medium text-white shadow-glow hover:bg-primary/90 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
          {loading ? 'Starting…' : 'Run Audit'}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-fail">{error}</p>}
      <p className="mt-3 text-xs text-ink-muted text-center sm:text-left">
        11 automated checks across security, performance, resiliency &amp; infrastructure — usually done in under 30 seconds.
      </p>
    </form>
  );
}
