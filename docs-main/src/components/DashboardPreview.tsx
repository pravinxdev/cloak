import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Search,
  KeyRound,
  Boxes,
  Settings,
  FileCode2,
  ArrowLeftRight,
  Shield,
  Plus,
  MoreHorizontal,
  CircleUser,
} from 'lucide-react';
import { dashboardScreens } from '@/data/content';
import { SectionHeading } from '@/components/ui/SectionHeading';

function BrowserFrame({
  url,
  children,
  title,
}: {
  url: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <div className="flex items-center gap-3 border-b border-border/70 bg-white/[0.02] px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
        </div>
        <div className="mx-auto flex w-full max-w-sm items-center justify-center rounded-md border border-border/60 bg-background/60 px-3 py-1 text-xs text-muted">
          <Lock className="mr-1.5 h-3 w-3 text-success-400" />
          {url}
        </div>
        <span className="w-6" />
      </div>
      <div className="aspect-[16/10] overflow-hidden bg-background">
        <AnimatePresence mode="wait">
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------- Mock screens ---------- */

function ScreenLogin() {
  return (
    <div className="flex h-full items-center justify-center bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.15),transparent_60%)] p-6">
      <div className="w-full max-w-xs rounded-2xl border border-border bg-card/80 p-6 backdrop-blur">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 shadow-glow">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-center text-sm font-semibold text-ink">Unlock Vault</h3>
        <p className="mt-1 text-center text-xs text-muted">default vault</p>
        <div className="mt-4 space-y-2.5">
          <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted">
            ••••••••••••
          </div>
          <button className="w-full rounded-lg bg-primary-600 py-2 text-xs font-semibold text-white">
            Unlock
          </button>
        </div>
      </div>
    </div>
  );
}

function ScreenDashboard() {
  return (
    <div className="flex h-full">
      <Sidebar active="dashboard" />
      <div className="flex-1 overflow-hidden p-5">
        <h3 className="text-sm font-semibold text-ink">Overview</h3>
        <div className="mt-3 grid grid-cols-3 gap-2.5">
          {[
            { label: 'Vaults', value: '4' },
            { label: 'Secrets', value: '128' },
            { label: 'Environments', value: '6' },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-card/60 p-3">
              <div className="text-lg font-bold text-ink">{s.value}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-lg border border-border bg-card/40 p-3">
          <div className="text-xs font-semibold text-ink">Recent activity</div>
          {['Set OPENAI_KEY', 'Rotated JWT_SECRET', 'Exported staging'].map((a) => (
            <div key={a} className="mt-2 flex items-center gap-2 text-[11px] text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-success-400" />
              {a}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScreenSecrets() {
  const rows = [
    { key: 'OPENAI_KEY', env: 'production', updated: '2h ago' },
    { key: 'DATABASE_URL', env: 'staging', updated: '1d ago' },
    { key: 'JWT_SECRET', env: 'production', updated: '5m ago' },
    { key: 'STRIPE_KEY', env: 'production', updated: '3d ago' },
    { key: 'SENDGRID_API', env: 'staging', updated: '1w ago' },
  ];
  return (
    <div className="flex h-full">
      <Sidebar active="secrets" />
      <div className="flex-1 overflow-hidden p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink">Secrets</h3>
          <button className="inline-flex items-center gap-1 rounded-md bg-primary-600 px-2 py-1 text-[10px] font-semibold text-white">
            <Plus className="h-3 w-3" /> New
          </button>
        </div>
        <div className="mt-2 flex items-center rounded-md border border-border bg-background/60 px-2.5 py-1.5 text-[11px] text-muted">
          <Search className="mr-1.5 h-3 w-3" /> Filter secrets…
        </div>
        <div className="mt-3 space-y-1.5">
          {rows.map((r) => (
            <div
              key={r.key}
              className="flex items-center justify-between rounded-lg border border-border bg-card/50 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <KeyRound className="h-3.5 w-3.5 text-primary-400" />
                <span className="font-mono text-[11px] text-ink">{r.key}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted">
                <span className="rounded bg-primary-600/15 px-1.5 py-0.5 text-primary-300">
                  {r.env}
                </span>
                <span>{r.updated}</span>
                <MoreHorizontal className="h-3.5 w-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScreenVaults() {
  const vaults = [
    { name: 'default', count: 14, active: true },
    { name: 'work', count: 42, active: false },
    { name: 'side-project', count: 8, active: false },
    { name: 'production', count: 64, active: false },
  ];
  return (
    <div className="flex h-full">
      <Sidebar active="vaults" />
      <div className="flex-1 overflow-hidden p-5">
        <h3 className="text-sm font-semibold text-ink">Vaults</h3>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {vaults.map((v) => (
            <div
              key={v.name}
              className={`rounded-lg border p-3 ${
                v.active
                  ? 'border-primary-500/60 bg-primary-600/10'
                  : 'border-border bg-card/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Boxes className="h-4 w-4 text-primary-400" />
                <span className="text-xs font-semibold text-ink">{v.name}</span>
              </div>
              <div className="mt-2 text-[10px] text-muted">{v.count} secrets</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScreenSettings() {
  const opts = [
    { label: 'Auto-lock', value: '5 min' },
    { label: 'Default editor', value: 'code' },
    { label: 'Cloud sync', value: 'Disabled' },
    { label: 'Export format', value: '.cloak' },
  ];
  return (
    <div className="flex h-full">
      <Sidebar active="settings" />
      <div className="flex-1 overflow-hidden p-5">
        <h3 className="text-sm font-semibold text-ink">Settings</h3>
        <div className="mt-3 space-y-2">
          {opts.map((o) => (
            <div
              key={o.label}
              className="flex items-center justify-between rounded-lg border border-border bg-card/50 px-3 py-2.5"
            >
              <span className="text-xs text-muted">{o.label}</span>
              <span className="text-xs font-medium text-ink">{o.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScreenEnv() {
  const envs = ['production', 'staging', 'development', 'preview'];
  return (
    <div className="flex h-full">
      <Sidebar active="env" />
      <div className="flex-1 overflow-hidden p-5">
        <h3 className="text-sm font-semibold text-ink">Environments</h3>
        <div className="mt-3 space-y-2">
          {envs.map((e, i) => (
            <div
              key={e}
              className="rounded-lg border border-border bg-card/50 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink">{e}</span>
                <span className="text-[10px] text-muted">
                  {9 - i} secrets
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {['API_KEY', 'DB_URL', 'JWT'].map((k) => (
                  <span
                    key={k}
                    className="rounded bg-primary-600/15 px-1.5 py-0.5 font-mono text-[9px] text-primary-300"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScreenImportExport() {
  return (
    <div className="flex h-full">
      <Sidebar active="import-export" />
      <div className="flex-1 overflow-hidden p-5">
        <h3 className="text-sm font-semibold text-ink">Import / Export</h3>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <ArrowLeftRight className="h-5 w-5 text-primary-400" />
            <div className="mt-2 text-xs font-semibold text-ink">Export</div>
            <div className="mt-1 text-[10px] text-muted">
              Encrypted .cloak bundle
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <FileCode2 className="h-5 w-5 text-success-400" />
            <div className="mt-2 text-xs font-semibold text-ink">Import</div>
            <div className="mt-1 text-[10px] text-muted">From .env or .cloak</div>
          </div>
        </div>
        <div className="mt-3 rounded-lg border border-border bg-[#0b0e14] p-3 font-mono text-[10px] text-muted">
          <span className="text-success-400">$ </span>cloakx export --out backup.cloak
        </div>
      </div>
    </div>
  );
}

function Sidebar({ active }: { active: string }) {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: CircleUser },
    { id: 'secrets', label: 'Secrets', icon: KeyRound },
    { id: 'vaults', label: 'Vaults', icon: Boxes },
    { id: 'env', label: 'Environments', icon: FileCode2 },
    { id: 'import-export', label: 'Import / Export', icon: ArrowLeftRight },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];
  return (
    <div className="hidden w-36 shrink-0 border-r border-border/60 bg-card/30 p-3 sm:block">
      <div className="mb-3 flex items-center gap-1.5 px-1 text-[10px] font-bold uppercase tracking-wider text-muted">
        <Shield className="h-3 w-3 text-primary-400" /> CloakX
      </div>
      <nav className="space-y-1">
        {items.map((it) => {
          const Icon = it.icon;
          const on = it.id === active;
          return (
            <div
              key={it.id}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] ${
                on
                  ? 'bg-primary-600/15 text-primary-300'
                  : 'text-muted'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {it.label}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

const screenRenderers: Record<string, () => React.ReactNode> = {
  login: ScreenLogin,
  dashboard: ScreenDashboard,
  secrets: ScreenSecrets,
  vaults: ScreenVaults,
  settings: ScreenSettings,
  env: ScreenEnv,
  'import-export': ScreenImportExport,
};

export function DashboardPreview() {
  const [active, setActive] = useState(dashboardScreens[1].id);

  const activeScreen =
    dashboardScreens.find((s) => s.id === active) ?? dashboardScreens[1];
  const Screen = screenRenderers[activeScreen.id] ?? ScreenDashboard;
  const url = `localhost:7431/${activeScreen.id}`;

  return (
    <section id="web-dashboard-preview" className="section-pad relative">
      <div className="container-px">
        <SectionHeading
          eyebrow="Web Dashboard"
          title="A dashboard you'll actually want to use"
          description="Run cloakx web and a local dashboard opens on loopback. Browse, edit, and audit every secret in a polished UI — no server exposed."
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-[260px_1fr] lg:items-start">
          {/* Tabs */}
          <div className="flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-1.5">
            {dashboardScreens.map((screen) => {
              const on = screen.id === active;
              return (
                <button
                  key={screen.id}
                  type="button"
                  onClick={() => setActive(screen.id)}
                  className={`group flex flex-1 items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 lg:flex-none ${
                    on
                      ? 'border-primary-500/60 bg-primary-600/10'
                      : 'border-border bg-card/40 hover:border-primary-500/40 hover:bg-card/60'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                      on
                        ? 'border-primary-500/50 bg-primary-600/20 text-primary-300'
                        : 'border-border bg-background text-muted'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full" />
                  </span>
                  <span>
                    <span
                      className={`block text-sm font-semibold ${
                        on ? 'text-ink' : 'text-muted'
                      }`}
                    >
                      {screen.label}
                    </span>
                    <span className="hidden text-xs text-muted lg:block">
                      {screen.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Browser frame */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <BrowserFrame url={url} title={activeScreen.id}>
              <Screen />
            </BrowserFrame>
            <p className="mt-3 text-center text-xs text-muted">
              {activeScreen.description}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
