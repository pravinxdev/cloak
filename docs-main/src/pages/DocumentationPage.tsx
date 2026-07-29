import { useMemo, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import { docs, type DocEntry } from '@/data/docs';
import { SearchBar } from '@/components/ui/SearchBar';
import { PageHeader } from '@/components/ui/PageHeader';

const categories: DocEntry['category'][] = [
  'Getting Started',
  'Guides',
  'Reference',
];

function groupedDocs() {
  return categories.map((cat) => ({
    category: cat,
    items: docs.filter((d) => d.category === cat),
  }));
}

export function DocumentationPage() {
  const { slug } = useParams<{ slug: string }>();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.body.some((p) => p.toLowerCase().includes(q))
    );
  }, [query]);

  const activeDoc = docs.find((d) => d.slug === slug) ?? docs[0];
  const activeIndex = docs.findIndex((d) => d.slug === activeDoc.slug);
  const prev = activeIndex > 0 ? docs[activeIndex - 1] : null;
  const next =
    activeIndex < docs.length - 1 ? docs[activeIndex + 1] : null;

  if (slug && !docs.some((d) => d.slug === slug)) {
    return <Navigate to="/docs" replace />;
  }

  const groups = groupedDocs();

  return (
    <>
      <PageHeader
        eyebrow="Documentation"
        title="CloakX Documentation"
        description="Everything you need to install, use, and understand CloakX — from your first vault to advanced configuration."
      />

      <section className="section-pad pt-4">
        <div className="container-px">
          <div className="grid gap-10 lg:grid-cols-[280px_1fr] lg:gap-12">
            {/* Sidebar */}
            <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-2">
              <SearchBar
                value={query}
                onChange={setQuery}
                placeholder="Search docs…"
              />
              <nav className="mt-6 space-y-6">
                {groups.map((group) => {
                  const items = filtered.filter((d) =>
                    group.items.includes(d)
                  );
                  if (items.length === 0) return null;
                  return (
                    <div key={group.category}>
                      <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-muted">
                        {group.category}
                      </h3>
                      <ul className="mt-2 space-y-0.5">
                        {items.map((doc) => {
                          const on = doc.slug === activeDoc.slug;
                          return (
                            <li key={doc.slug}>
                              <Link
                                to={`/docs/${doc.slug}`}
                                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                                  on
                                    ? 'bg-primary-600/10 text-primary-300'
                                    : 'text-muted hover:bg-white/[0.04] hover:text-ink'
                                }`}
                              >
                                <ChevronRight
                                  className={`h-3.5 w-3.5 shrink-0 ${
                                    on ? 'text-primary-400' : 'text-muted/60'
                                  }`}
                                />
                                {doc.title}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
                {filtered.length === 0 && (
                  <p className="px-2 text-sm text-muted">
                    No docs match “{query}”.
                  </p>
                )}
              </nav>
            </aside>

            {/* Content */}
            <article className="min-w-0">
              <motion.div
                key={activeDoc.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl border border-border bg-card/40 p-6 backdrop-blur-sm sm:p-10"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-primary-600/10 text-primary-400">
                    <activeDoc.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary-400">
                      {activeDoc.category}
                    </span>
                    <h1 className="text-2xl font-bold text-ink sm:text-3xl">
                      {activeDoc.title}
                    </h1>
                  </div>
                </div>

                <p className="mt-5 text-base leading-relaxed text-muted">
                  {activeDoc.description}
                </p>

                <div className="mt-8 space-y-5">
                  {activeDoc.body.map((para, i) => (
                    <p
                      key={i}
                      className="text-[15px] leading-[1.75] text-ink/85"
                    >
                      {para}
                    </p>
                  ))}
                </div>

                {/* Example callout */}
                <div className="mt-8 rounded-xl border border-border bg-[#0b0e14] p-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                    <BookOpen className="h-3.5 w-3.5 text-primary-400" />
                    Try it
                  </div>
                  <pre className="mt-3 overflow-x-auto font-mono text-sm text-ink/90">
                    <span className="text-success-400">$ </span>
                    cloakx {activeDoc.slug === 'introduction' ? 'status' : 'help'}
                  </pre>
                </div>
              </motion.div>

              {/* Prev / next */}
              <div className="mt-8 flex items-center justify-between gap-4">
                {prev ? (
                  <Link
                    to={`/docs/${prev.slug}`}
                    className="group flex flex-1 items-center gap-3 rounded-xl border border-border bg-card/40 p-4 transition-colors hover:border-primary-500/40"
                  >
                    <ArrowLeft className="h-4 w-4 text-muted transition-colors group-hover:text-primary-400" />
                    <span>
                      <span className="block text-xs text-muted">Previous</span>
                      <span className="block text-sm font-semibold text-ink">
                        {prev.title}
                      </span>
                    </span>
                  </Link>
                ) : (
                  <span className="flex-1" />
                )}
                {next ? (
                  <Link
                    to={`/docs/${next.slug}`}
                    className="group flex flex-1 items-center justify-end gap-3 rounded-xl border border-border bg-card/40 p-4 text-right transition-colors hover:border-primary-500/40"
                  >
                    <span>
                      <span className="block text-xs text-muted">Next</span>
                      <span className="block text-sm font-semibold text-ink">
                        {next.title}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted transition-colors group-hover:text-primary-400" />
                  </Link>
                ) : (
                  <span className="flex-1" />
                )}
              </div>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
