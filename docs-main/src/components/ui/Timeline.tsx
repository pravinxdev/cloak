import { motion } from 'framer-motion';

export interface TimelineEntry {
  step: string;
  title: string;
  description: string;
}

interface TimelineProps {
  entries: TimelineEntry[];
  accent?: 'primary' | 'success';
}

export function Timeline({ entries, accent = 'primary' }: TimelineProps) {
  const color =
    accent === 'success'
      ? {
          dot: 'border-success-500/50 text-success-400',
          line: 'from-success-500/60 via-success-500/20',
        }
      : {
          dot: 'border-primary-500/50 text-primary-300',
          line: 'from-primary-500/60 via-primary-500/20',
        };

  return (
    <div className="relative">
      <div
        className={`absolute bottom-2 left-[19px] top-2 w-px bg-gradient-to-b ${color.line} to-transparent`}
      />
      <div className="space-y-6">
        {entries.map((entry, i) => (
          <motion.div
            key={entry.step}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: i * 0.1 }}
            className="relative flex gap-4"
          >
            <div
              className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background text-xs font-bold ${color.dot}`}
            >
              {entry.step}
            </div>
            <div className="flex-1 rounded-xl border border-border bg-card/40 p-4 backdrop-blur-sm">
              <h3 className="font-semibold text-ink">{entry.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {entry.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
