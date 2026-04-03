import { Command } from 'commander';
import { loadVault, getSecretValue, getMetadata, isExpired, getAllSecretsFromAllEnvironments } from '../utils/vault';
import { getByTag, getByEnvironment } from '../utils/vault';
import { getSession } from '../utils/session';
import { getActiveEnvironment } from '../utils/environments';
import { getExpirationStatus, formatExpiration } from '../utils/expiration';

export function listCommand(): Command {
  const command = new Command('list');

  command
    .option('--tag <tag>', 'Filter by tag')
    .option('--env <environment>', 'Filter by environment (default: current env)')
    .option('--all', 'Show all environments')
    .option('--expired', 'Show only expired secrets')
    .description('List all stored secret keys')
    .action((options) => {
      const session = getSession();
      if (!session) {
        console.log('❌ Please login first using `cloakx login`.');
        return;
      }

      // 🌍 Load secrets from all environments or current one
      let allSecrets;
      if (options.all || options.tag || options.env) {
        allSecrets = getAllSecretsFromAllEnvironments();
      } else {
        const vault = loadVault();
        allSecrets = {};
        for (const [key, secret] of Object.entries(vault)) {
          if (typeof secret === 'object' && secret !== null) {
            allSecrets[key] = secret;
          }
        }
      }

      let keys = Object.keys(allSecrets);

      if (keys.length === 0) {
        console.log('🔍 No secrets found in the vault.');
        return;
      }

      // 🏷️ Filter by tag
      if (options.tag) {
        keys = keys.filter((k) => {
          const meta = allSecrets[k];
          return (meta.tags || []).includes(options.tag);
        });
      }

      // 🌍 Filter by environment
      if (options.env) {
        // If --env is specified, always filter by that environment
        keys = keys.filter((k) => {
          const meta = allSecrets[k];
          return (meta.environment || 'default') === options.env;
        });
      } else if (!options.all && !options.tag) {
        // If neither --all nor --tag is specified, default to current environment
        const env = getActiveEnvironment();
        keys = keys.filter((k) => {
          const meta = allSecrets[k];
          return (meta.environment || 'default') === env;
        });
      }

      // 🔴 Filter by expired
      if (options.expired) {
        keys = keys.filter((k) => {
          const meta = allSecrets[k];
          return meta.expiresAt && meta.expiresAt < Date.now();
        });
      }

      if (keys.length === 0) {
        console.log('🔍 No secrets match the filters.');
        return;
      }

      // 📊 Display
      console.log(`\n📦 ${keys.length} secret(s):`);
      console.log('─'.repeat(80));

      keys.forEach((compositeKey, idx) => {
        const meta = allSecrets[compositeKey];
        // Extract the actual key name (without @environment suffix if present)
        const displayKey = compositeKey.includes('@') ? compositeKey.split('@')[0] : compositeKey;
        
        const expired = meta.expiresAt && meta.expiresAt < Date.now();
        const status = expired ? '🔴' : (meta.expiresAt && (meta.expiresAt - Date.now()) < 7 * 24 * 60 * 60 * 1000) ? '⚠️ ' : '✅';

        console.log(`\n${status} ${idx + 1}. ${displayKey}`);

        if (meta.tags?.length) {
          console.log(`   Tags: ${meta.tags.join(', ')}`);
        }

        if (meta.environment && meta.environment !== 'default') {
          console.log(`   Env: ${meta.environment}`);
        }

        if (meta.expiresAt) {
          const dateStr = formatExpiration(meta.expiresAt);
          const expStatus = getExpirationStatus(meta.expiresAt);
          console.log(`   Expires: ${dateStr} ${expStatus}`);
        }
      });

      console.log('\n' + '─'.repeat(80));
    });

  return command;
}
