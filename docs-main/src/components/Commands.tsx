import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TerminalSquare, Search as SearchIcon } from 'lucide-react';
import { cliCommands } from '@/data/commands';
import { CommandCard } from '@/components/CommandCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function Commands() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cliCommands;
    return cliCommands.filter(
      (c) =>
        c.command.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <section id="cli-commands" className="section-pad relative">
      <div className="container-px">
        <SectionHeading
          eyebrow="CLI Commands"
          title="A complete command-line interface"
          description="Every secret operation you need, one call away. Search the full reference below — each command is ready to copy."
        />

        <div className="mx-auto mt-10 max-w-xl">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search commands — try 'set', 'export', 'env'…"
          />
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted">
          <SearchIcon className="h-3.5 w-3.5" />
          <span>
            Showing {filtered.length} of {cliCommands.length} commands
          </span>
        </div>

        <motion.div
          layout
          className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((cmd, i) => (
              <motion.div
                key={cmd.command}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
              >
                <CommandCard command={cmd} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="mt-10 flex flex-col items-center gap-3 text-muted">
            <TerminalSquare className="h-8 w-8 opacity-50" />
            <p className="text-sm">No commands match “{query}”.</p>
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-sm font-medium text-primary-400 hover:text-primary-300"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
