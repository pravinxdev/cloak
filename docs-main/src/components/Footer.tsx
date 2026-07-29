import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, MessageCircle, Heart } from 'lucide-react';
import { footerColumns, footerExternalLinks } from '@/data/footer';
import { githubUrl } from '@/data/nav';
import { Logo } from '@/components/ui/Logo';

function isExternal(to: string) {
  return /^https?:\/\//.test(to);
}

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-card/30 backdrop-blur-sm">
      <div className="container-px py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2.6fr]">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="max-w-sm text-sm leading-relaxed text-muted">
              Open-source secret management for modern developers. Encrypted,
              local-first, and built to keep your keys out of your code.
            </p>
            <div className="flex items-center gap-2">
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="GitHub"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card/60 text-muted transition-colors hover:border-primary-500/60 hover:text-ink"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Twitter"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card/60 text-muted transition-colors hover:border-primary-500/60 hover:text-ink"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card/60 text-muted transition-colors hover:border-primary-500/60 hover:text-ink"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/60 px-2.5 py-2 text-xs text-muted">
                <MessageCircle className="h-4 w-4" /> Discord
                <span className="rounded bg-white/5 px-1 py-0.5 text-[9px] uppercase">
                  Soon
                </span>
              </span>
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {isExternal(link.to) ? (
                        <a
                          href={link.to}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-sm text-muted transition-colors hover:text-ink"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          to={link.to}
                          className="text-sm text-muted transition-colors hover:text-ink"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* External quick links */}
        <div className="mt-12 flex flex-wrap items-center gap-2 border-t border-border pt-8">
          {footerExternalLinks.map((link) => (
            <a
              key={link.label}
              href={link.to}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center rounded-lg border border-border bg-card/40 px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-primary-500/50 hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} CloakX. MIT Licensed.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted">
            Built with <Heart className="h-3.5 w-3.5 text-primary-400" /> for
            developers
          </p>
        </div>
      </div>
    </footer>
  );
}
