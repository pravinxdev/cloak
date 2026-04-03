import { Command } from 'commander';
import fs from 'fs';
import { loadVault, getSecretValue } from '../utils/vault';
import { decrypt } from '../utils/crypto';
import { getSessionKey } from '../utils/session';

export function syncCommand() {
  const cmd = new Command('sync');

  cmd.action(() => {
    try {
      const key = getSessionKey();
      const vault = loadVault();

      let content = '';

      for (const k of Object.keys(vault)) {
        const encrypted = getSecretValue(vault, k);
        if (encrypted) {
          const value = decrypt(encrypted, key);
          content += `${k}=${value}\n`;
        }
      }

      fs.writeFileSync('.env', content);
      console.log('✅ .env file generated');
    } catch {
      console.log('❌ Please login first');
    }
  });

  return cmd;
}