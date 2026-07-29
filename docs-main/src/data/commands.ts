import type { LucideIcon } from 'lucide-react';
import {
  LogIn,
  LogOut,
  Activity,
  PlusSquare,
  Eye,
  List,
  RefreshCw,
  Trash2,
  Upload,
  Download,
  FileCode2,
  Play,
  Globe,
  Settings,
} from 'lucide-react';

export interface CliCommand {
  command: string;
  description: string;
  icon: LucideIcon;
  example: string;
}

export const cliCommands: CliCommand[] = [
  {
    command: 'cloakx login',
    description: 'Authenticate with your master password and unlock the active vault.',
    icon: LogIn,
    example: '$ cloakx login\n✔ Master password accepted\n✔ Vault unlocked: default',
  },
  {
    command: 'cloakx logout',
    description: 'Lock the current vault and clear the session from memory.',
    icon: LogOut,
    example: '$ cloakx logout\n✔ Session cleared\n✔ Vault locked',
  },
  {
    command: 'cloakx status',
    description: 'Show the active vault, lock state, and counts of stored secrets.',
    icon: Activity,
    example: '$ cloakx status\nVault:   default (unlocked)\nSecrets: 14\nSync:    offline',
  },
  {
    command: 'cloakx set',
    description: 'Store a new secret or overwrite an existing key in the active vault.',
    icon: PlusSquare,
    example: '$ cloakx set OPENAI_KEY sk-...\n✔ Secret stored: OPENAI_KEY',
  },
  {
    command: 'cloakx get',
    description: 'Decrypt and print the value of a single secret to stdout.',
    icon: Eye,
    example: '$ cloakx get OPENAI_KEY\nsk-proj-xxxxxxxxxxxxxxxx',
  },
  {
    command: 'cloakx list',
    description: 'List every secret key in the current vault without revealing values.',
    icon: List,
    example: '$ cloakx list\nOPENAI_KEY\nDATABASE_URL\nJWT_SECRET',
  },
  {
    command: 'cloakx update',
    description: 'Rotate an existing secret value in place, preserving its key.',
    icon: RefreshCw,
    example: '$ cloakx update JWT_SECRET --rotate\n✔ Secret rotated: JWT_SECRET',
  },
  {
    command: 'cloakx delete',
    description: 'Permanently remove a secret from the active vault after confirmation.',
    icon: Trash2,
    example: '$ cloakx delete OLD_TOKEN\n✔ Secret deleted: OLD_TOKEN',
  },
  {
    command: 'cloakx export',
    description: 'Export selected secrets to an encrypted .cloak bundle for backup.',
    icon: Download,
    example: '$ cloakx export --out backup.cloak\n✔ Exported 14 secrets to backup.cloak',
  },
  {
    command: 'cloakx import',
    description: 'Import secrets from an encrypted bundle or a .env file into the vault.',
    icon: Upload,
    example: '$ cloakx import .env\n✔ Imported 6 secrets from .env',
  },
  {
    command: 'cloakx env',
    description: 'Load an environment group and run a child process with injected vars.',
    icon: FileCode2,
    example: '$ cloakx env staging -- npm run start\n✔ Injecting 9 secrets into: npm run start',
  },
  {
    command: 'cloakx run',
    description: 'Execute any command with the active vault secrets injected as env vars.',
    icon: Play,
    example: '$ cloakx run -- node server.js\n✔ 12 secrets injected — running node server.js',
  },
  {
    command: 'cloakx web',
    description: 'Launch the local Web Dashboard in your default browser on a port.',
    icon: Globe,
    example: '$ cloakx web\n✔ Dashboard running at http://localhost:7431',
  },
  {
    command: 'cloakx config',
    description: 'View and edit CloakX settings: vault paths, sync, and editor defaults.',
    icon: Settings,
    example: '$ cloakx config set editor code\n✔ Editor set to: code',
  },
];
