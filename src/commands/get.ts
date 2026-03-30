// commands/get.ts
import { Command } from 'commander';
import fs from 'fs';
import { decrypt } from '../utils/crypto';
import { getVaultPath } from '../config/paths';
import { getSessionKey } from '../utils/session';

export function getCommand() {
  const cmd = new Command('get');

  cmd.argument('<key>', 'Key to retrieve')
    .description('Retrieve a decrypted value from the vault')
    .action((key) => {
      try {
        // const password = getSessionPassword();
const keyBuf = getSessionKey();

        if (!fs.existsSync(getVaultPath())) {
          console.log('🔐 Vault is empty.');
          return;
        }

        const data = JSON.parse(fs.readFileSync(getVaultPath(), 'utf-8'));
        const encrypted = data[key];

        if (!encrypted) {
          console.log(`❌ No such key: ${key}`);
          return;
        }
        const decrypted = decrypt(encrypted, keyBuf);

        // const decrypted = decrypt(encrypted, password);
        console.log(`${key}: ${decrypted}`);
      } catch (err: any) {
        console.error(`❌ ${err.message}`);
      }
    });

  return cmd;
}
