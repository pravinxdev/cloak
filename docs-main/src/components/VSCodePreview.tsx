import { motion } from 'framer-motion';
import { Search, ChevronRight, Shield, KeyRound, Copy, Sparkles } from 'lucide-react';
import { vscodeFeatures } from '@/data/content';
import { SectionHeading } from '@/components/ui/SectionHeading';

function VSCodeMockup() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-[#1e1e1e] shadow-card">
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-black/40 bg-[#323233] px-3 py-2">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
        </div>
        <span className="ml-2 text-[11px] text-white/60">server.ts — CloakX</span>
      </div>

      <div className="flex">
        {/* Activity bar */}
        <div className="flex w-12 flex-col items-center gap-4 border-r border-black/40 bg-[#333333] py-4">
          <Shield className="h-5 w-5 text-primary-400" />
          <KeyRound className="h-5 w-5 text-white/40" />
          <Search className="h-5 w-5 text-white/40" />
        </div>

        {/* Explorer */}
        <div className="hidden w-44 border-r border-black/40 bg-[#252526] p-2 sm:block">
          <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-white/40">
            Explorer
          </div>
          <div className="mt-2 space-y-0.5 text-[11px] text-white/70">
            {['src', '  server.ts', '  config.ts', '  auth.ts', '.env', 'package.json'].map(
              (f, i) => (
                <div
                  key={f}
                  className={`flex items-center gap-1 rounded px-2 py-1 ${
                    i === 1 ? 'bg-primary-600/20 text-white' : ''
                  }`}
                >
                  {f.startsWith('  ') ? (
                    <span className="text-white/40">›</span>
                  ) : (
                    <ChevronRight className="h-3 w-3 text-white/40" />
                  )}
                  <span className={f.startsWith('  ') ? 'pl-2' : ''}>
                    {f.trim()}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Editor + palette */}
        <div className="relative flex-1 bg-[#1e1e1e] p-4">
          <div className="font-mono text-[11px] leading-relaxed">
            <div><span className="text-white/40">1</span> <span className="text-[#569cd6]">import</span> <span className="text-white">{`{ app }`}</span> <span className="text-[#569cd6]">from</span> <span className="text-[#ce9178]">'./config'</span></div>
            <div><span className="text-white/40">2</span></div>
            <div><span className="text-white/40">3</span> <span className="text-[#569cd6]">const</span> <span className="text-[#4ec9b0]">port</span> <span className="text-white">=</span> <span className="text-[#b5cea8]">3000</span></div>
            <div>
              <span className="text-white/40">4</span> <span className="text-[#569cd6]">const</span> <span className="text-[#4ec9b0]">key</span> <span className="text-white">=</span> <span className="text-[#4ec9b0]">process</span>.<span className="text-[#4ec9b0]">env</span>.
              <span className="relative rounded bg-primary-600/30 px-1 text-primary-300">
                OPENAI
                <span className="absolute -bottom-5 left-0 z-10 w-40 rounded-md border border-primary-500/50 bg-[#252526] p-2 text-[10px] shadow-glow">
                  <div className="flex items-center gap-1.5 text-primary-300">
                    <Sparkles className="h-3 w-3" /> CloakX autocomplete
                  </div>
                  <div className="mt-1 space-y-0.5 text-white/70">
                    <div>OPENAI_KEY</div>
                    <div>OPENAI_ORG</div>
                  </div>
                </span>
              </span>
            </div>
            <div className="mt-6"><span className="text-white/40">5</span> <span className="text-[#4ec9b0]">app</span>.<span className="text-[#dcdcaa]">listen</span>(<span className="text-[#4ec9b0]">port</span>)</div>
          </div>

          {/* Command palette */}
          <div className="mt-4 rounded-lg border border-primary-500/40 bg-[#252526] p-2 shadow-glow">
            <div className="flex items-center gap-2 px-1 text-[10px] text-white/50">
              <Search className="h-3 w-3" /> CloakX: Insert Secret
            </div>
            <div className="mt-1.5 space-y-0.5">
              {[
                { k: 'OPENAI_KEY', v: 'Insert value at cursor' },
                { k: 'DATABASE_URL', v: 'Copy to clipboard' },
                { k: 'JWT_SECRET', v: 'Rotate secret' },
              ].map((r) => (
                <div
                  key={r.k}
                  className="flex items-center justify-between rounded px-2 py-1 text-[10px] hover:bg-primary-600/20"
                >
                  <span className="flex items-center gap-1.5 font-mono text-white/80">
                    <KeyRound className="h-3 w-3 text-primary-400" />
                    {r.k}
                  </span>
                  <span className="flex items-center gap-1 text-white/40">
                    {r.v} <Copy className="h-3 w-3" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VSCodePreview() {
  return (
    <section id="vscode-preview" className="section-pad relative">
      <div className="container-px">
        <SectionHeading
          eyebrow="VS Code Extension"
          title="Stay in flow, never leave your editor"
          description="Autocomplete secret names, insert values, and run CloakX commands straight from VS Code — the vault travels with your code."
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <VSCodeMockup />
          </motion.div>

          <div className="space-y-4">
            {vscodeFeatures.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="group rounded-xl border border-border bg-card/40 p-5 backdrop-blur-sm transition-colors hover:border-primary-500/40"
              >
                <h3 className="font-semibold text-ink">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
