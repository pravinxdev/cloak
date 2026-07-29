import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Github, Terminal } from 'lucide-react';
import { CopyButton } from '@/components/ui/CopyButton';
import { githubUrl } from '@/data/nav';

export function CTA() {
  return (
    <section className="section-pad relative">
      <div className="container-px">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl border border-border bg-card/50 px-6 py-14 text-center backdrop-blur-md sm:px-12"
        >
          {/* Glow */}
          <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary-600/25 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 bg-grid-pattern bg-grid [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] opacity-40" />

          <div className="relative">
            <span className="badge">
              <Terminal className="h-3.5 w-3.5 text-primary-400" />
              Start in seconds
            </span>
            <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Take control of your secrets today
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted">
              Install CloakX, unlock your vault, and stop hardcoding keys.
              Free, open-source, and fully local.
            </p>

            <div className="mx-auto mt-8 flex max-w-md items-center justify-between gap-3 rounded-xl border border-border bg-[#0b0e14] px-4 py-3">
              <code className="font-mono text-sm text-ink">
                <span className="text-primary-400">$ </span>npm install -g cloakx
              </code>
              <CopyButton value="npm install -g cloakx" />
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/installation" className="btn-primary group">
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="btn-secondary"
              >
                <Github className="h-4 w-4" />
                Star on GitHub
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
