import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { architectureFlow } from '@/data/architecture';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function Architecture() {
  return (
    <section id="architecture" className="section-pad relative">
      <div className="container-px">
        <SectionHeading
          eyebrow="Architecture"
          title="How a secret flows through CloakX"
          description="From your keystroke to an injected environment variable — every hop keeps the secret encrypted until the very last moment."
        />

        <div className="mx-auto mt-16 flex max-w-2xl flex-col items-center gap-3">
          {architectureFlow.map((node, i) => {
            const Icon = node.icon;
            const isLast = i === architectureFlow.length - 1;
            return (
              <div key={node.id} className="flex w-full flex-col items-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: 0.05 }}
                  className="group relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card/50 p-5 backdrop-blur-sm transition-colors hover:border-primary-500/50"
                >
                  <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary-600/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="flex items-center gap-4">
                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-gradient-to-br from-primary-600/20 to-primary-800/10 text-primary-400">
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink">{node.label}</h3>
                      <p className="mt-0.5 text-sm leading-relaxed text-muted">
                        {node.description}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {!isLast && (
                  <motion.div
                    initial={{ opacity: 0, scaleY: 0 }}
                    whileInView={{ opacity: 1, scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="flex flex-col items-center py-1"
                  >
                    <div className="h-6 w-px bg-gradient-to-b from-primary-500/60 to-primary-500/10" />
                    <ArrowDown className="h-4 w-4 text-primary-500/70" />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
