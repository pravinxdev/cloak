export interface TerminalLine {
  type: 'command' | 'output' | 'success' | 'prompt';
  text: string;
}

export const heroTerminal: TerminalLine[] = [
  { type: 'command', text: 'cloakx login' },
  { type: 'success', text: '✔ Login Successful' },
  { type: 'command', text: 'cloakx set OPENAI_KEY xxxx' },
  { type: 'success', text: '✔ Secret Stored' },
  { type: 'command', text: 'cloakx list' },
  { type: 'output', text: 'OPENAI_KEY' },
  { type: 'output', text: 'DATABASE_URL' },
  { type: 'output', text: 'JWT_SECRET' },
];

export interface DashboardScreen {
  id: string;
  label: string;
  description: string;
}

export const dashboardScreens: DashboardScreen[] = [
  { id: 'login', label: 'Login', description: 'Unlock a vault with your master password.' },
  { id: 'dashboard', label: 'Dashboard', description: 'Overview of vaults, secret counts, and recent activity.' },
  { id: 'secrets', label: 'Secret List', description: 'Browse, search, and edit every secret in the active vault.' },
  { id: 'vaults', label: 'Vaults', description: 'Create and switch between isolated vaults for each context.' },
  { id: 'settings', label: 'Settings', description: 'Configure auto-lock, editor, sync, and export preferences.' },
  { id: 'env', label: 'Environment Variables', description: 'Group secrets into named environments and inject them.' },
  { id: 'import-export', label: 'Import / Export', description: 'Move secrets in and out via encrypted bundles or .env files.' },
];

export interface VSCodeFeature {
  title: string;
  description: string;
}

export const vscodeFeatures: VSCodeFeature[] = [
  {
    title: 'Autocomplete',
    description: 'Secret keys autocomplete as you type process.env references in your code.',
  },
  {
    title: 'Insert Secret',
    description: 'Insert a decrypted value directly at the cursor from the command palette.',
  },
  {
    title: 'Search Secrets',
    description: 'Fuzzy-search every key in the active vault without leaving the editor.',
  },
  {
    title: 'Copy Secret',
    description: 'Copy a decrypted value to the clipboard with a single quick-pick action.',
  },
  {
    title: 'Quick Commands',
    description: 'Run cloakx set, get, list, and env straight from the VS Code command palette.',
  },
];
