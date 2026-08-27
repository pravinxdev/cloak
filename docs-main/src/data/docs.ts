import type { LucideIcon } from 'lucide-react';
import {
  Download,
  TerminalSquare,
  LayoutDashboard,
  Share2,
  Code2,
  ShieldCheck,
  Boxes,
  KeyRound,
  FileCode2,
  Cloud,
  Settings,
  BookOpen,
  GitBranch,
  RefreshCw,
} from 'lucide-react';

export interface DocEntry {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  category: 'Getting Started' | 'Guides' | 'Reference';
  body: string[];
}

export const docs: DocEntry[] = [
  {
    slug: 'introduction',
    title: 'Introduction',
    description: 'What CloakX is and why you might want it.',
    icon: BookOpen,
    category: 'Getting Started',
    body: [
      'CloakX is an open-source secret management platform built for developers. It keeps your API keys, tokens, passwords, certificates, and environment variables in an encrypted vault on your own machine.',
      'You interact with the vault through three surfaces: a fast CLI, a local Web Dashboard, and a VS Code Extension. All three talk to the same encrypted vault file, so changes made in one are immediately visible in the others.',
      'CloakX is local-first and offline-capable. Nothing leaves your machine unless you explicitly enable Cloud Sync. There is no account required and no telemetry.',
    ],
  },
  {
    slug: 'installation',
    title: 'Installation',
    description: 'Install the CLI and create your first vault.',
    icon: Download,
    category: 'Getting Started',
    body: [
      'Install CloakX globally with your package manager of choice: npm install -g cloakx.',
      'Run cloakx login to create a new vault. You will be asked for a master password — choose a strong one, because it cannot be recovered if lost.',
      'Verify the install with cloakx status, which prints the active vault and its lock state.',
    ],
  },
  {
    slug: 'cli',
    title: 'CLI Reference',
    description: 'Every command in the cloakx CLI.',
    icon: TerminalSquare,
    category: 'Reference',
    body: [
      'The CLI is the primary interface to CloakX. Commands follow the form cloakx <command> [flags].',
      'Common commands include login, set, get, list, env, run, export, and import. Each command supports --help for detailed usage.',
      'Secrets are injected into child processes as environment variables by cloakx run and cloakx env, so no plaintext ever touches your shell history.',
    ],
  },
  {
    slug: 'web-dashboard',
    title: 'Web Dashboard',
    description: 'Browse and edit vaults in a local web UI.',
    icon: LayoutDashboard,
    category: 'Guides',
    body: [
      'Run cloakx web to launch the dashboard on http://127.0.0.1:1201. The server binds to loopback only, so it is never exposed to your network.',
      'From the dashboard you can create and switch vaults, edit secrets, define environments, share encrypted bundles, and export backups.',
      'Every action in the UI is also available in the CLI, so you can script anything you can click.',
    ],
  },
  {
    slug: 'sharing',
    title: 'Encrypted Sharing',
    description: 'Share environment secrets through passcode-protected bundles.',
    icon: Share2,
    category: 'Guides',
    body: [
      'Use the Share page in the Web Dashboard or run cloakx share to package the current environment into a clkx_ token.',
      'Protect each bundle with a passcode from 8 to 128 characters. The passcode is required to decrypt and import the bundle.',
      'Import a bundle with cloakx receive <token> --passcode <passcode>. The bundle is written to the recipient\'s active environment.',
    ],
  },
  {
    slug: 'vscode',
    title: 'VS Code Extension',
    description: 'Use CloakX without leaving your editor.',
    icon: Code2,
    category: 'Guides',
    body: [
      'Install the CloakX extension from the VS Code marketplace. It auto-detects any vault on your machine.',
      'The extension adds autocomplete for process.env keys, a quick-pick to insert or copy secret values, and command-palette entries for the most common CLI commands.',
      'Decrypted values are never written to your workspace files unless you explicitly insert them.',
    ],
  },
  {
    slug: 'vaults',
    title: 'Multiple Vaults',
    description: 'Isolate secrets by project or environment.',
    icon: Boxes,
    category: 'Guides',
    body: [
      'A vault is a single encrypted file that holds a set of secrets. You can have as many vaults as you like, each with its own master password.',
      'Switch the active vault with cloakx config set vault <name> or from the Web Dashboard sidebar.',
      'Vaults are fully isolated — a secret in one vault is never visible to another.',
    ],
  },
  {
    slug: 'environments',
    title: 'Environment Variables',
    description: 'Group secrets into injectable environments.',
    icon: KeyRound,
    category: 'Guides',
    body: [
      'An environment is a named group of secrets that can be injected together into a process.',
      'Create one with cloakx env create staging, add keys to it, then run a process inside it with cloakx env staging -- npm run start.',
      'Environments make it trivial to keep dev, staging, and production secrets separate without juggling .env files.',
    ],
  },
  {
    slug: 'encryption',
    title: 'Encryption',
    description: 'How secrets are encrypted and decrypted.',
    icon: ShieldCheck,
    category: 'Reference',
    body: [
      'CloakX encrypts every secret with AES-256-CBC. The encryption key is derived from your master password using scrypt.',
      'Plaintext is never written to disk. Values are decrypted in memory only when you request them, and the in-memory key is wiped when the vault locks.',
      'Exports are encrypted bundles that require the master password to read, so they are safe to store in any backup target.',
    ],
  },
  {
    slug: 'import-export',
    title: 'Import & Export',
    description: 'Move secrets in and out of a vault.',
    icon: FileCode2,
    category: 'Guides',
    body: [
      'Import an existing .env file with cloakx import .env — each KEY=VALUE line becomes a secret in the active vault.',
      'Export the whole vault to an encrypted bundle with cloakx export --out backup.cloak, or export a single environment to .env with cloakx env staging --export.',
      'Encrypted bundles can be restored on any machine with cloakx import backup.cloak.',
    ],
  },
  {
    slug: 'sync',
    title: 'Local .env Sync',
    description: 'Synchronize vault secrets directly into a local .env file.',
    icon: RefreshCw,
    category: 'Guides',
    body: [
      'The cloakx sync command exports active vault or environment secrets directly into your workspace .env file.',
      'Use cloakx sync --env production to pull specific environment secrets, or -f custom.env to target a custom path.',
      'With --watch enabled (cloakx sync --watch), CloakX automatically updates the target file in real-time whenever secrets are added or modified.',
    ],
  },
  {
    slug: 'cloud-sync',
    title: 'Cloud Sync',
    description: 'Encrypted sync across machines (coming soon).',
    icon: Cloud,
    category: 'Reference',
    body: [
      'Cloud Sync will replicate your encrypted vault across all your machines. Because the bundle is encrypted before it leaves your device, the sync server never sees plaintext.',
      'Sync is opt-in and disabled by default. Local-first usage continues to work without it.',
      'This feature is on the roadmap and not yet available in stable releases.',
    ],
  },
  {
    slug: 'configuration',
    title: 'Configuration',
    description: 'Configure CloakX to fit your workflow.',
    icon: Settings,
    category: 'Reference',
    body: [
      'Settings live in a config file in your user directory. Use cloakx config set <key> <value> to change them.',
      'Common options include the active vault, auto-lock timeout, default editor, and sync enablement.',
      'Run cloakx config to print the full current configuration.',
    ],
  },
  {
    slug: 'contributing',
    title: 'Contributing',
    description: 'How to contribute to CloakX.',
    icon: GitBranch,
    category: 'Getting Started',
    body: [
      'CloakX is MIT licensed and developed in the open. Contributions — bug reports, fixes, docs, and features — are all welcome.',
      'Open an issue or pull request on GitHub. For larger changes, please open an issue first to discuss the approach.',
      'All contributions are reviewed by maintainers before merging.',
    ],
  },
];
