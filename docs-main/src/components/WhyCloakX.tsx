import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { problems } from '@/data/problems';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function WhyCloakX() {
  return (
    <section id="why" className="section-pad relative">
      <div className="container-px">
        <SectionHeading
          eyebrow="Why CloakX"
          title="The way secrets are handled today is broken"
          description="Hardcoded keys, scattered .env files, and credentials shared over chat. CloakX replaces all of it with one encrypted vault."
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
              className="group relative grid gap-5 rounded-2xl border border-border bg-card/40 p-6 backdrop-blur-sm transition-colors hover:border-primary-500/40 sm:grid-cols-[1fr_auto_1fr] sm:items-center"
            >
              {/* Problem */}
              <div>
                <div className="flex items-center gap-2 text-rose-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    The Problem
                  </span>
                </div>
                <h3 className="mt-2 font-semibold text-ink">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {p.description}
                </p>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center sm:flex-col">
                <motion.span
                  initial={{ x: -6, opacity: 0.6 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-500/40 bg-primary-600/15 text-primary-300"
                >
                  <ArrowRight className="h-4 w-4 sm:rotate-90" />
                </motion.span>
              </div>

              {/* Solution */}
              <div>
                <div className="flex items-center gap-2 text-success-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    With CloakX
                  </span>
                </div>
                <h3 className="mt-2 font-semibold text-ink">
                  {p.title} — solved
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {p.solution}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
