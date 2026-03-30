// import path from 'path';
// import os from 'os';

// export const baseDir = path.join(os.homedir(), '.cloakx');
// export const vaultPath = path.join(baseDir, 'vault.json');
// export const sessionPath = path.join(baseDir, 'session.json');

import os from 'os';
import path from 'path';
import fs from 'fs';

const baseDir = path.join(os.homedir(), '.cloakx');
const configPath = path.join(baseDir, 'config.json');

function getCurrentEnv(): string {
  if (!fs.existsSync(configPath)) return 'default';

  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  return config.env || 'default';
}

export function getVaultPath() {
  const env = getCurrentEnv();
  return path.join(baseDir, `${env}.vault.json`);
}

export const sessionPath = path.join(baseDir, 'session.json');