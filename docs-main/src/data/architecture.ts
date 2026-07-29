import type { LucideIcon } from 'lucide-react';
import {
  User,
  TerminalSquare,
  Lock,
  ShieldCheck,
  LayoutDashboard,
  Code2,
  Boxes,
} from 'lucide-react';

export interface ArchitectureNode {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const architectureFlow: ArchitectureNode[] = [
  {
    id: 'developer',
    label: 'Developer',
    description: 'You — writing code and shipping apps that need secrets.',
    icon: User,
  },
  {
    id: 'cli',
    label: 'CLI',
    description: 'The cloakx command line: the primary interface to the vault.',
    icon: TerminalSquare,
  },
  {
    id: 'vault',
    label: 'Encrypted Vault',
    description: 'An on-disk AES-256-GCM vault, decrypted only in memory.',
    icon: Lock,
  },
  {
    id: 'aes',
    label: 'AES Encryption',
    description: 'Argon2id key derivation plus authenticated AES-256-GCM.',
    icon: ShieldCheck,
  },
  {
    id: 'web',
    label: 'Web Dashboard',
    description: 'A local web UI that talks to the same vault over loopback.',
    icon: LayoutDashboard,
  },
  {
    id: 'vscode',
    label: 'VS Code Extension',
    description: 'Editor integration for autocomplete, insert, and quick commands.',
    icon: Code2,
  },
  {
    id: 'apps',
    label: 'Applications',
    description: 'Secrets injected as env vars into your apps at runtime.',
    icon: Boxes,
  },
];
