import type { LucideIcon } from 'lucide-react';
import {
  ShieldCheck,
  TerminalSquare,
  LayoutDashboard,
  Code2,
  Boxes,
  KeyRound,
  Cloud,
  WifiOff,
  Gauge,
  GitBranch,
} from 'lucide-react';

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  comingSoon?: boolean;
}

export const features: Feature[] = [
  {
    icon: ShieldCheck,
    title: 'AES-256 Encryption',
    description:
      'Every secret is encrypted at rest with AES-256-CBC. Keys are derived from your master password using scrypt, so your vault stays unreadable without it.',
  },
  {
    icon: TerminalSquare,
    title: 'CLI First',
    description:
      'A fast, scriptable command-line interface sits at the core. Store, fetch, export and inject secrets without ever leaving your terminal.',
  },
  {
    icon: LayoutDashboard,
    title: 'Web Dashboard',
    description:
      'A polished web UI for browsing vaults, editing secrets, and auditing access. Built for teams that prefer a mouse over a prompt.',
  },
  {
    icon: Code2,
    title: 'VS Code Extension',
    description:
      'Autocomplete secret names, insert values, and run CloakX commands directly inside VS Code without context switching.',
  },
  {
    icon: Boxes,
    title: 'Multiple Vaults',
    description:
      'Separate personal, work, staging, and production secrets into isolated vaults. Switch contexts with a single command.',
  },
  {
    icon: KeyRound,
    title: 'Environment Variables',
    description:
      'Treat groups of secrets as full environments. Export, diff, and inject entire .env stacks into any process with one call.',
  },
  {
    icon: Cloud,
    title: 'Cloud Sync',
    description:
      'End-to-end encrypted sync across machines is on the way. Your secrets stay encrypted in transit and at rest, always.',
    comingSoon: true,
  },
  {
    icon: WifiOff,
    title: 'Offline First',
    description:
      'CloakX runs entirely on your machine. Read, write, and inject secrets with no network connection required.',
  },
  {
    icon: Gauge,
    title: 'Fast Performance',
    description:
      'Written in Rust-backed core with a thin Node CLI. Secret lookups resolve in under 5ms, even with thousands of entries.',
  },
  {
    icon: GitBranch,
    title: 'Open Source',
    description:
      'MIT licensed and fully auditable. No telemetry, no phone-home, no vendor lock-in. Your secrets never leave your control.',
  },
];
