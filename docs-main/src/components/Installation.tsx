import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { installSteps, packageManagers, systemRequirements } from '@/data/install';
import { CopyButton } from '@/components/ui/CopyButton';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function Installation() {
  return (
    <section id="installation" className="section-pad relative">
      <div className="container-px">
        <SectionHeading
          eyebrow="Installation"
          title="Up and running in under a minute"
          description="Install the CLI, unlock your vault, and store your first secret — five commands from zero to encrypted."
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* Steps */}
          <ol className="relative space-y-4">
            <div className="absolute bottom-2 left-[22px] top-2 w-px bg-gradient-to-b from-primary-500/50 via-primary-500/20 to-transparent" />
            {installSteps.map((step, i) => (
              <motion.li
                key={step.label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="relative flex gap-4"
              >
                <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary-500/50 bg-background text-sm font-bold text-primary-300">
                  {i + 1}
                </div>
                <div className="group flex-1 rounded-xl border border-border bg-card/50 p-4 backdrop-blur-sm transition-colors hover:border-primary-500/40">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-ink">{step.label}</h3>
                    <CopyButton value={step.command} />
                  </div>
                  <div className="mt-3 rounded-lg border border-border/70 bg-[#0b0e14] px-3 py-2.5">
                    <code className="font-mono text-sm text-ink">
                      <span className="text-primary-400">$ </span>
                      {step.command}
                    </code>
                  </div>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted">
                    {step.caption}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>

          {/* Sidebar: package managers + requirements */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-border bg-card/50 p-5 backdrop-blur-sm"
            >
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
                Package Managers
              </h3>
              <div className="mt-4 space-y-3">
                {packageManagers.map((pm) => (
                  <div
                    key={pm.name}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-[#0b0e14]/60 px-3 py-2.5"
                  >
                    <code className="font-mono text-xs text-ink">
                      <span className="text-primary-400">$ </span>
                      {pm.command}
                    </code>
                    <CopyButton value={pm.command} label="" />
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl border border-border bg-card/50 p-5 backdrop-blur-sm"
            >
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
                Requirements
              </h3>
              <ul className="mt-4 space-y-2.5">
                {systemRequirements.map((req) => (
                  <li key={req} className="flex items-start gap-2.5 text-sm text-muted">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success-400" />
                    {req}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
