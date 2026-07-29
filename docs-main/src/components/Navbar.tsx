import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Github, Menu, X } from 'lucide-react';
import { navItems, githubUrl } from '@/data/nav';
import { Logo } from '@/components/ui/Logo';

function isExternal(to: string) {
  return /^https?:\/\//.test(to);
}

function isActive(to: string, pathname: string) {
  const base = to.split('#')[0];
  if (!base || base === '/') return pathname === '/';
  return pathname === base;
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <motion.div
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`border-b transition-all duration-300 ${
          scrolled
            ? 'border-border/80 glass-strong'
            : 'border-transparent bg-transparent'
        }`}
      >
        <nav className="container-px flex h-16 items-center justify-between gap-4">
          <Link to="/" aria-label="CloakX home" className="shrink-0">
            <Logo />
          </Link>

          {/* Desktop nav */}
          <ul className="hidden items-center gap-0.5 xl:flex">
            {navItems.map((item) => {
              const external = isExternal(item.to);
              const active = isActive(item.to, location.pathname);
              const content = (
                <span
                  className={`relative inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active ? 'text-ink' : 'text-muted hover:text-ink'
                  }`}
                >
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-lg bg-white/[0.06] ring-1 ring-inset ring-white/5"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </span>
              );
              return (
                <li key={item.label}>
                  {external ? (
                    <a
                      href={item.to}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {content}
                    </a>
                  ) : (
                    <Link to={item.to}>{content}</Link>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="hidden items-center gap-2 rounded-xl border border-primary-500/40 bg-primary-600/10 px-3.5 py-2 text-sm font-semibold text-primary-300 transition-all duration-200 hover:border-primary-500/70 hover:bg-primary-600/20 hover:text-primary-200 sm:inline-flex"
            >
              <Github className="h-4 w-4" />
              GitHub
              <span className="rounded-md bg-primary-600/30 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-200">
                Star
              </span>
            </a>

            {/* Mobile toggle */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card/60 text-ink transition-colors hover:border-primary-500/60 xl:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </motion.div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-16 z-40 xl:hidden"
          >
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.nav
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="container-px relative max-h-[calc(100vh-4rem)] overflow-y-auto rounded-b-2xl border border-t-0 border-border bg-card/95 pb-8 pt-4 backdrop-blur-xl"
            >
              <ul className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const external = isExternal(item.to);
                  const active = isActive(item.to, location.pathname);
                  const content = (
                    <span
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                        active
                          ? 'bg-primary-600/10 text-primary-300'
                          : 'text-muted hover:bg-white/[0.04] hover:text-ink'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </span>
                  );
                  return (
                    <li key={item.label}>
                      {external ? (
                        <a
                          href={item.to}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          {content}
                        </a>
                      ) : (
                        <Link to={item.to}>{content}</Link>
                      )}
                    </li>
                  );
                })}
              </ul>
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary-500/50 bg-primary-600/15 px-4 py-3 text-sm font-semibold text-primary-200"
              >
                <Github className="h-4 w-4" />
                Star on GitHub
              </a>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
