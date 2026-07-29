import { motion } from 'framer-motion';
import type { CliCommand } from '@/data/commands';
import { CopyButton } from '@/components/ui/CopyButton';

interface CommandCardProps {
  command: CliCommand;
  index: number;
}

export function CommandCard({ command, index }: CommandCardProps) {
  const Icon = command.icon;
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.05 }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card/50 p-5 backdrop-blur-sm transition-colors duration-300 hover:border-primary-500/50"
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary-600/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-gradient-to-br from-primary-600/20 to-primary-800/10 text-primary-400 transition-all duration-300 group-hover:scale-110 group-hover:border-primary-500/60">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <CopyButton value={command.command} />
      </div>
      <h3 className="mt-4 font-mono text-sm font-semibold text-ink">
        {command.command}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        {command.description}
      </p>
    </motion.article>
  );
}
