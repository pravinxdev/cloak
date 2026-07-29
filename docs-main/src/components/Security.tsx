import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { securityFeatures, securityTimeline } from '@/data/security';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function Security() {
  return (
    <section id="security" className="section-pad relative">
      <div className="container-px">
        <SectionHeading
          eyebrow="Security"
          title="Encrypted by default, local by design"
          description="Your secrets never leave your machine in plaintext, are never written to disk unencrypted, and are wiped from memory when idle."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {securityFeatures.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-colors hover:border-success-500/40"
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-success-500/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-success-500/30 bg-success-500/10 text-success-400 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <h3 className="mt-4 font-semibold text-ink">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Timeline */}
        <div className="mx-auto mt-16 max-w-3xl">
          <div className="mb-8 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted">
            <ShieldCheck className="h-4 w-4 text-success-400" />
            The lifecycle of a secret
          </div>
          <div className="relative">
            <div className="absolute bottom-2 left-[19px] top-2 w-px bg-gradient-to-b from-success-500/60 via-success-500/20 to-transparent" />
            <div className="space-y-6">
              {securityTimeline.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: i * 0.1 }}
                  className="relative flex gap-4"
                >
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-success-500/50 bg-background text-xs font-bold text-success-400">
                    {step.step}
                  </div>
                  <div className="flex-1 rounded-xl border border-border bg-card/40 p-4 backdrop-blur-sm">
                    <h3 className="font-semibold text-ink">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
