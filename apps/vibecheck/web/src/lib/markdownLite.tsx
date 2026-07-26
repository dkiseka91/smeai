import type { ReactNode } from 'react';

/** Renders **bold** and `inline code` within a single line of plain text. */
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={`${keyPrefix}-${i}`}>{part.slice(1, -1)}</code>;
    }
    return <span key={`${keyPrefix}-${i}`}>{part}</span>;
  });
}

/**
 * Deliberately minimal Markdown renderer for solution text authored by the
 * audit engine (paragraphs, fenced code blocks, `-` lists, **bold**, `code`).
 * Not intended for arbitrary/untrusted Markdown.
 */
export function MarkdownLite({ text }: { text: string }) {
  const blocks = text.split(/```(\w*)\n?([\s\S]*?)```/g);
  const nodes: ReactNode[] = [];

  for (let i = 0; i < blocks.length; i++) {
    if (i % 3 === 0) {
      const chunk = blocks[i];
      if (!chunk?.trim()) continue;
      const paragraphs = chunk.split(/\n{2,}/).filter((p) => p.trim());
      paragraphs.forEach((para, pi) => {
        const lines = para.split('\n').filter((l) => l.trim());
        const isList = lines.every((l) => l.trim().startsWith('- '));
        if (isList) {
          nodes.push(
            <ul key={`ul-${i}-${pi}`} className="list-disc pl-5 space-y-1">
              {lines.map((line, li) => (
                <li key={li}>{renderInline(line.replace(/^-\s*/, ''), `li-${i}-${pi}-${li}`)}</li>
              ))}
            </ul>
          );
        } else {
          nodes.push(<p key={`p-${i}-${pi}`}>{renderInline(para, `p-${i}-${pi}`)}</p>);
        }
      });
    } else if (i % 3 === 1) {
      // language tag captured by the regex group; code content is the next item
      continue;
    } else {
      const lang = blocks[i - 1];
      nodes.push(
        <pre key={`pre-${i}`}>
          <code className={lang ? `language-${lang}` : undefined}>{blocks[i]}</code>
        </pre>
      );
    }
  }

  return <div className="prose-solution text-sm text-ink-muted">{nodes}</div>;
}
