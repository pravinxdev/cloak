import { Command } from 'commander';
import fs from 'fs';
import { getVaultPath } from '../config/paths';
import { loadVault, saveVault } from '../utils/vault';
import { getSessionKey } from '../utils/session';
import { getActiveEnvironment } from '../utils/environments';

export function deleteCommand(): Command {
  const command = new Command('del');

  command
    .arguments('<key>')
    .description('Delete a secret key from the vault')
    .option('-e, --env <name>', 'Environment name')
    .action((key: string, options) => {
      try {
        getSessionKey();
      } catch (err) {
        console.log('❌ Please login first using `cloakx login`.');
        return;
      }

      const vault = loadVault();
      const env = options.env || getActiveEnvironment();
      
      // Get the environment-scoped key
      const envKey = `${key}__${env}`;
      const hasInEnv = vault && (vault[envKey] || vault[key]);

      if (!vault || !hasInEnv) {
        console.log(`❌ Key "${key}" not found in vault.`);
        return;
      }

      // Delete from specific environment or default
      if (vault[envKey]) {
        delete vault[envKey];
      } else {
        delete vault[key];
      }

      try {
        saveVault(vault);
        if (options.env) {
          console.log(`🗑️  Key "${key}" has been deleted from ${env} environment.`);
        } else {
          console.log(`🗑️  Key "${key}" has been deleted.`);
        }
      } catch (err) {
        console.error('⚠️ Failed to delete secret:', err);
      }
    });

  return command;
}
