import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFound() {
  return (
    <section className="flex min-h-screen items-center justify-center px-6 pt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-card/60 text-5xl font-extrabold text-primary-400 shadow-glow">
          404
        </div>
        <h1 className="text-3xl font-bold text-ink">Page not found</h1>
        <p className="mx-auto mt-3 max-w-md text-muted">
          The page you're looking for doesn't exist or has moved. Let's get you
          back on track.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/" className="btn-primary group">
            <Home className="h-4 w-4" />
            Back home
          </Link>
          <Link to="/docs" className="btn-secondary">
            <ArrowLeft className="h-4 w-4" />
            Read the docs
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
