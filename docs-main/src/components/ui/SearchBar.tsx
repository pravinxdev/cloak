import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search…',
  className = '',
  autoFocus = false,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  return (
    <div
      className={`relative flex items-center transition-all duration-200 ${className}`}
    >
      <div
        className={`pointer-events-none absolute left-3.5 transition-colors ${
          focused ? 'text-primary-400' : 'text-muted'
        }`}
      >
        <Search className="h-4 w-4" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={`w-full rounded-xl border bg-card/60 py-3 pl-10 pr-10 text-sm text-ink placeholder:text-muted/70 backdrop-blur-sm transition-all duration-200 focus:outline-none ${
          focused
            ? 'border-primary-500/70 shadow-glow'
            : 'border-border hover:border-primary-500/40'
        }`}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
          className="absolute right-3 text-muted transition-colors hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
