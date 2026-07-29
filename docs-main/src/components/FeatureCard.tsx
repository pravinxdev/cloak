import { motion } from 'framer-motion';
import type { Feature } from '@/data/features';
import { CopyButton } from '@/components/ui/CopyButton';

interface FeatureCardProps {
  feature: Feature;
  index: number;
}

export function FeatureCard({ feature, index }: FeatureCardProps) {
  const Icon = feature.icon;
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-colors duration-300 hover:border-primary-500/50"
    >
      {/* Glow on hover */}
      <div className="pointer-events-none absolute -inset-px -z-10 rounded-2xl bg-gradient-to-b from-primary-600/0 to-primary-600/0 opacity-0 transition-opacity duration-300 group-hover:from-primary-600/10 group-hover:to-transparent group-hover:opacity-100" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary-600/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex items-start justify-between">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-gradient-to-br from-primary-600/20 to-primary-800/10 text-primary-400 transition-all duration-300 group-hover:scale-110 group-hover:border-primary-500/60 group-hover:text-primary-300 group-hover:shadow-glow">
          <Icon className="h-6 w-6" strokeWidth={1.9} />
        </div>
        {feature.comingSoon && (
          <span className="rounded-full border border-success-500/30 bg-success-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-success-400">
            Soon
          </span>
        )}
      </div>

      <h3 className="mt-5 text-lg font-semibold text-ink transition-colors group-hover:text-white">
        {feature.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {feature.description}
      </p>

      <div className="mt-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <CopyButton value={feature.title} label="Copy" className="text-[11px]" />
      </div>
    </motion.article>
  );
}
