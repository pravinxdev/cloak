import { Command } from 'commander';
import { loadVault } from '../utils/vault';
import { getSession } from '../utils/session';

export function listCommand(): Command {
  const command = new Command('list');

  command
    .description('List all stored secret keys')
    .action(() => {
      const session = getSession();
      if (!session) {
        console.log('❌ Please login first using `cloakx login`.');
        return;
      }

      const vault = loadVault();
      const keys = Object.keys(vault || {});

      if (keys.length === 0) {
        console.log('🔍 No secrets found in the vault.');
      } else {
        console.log(`📦 ${keys.length} secrets found:`);
        keys.forEach((key, idx) => {
          console.log(` ${idx + 1}. ${key}`);
        });
      }
    });

  return command;
}
