// src/commands/update.ts
import { Command } from 'commander';
import { loadVault, saveVault, updateSecret as updateSecretInVault, getMetadata, loadVaultForEnvironment, saveVaultForEnvironment } from '../utils/vault';
import { encrypt } from '../utils/crypto';
import { getSessionKey } from '../utils/session';
import { getActiveEnvironment } from '../utils/environments';
import { parseExpiration } from '../utils/expiration';

/**
 * Update a secret value by key with optional metadata.
 */
export async function updateSecret(key: string, value: string, options?: any): Promise<void> {
  try {
    // 📝 Determine environment
    const environment = options?.env || getActiveEnvironment();
    
    // 🔓 Load from the specified environment's vault
    const vault = options?.env 
      ? loadVaultForEnvironment(environment)
      : loadVault();

    if (!vault[key]) {
      console.error(`❌ Key "${key}" does not exist.`);
      process.exit(1);
    }

    const keyBuf = getSessionKey();
    const encrypted = encrypt(value, keyBuf);

    // 📝 Parse metadata
    const tags = options?.tags
      ? options.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t)
      : undefined;
    
    let expiresAt: number | undefined;
    if (options?.expires) {
      const parsed = parseExpiration(options.expires);
      if (!parsed) {
        console.error('❌ Invalid expiration format. Use: 30d, 7d, or 2026-12-31');
        return;
      }
      expiresAt = parsed;
    }

    // 📊 Update with metadata
    updateSecretInVault(vault, key, encrypted, {
      tags,
      environment,
      expiresAt
    });

    // 💾 Save to the environment's vault
    if (options?.env) {
      saveVaultForEnvironment(vault, environment);
    } else {
      saveVault(vault);
    }

    // 📢 Feedback
    console.log(`✅ Updated ${key}`);
    if (tags?.length) console.log(`   Tags: ${tags.join(', ')}`);
    if (environment !== 'default') console.log(`   Environment: ${environment}`);
    if (expiresAt) {
      const date = new Date(expiresAt).toISOString().split('T')[0];
      console.log(`   Expires: ${date}`);
    }
  } catch (err: any) {
    console.error(`❌ Error updating key: ${err.message || err}`);
    process.exit(1);
  }
}

const command = new Command('upd')
  .description('Update a secret by key')
  .aliases(['update'])
  .argument('<key>', 'Key of the secret to update')
  .argument('<value>', 'New value of the secret')
  .option('--tags <tags>', 'Comma-separated tags (e.g., prod,critical)')
  .option('--env <environment>', 'Environment name (default: current environment)')
  .option('--expires <duration>', 'Expiration time (e.g., 30d, 7d, 2026-12-31)')
  .action(async (key, value, options) => {
    await updateSecret(key, value, options);
  });

export default command;
