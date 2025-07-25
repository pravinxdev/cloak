import path from 'path';
import os from 'os';

export const vaultPath = path.join(os.homedir(), '.cloak', 'vault.json');
export const sessionPath = path.join(os.homedir(), '.cloak', 'session.json');
