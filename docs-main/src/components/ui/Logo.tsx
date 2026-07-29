import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = '', showText = true }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <motion.span
        whileHover={{ rotate: -6, scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 shadow-glow"
      >
        <Shield className="h-5 w-5 text-white" strokeWidth={2.2} />
        <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />
      </motion.span>
      {showText && (
        <span className="text-lg font-bold tracking-tight text-ink">
          Cloak<span className="text-primary-400">X</span>
        </span>
      )}
    </span>
  );
}
