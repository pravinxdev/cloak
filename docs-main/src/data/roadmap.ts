import type { LucideIcon } from 'lucide-react';
import {
  TerminalSquare,
  LayoutDashboard,
  ShieldCheck,
  Boxes,
  Code2,
  Cloud,
  Share2,
  Users,
  Chrome,
  Smartphone,
  Sparkles,
} from 'lucide-react';

export type RoadmapStatus = 'completed' | 'current' | 'coming';

export interface RoadmapItem {
  icon: LucideIcon;
  title: string;
  description: string;
  status: RoadmapStatus;
}

export const roadmap: RoadmapItem[] = [
  {
    icon: TerminalSquare,
    title: 'CLI',
    description: 'The core command-line interface for storing and reading secrets.',
    status: 'completed',
  },
  {
    icon: LayoutDashboard,
    title: 'Web Dashboard',
    description: 'A local-first web UI for browsing and editing vaults visually.',
    status: 'completed',
  },
  {
    icon: ShieldCheck,
    title: 'Encryption',
    description: 'AES-256-CBC encryption with scrypt key derivation.',
    status: 'completed',
  },
  {
    icon: Boxes,
    title: 'Multiple Vaults',
    description: 'Isolate secrets by project, environment, or team with vaults.',
    status: 'completed',
  },
  {
    icon: Code2,
    title: 'VS Code Extension',
    description: 'Autocomplete, insert, and run CloakX commands inside your editor.',
    status: 'current',
  },
  {
    icon: Cloud,
    title: 'Cloud Sync',
    description: 'End-to-end encrypted sync of vaults across all your machines.',
    status: 'coming',
  },
  {
    icon: Share2,
    title: 'Secret Sharing',
    description: 'Share environment bundles with passcode-protected encrypted tokens.',
    status: 'completed',
  },
  {
    icon: Users,
    title: 'Teams',
    description: 'Shared vaults, roles, and an audit log for the whole organization.',
    status: 'coming',
  },
  {
    icon: Chrome,
    title: 'Browser Extension',
    description: 'Inject secrets into web apps and fill forms directly from the vault.',
    status: 'coming',
  },
  {
    icon: Smartphone,
    title: 'Mobile App',
    description: 'Carry your vault on iOS and Android with biometric unlock.',
    status: 'coming',
  },
  {
    icon: Sparkles,
    title: 'AI Assistant',
    description: 'Detect leaked secrets in code and suggest rotations automatically.',
    status: 'coming',
  },
];
