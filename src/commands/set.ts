import { Command } from 'commander';
import { encrypt } from '../utils/crypto';
import { getVaultPath } from '../config/paths';
import { getSessionKey } from '../utils/session';
import { loadVault, saveVault, updateSecret, loadVaultForEnvironment, saveVaultForEnvironment } from '../utils/vault';
import { getActiveEnvironment } from '../utils/environments';
import { parseExpiration } from '../utils/expiration';
import fs from 'fs';

export function setCommand() {
  const cmd = new Command('set').aliases(['add']);
  cmd
    .arguments('<key> <value>')
    .option('--tags <tags>', 'Comma-separated tags (e.g., prod,critical)')
    .option('--env <environment>', 'Environment name (default: current environment)')
    .option('--expires <duration>', 'Expiration time (e.g., 30d, 7d, 2026-12-31)')
    .action((key, value, options) => {
      try {
        const keyBuf = getSessionKey();
        
        // 📝 Determine environment
        const environment = options.env || getActiveEnvironment();
        
        // 🔓 Load from the specified environment's vault
        const vault = options.env 
          ? loadVaultForEnvironment(environment)
          : loadVault();

        // 📝 Parse metadata
        const tags = options.tags
          ? options.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t)
          : undefined;
        
        let expiresAt: number | undefined;
        if (options.expires) {
          const parsed = parseExpiration(options.expires);
          if (!parsed) {
            console.error('❌ Invalid expiration format. Use: 30d, 7d, or 2026-12-31');
            return;
          }
          expiresAt = parsed;
        }

        // 🔒 Encrypt value
        const encrypted = encrypt(value, keyBuf);

        // 📊 Update with metadata
        updateSecret(vault, key, encrypted, {
          tags,
          environment,
          expiresAt
        });

        // 💾 Save to the environment's vault
        if (options.env) {
          saveVaultForEnvironment(vault, environment);
        } else {
          saveVault(vault);
        }

        // 📢 Feedback
        console.log(`✅ Saved ${key}`);
        if (tags?.length) console.log(`   Tags: ${tags.join(', ')}`);
        if (environment !== 'default') console.log(`   Environment: ${environment}`);
        if (expiresAt) {
          const date = new Date(expiresAt).toISOString().split('T')[0];
          console.log(`   Expires: ${date}`);
        }
      } catch (err: any) {
        console.error(`❌ ${err.message}`);
        process.exit(1);
      }
    });

  return cmd;
}
