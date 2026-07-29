import { motion } from 'framer-motion';
import { Check, Clock, Loader } from 'lucide-react';
import { roadmap, type RoadmapStatus } from '@/data/roadmap';
import { SectionHeading } from '@/components/ui/SectionHeading';

const statusConfig: Record<
  RoadmapStatus,
  { label: string; icon: typeof Check; color: string; ring: string; bg: string }
> = {
  completed: {
    label: 'Completed',
    icon: Check,
    color: 'text-success-400',
    ring: 'border-success-500/50',
    bg: 'bg-success-500/10',
  },
  current: {
    label: 'In Progress',
    icon: Loader,
    color: 'text-primary-300',
    ring: 'border-primary-500/60',
    bg: 'bg-primary-600/15',
  },
  coming: {
    label: 'Coming Soon',
    icon: Clock,
    color: 'text-muted',
    ring: 'border-border',
    bg: 'bg-white/[0.03]',
  },
};

export function Roadmap() {
  return (
    <section id="roadmap" className="section-pad relative">
      <div className="container-px">
        <SectionHeading
          eyebrow="Roadmap"
          title="Where CloakX is headed"
          description="The core is shipping today. Here is what is done, what's in flight, and what's coming next."
        />

        {/* Legend */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {(Object.keys(statusConfig) as RoadmapStatus[]).map((key) => {
            const cfg = statusConfig[key];
            const Icon = cfg.icon;
            return (
              <span
                key={key}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1.5 text-xs font-medium text-muted"
              >
                <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                {cfg.label}
              </span>
            );
          })}
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {roadmap.map((item, i) => {
            const Icon = item.icon;
            const cfg = statusConfig[item.status];
            const StatusIcon = cfg.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.06 }}
                whileHover={{ y: -4 }}
                className={`group relative overflow-hidden rounded-2xl border bg-card/50 p-6 backdrop-blur-sm transition-colors ${cfg.ring} hover:bg-card/70`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border ${cfg.ring} ${cfg.bg} ${cfg.color} transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${cfg.ring} ${cfg.bg} ${cfg.color}`}
                  >
                    <StatusIcon
                      className={`h-3 w-3 ${
                        item.status === 'current' ? 'animate-spin-slow' : ''
                      }`}
                    />
                    {cfg.label}
                  </span>
                </div>
                <h3 className="mt-5 font-semibold text-ink">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
