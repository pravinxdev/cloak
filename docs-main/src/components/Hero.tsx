import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Github, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CopyButton } from '@/components/ui/CopyButton';
import { githubUrl } from '@/data/nav';
import { heroTerminal } from '@/data/content';

const installCommand = 'npm install -g cloakx';

function TerminalWindow() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40, rotateY: 8 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      className="perspective relative w-full"
    >
      {/* Glow */}
      <div className="absolute -inset-4 -z-10 rounded-3xl bg-primary-600/20 blur-3xl" />

      <div className="overflow-hidden rounded-2xl border border-border bg-[#0b0e14]/95 shadow-glow-lg backdrop-blur-xl">
        {/* Title bar */}
        <div className="flex items-center justify-between border-b border-border/70 bg-white/[0.02] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
            <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
            <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
          </div>
          <span className="font-mono text-xs text-muted">cloakx — zsh</span>
          <span className="w-12" />
        </div>

        {/* Body */}
        <div className="space-y-1.5 p-5 font-mono text-sm leading-relaxed">
          {heroTerminal.map((line, i) => {
            const delay = 0.5 + i * 0.28;
            if (line.type === 'command') {
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay }}
                  className="flex items-center gap-2"
                >
                  <span className="text-success-400">$</span>
                  <span className="text-ink">{line.text}</span>
                </motion.div>
              );
            }
            if (line.type === 'success') {
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay }}
                  className="pl-4 text-success-400"
                >
                  {line.text}
                </motion.div>
              );
            }
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay }}
                className="pl-4 text-primary-300/90"
              >
                {line.text}
              </motion.div>
            );
          })}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + heroTerminal.length * 0.28 }}
            className="mt-2 inline-block h-4 w-2 animate-blink bg-primary-400 align-middle"
          />
        </div>
      </div>
    </motion.div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-36 lg:pt-40 lg:pb-28">
      <div className="container-px grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left */}
        <div className="flex flex-col items-start gap-6">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="badge"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary-400" />
            Open Source Secret Management Platform
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl lg:leading-[1.05]"
          >
            <span className="text-gradient">CloakX</span>
            <br />
            <span className="text-gradient">
              Secure Secret Management
            </span>
            <br />
            <span className="text-gradient-blue">for Modern Developers</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="max-w-xl text-base leading-relaxed text-muted sm:text-lg"
          >
            CloakX is an open-source secret management platform that helps
            developers securely manage API keys, passwords, tokens,
            certificates and environment variables using a powerful CLI,
            beautiful Web Dashboard and VS Code Extension.
          </motion.p>

          {/* Install command */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="group relative w-full max-w-lg"
          >
            <div className="absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-r from-primary-600/40 to-accent-500/30 opacity-60 blur-lg transition-opacity group-hover:opacity-100" />
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-[#0b0e14] px-4 py-3.5">
              <code className="flex items-center gap-2.5 font-mono text-sm text-ink">
                <span className="select-none text-primary-400">$</span>
                <span className="text-muted">npm install -g cloakx</span>
              </code>
              <CopyButton value={installCommand} />
            </div>
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="flex flex-wrap items-center gap-3"
          >
            <Link to="/installation" className="btn-primary group">
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="btn-secondary group"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
            <Link to="/docs" className="btn-ghost group">
              <BookOpen className="h-4 w-4" />
              View Documentation
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>

        {/* Right: terminal */}
        <div className="relative">
          <TerminalWindow />
        </div>
      </div>
    </section>
  );
}
