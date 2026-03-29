import path from 'path';
import os from 'os';

export const baseDir = path.join(os.homedir(), '.cloakx');
export const vaultPath = path.join(baseDir, 'vault.json');
export const sessionPath = path.join(baseDir, 'session.json');
