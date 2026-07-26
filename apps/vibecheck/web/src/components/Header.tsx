import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary group-hover:bg-primary/25 transition-colors">
            <Zap size={18} strokeWidth={2.5} />
          </span>
          <span className="font-semibold tracking-tight text-lg">
            Vibe<span className="text-primary">Check</span>
          </span>
        </Link>
        <span className="text-xs text-ink-muted hidden sm:block">Production readiness auditor for vibecoders</span>
      </div>
    </header>
  );
}
