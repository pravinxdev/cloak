import { Command } from 'commander';
import fs from 'fs';
import { getVaultPath } from '../config/paths';
import { loadVault, saveVault } from '../utils/vault';
import { getSessionKey } from '../utils/session';

export function deleteCommand(): Command {
  const command = new Command('del');

  command
    .arguments('<key>')
    .description('Delete a secret key from the vault')
    .action((key: string) => {
      try {
        getSessionKey();
      } catch (err) {
        console.log('❌ Please login first using `cloakx login`.');
        return;
      }

      const vault = loadVault();
      if (!vault || !vault[key]) {
        console.log(`❌ Key "${key}" not found in vault.`);
        return;
      }

      delete vault[key];

      try {
        saveVault(vault);
        console.log(`🗑️  Key "${key}" has been deleted.`);
      } catch (err) {
        console.error('⚠️ Failed to delete secret:', err);
      }
    });

  return command;
}
