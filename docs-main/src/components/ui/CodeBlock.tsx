import { useState } from 'react';
import { CopyButton } from './CopyButton';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  className?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  code,
  language = 'bash',
  filename,
  className = '',
  showLineNumbers = false,
}: CodeBlockProps) {
  const [hovered, setHovered] = useState(false);
  const lines = code.split('\n');

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-border bg-[#0b0e14] ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center justify-between border-b border-border/70 bg-white/[0.02] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
          </div>
          {filename && (
            <span className="ml-3 font-mono text-xs text-muted">{filename}</span>
          )}
        </div>
        <div
          className={`transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-60'}`}
        >
          <CopyButton value={code} />
        </div>
      </div>
      <div className="overflow-x-auto p-4">
        <pre className="font-mono text-sm leading-relaxed">
          <code className={`language-${language}`}>
            {showLineNumbers ? (
              lines.map((line, i) => (
                <div key={i} className="table-row">
                  <span className="table-cell select-none pr-4 text-right text-muted/40">
                    {i + 1}
                  </span>
                  <span className="table-cell text-ink/90">{line || ' '}</span>
                </div>
              ))
            ) : (
              <span className="text-ink/90">{code}</span>
            )}
          </code>
        </pre>
      </div>
    </div>
  );
}
