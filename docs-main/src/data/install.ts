export interface InstallStep {
  label: string;
  command: string;
  caption: string;
}

export const installSteps: InstallStep[] = [
  {
    label: 'Install',
    command: 'npm install -g cloakx',
    caption: 'Add the CloakX CLI globally with npm, pnpm, or yarn.',
  },
  {
    label: 'Login',
    command: 'cloakx login',
    caption: 'Create or unlock a vault with your master password.',
  },
  {
    label: 'Store Secret',
    command: 'cloakx set api_key xxxxx',
    caption: 'Encrypt and store a secret under a memorable key.',
  },
  {
    label: 'Read Secret',
    command: 'cloakx get api_key',
    caption: 'Decrypt a single secret and print it to stdout.',
  },
  {
    label: 'List Secrets',
    command: 'cloakx list',
    caption: 'List every key in the active vault without exposing values.',
  },
];

export interface PackageManager {
  name: string;
  command: string;
}

export const packageManagers: PackageManager[] = [
  { name: 'npm', command: 'npm install -g cloakx' },
  { name: 'pnpm', command: 'pnpm add -g cloakx' },
  { name: 'yarn', command: 'yarn global add cloakx' },
  { name: 'bun', command: 'bun add -g cloakx' },
];

export const systemRequirements: string[] = [
  'Node.js 18 or newer',
  'macOS, Linux, or Windows (WSL recommended)',
  '50 MB of free disk space for the vault',
  'A master password you will not forget',
];
