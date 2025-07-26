import { Command } from 'commander';
import fs from 'fs';
import { vaultPath } from '../config/paths';
import { loadVault } from '../utils/vault';
import { getSession } from '../utils/session';

export function deleteCommand(): Command {
  const command = new Command('del');

  command
    .arguments('<key>')
    .description('Delete a secret key from the vault')
    .action((key: string) => {
      const session = getSession();
      if (!session) {
        console.log('❌ Please login first using `cloak login`.');
        return;
      }

      const vault = loadVault();
      if (!vault || !vault[key]) {
        console.log(`❌ Key "${key}" not found in vault.`);
        return;
      }

      delete vault[key];

      try {
        fs.writeFileSync(vaultPath, JSON.stringify(vault, null, 2));
        console.log(`🗑️  Key "${key}" has been deleted.`);
      } catch (err) {
        console.error('⚠️ Failed to update vault:', err);
      }
    });

  return command;
}
