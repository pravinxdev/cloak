/**
 * 🔖 VERSION MANAGEMENT - Single Source of Truth
 * 
 * Change the version here ONLY.
 * It will automatically update everywhere:
 * - package.json (via npm script)
 * - CLI commands (src/index.ts)
 * - API endpoint (/api/info)
 * - Web UI (SettingsPage.tsx)
 * 
 * Usage:
 * 1. Update VERSION below
 * 2. Run: npm run update-version
 * 3. Done! ✅
 */

export const APP_VERSION = '1.0.9';

export const APP_INFO = {
  name: 'cloakx',
  version: APP_VERSION,
  description: 'Secure CLI for managing encrypted secrets',
  author: 'Pravin',
  encryption: 'AES-256-CBC',
  keyDerivation: 'Scrypt',
  repository: 'https://github.com/pravinxdev/cloak',
  homepage: 'https://github.com/pravinxdev/cloak#readme',
  isOpenSource: true,
  noCloudStorage: true,
  localEncryption: true,
};
