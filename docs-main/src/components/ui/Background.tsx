import { motion } from 'framer-motion';

/**
 * Decorative full-page background: grid, gradient blobs, and a subtle vignette.
 * Fixed behind all content.
 */
export function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      {/* Grid */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

      {/* Top hero glow */}
      <div className="absolute inset-x-0 top-[-10%] h-[60vh] bg-hero-glow" />

      {/* Floating gradient blobs */}
      <motion.div
        className="absolute left-[-10%] top-[20%] h-[28rem] w-[28rem] rounded-full bg-primary-700/20 blur-[120px]"
        animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-[-8%] top-[40%] h-[24rem] w-[24rem] rounded-full bg-accent-500/15 blur-[120px]"
        animate={{ y: [0, 40, 0], x: [0, -20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[10%] left-[30%] h-[22rem] w-[22rem] rounded-full bg-success-500/10 blur-[130px]"
        animate={{ y: [0, -25, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(9,9,11,0.6)_100%)]" />
    </div>
  );
}
