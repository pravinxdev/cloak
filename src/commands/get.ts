import { Command } from 'commander';
import { decrypt } from '../utils/crypto';
import { getVaultPath } from '../config/paths';
import { getSessionKey } from '../utils/session';
import { loadVault, loadVaultForEnvironment, getSecretValue, isExpired, expiringsoon, getMetadata } from '../utils/vault';
import { getExpirationStatus, getTimeUntilExpiry } from '../utils/expiration';
import { getActiveEnvironment } from '../utils/environments';

export function getCommand() {
  const cmd = new Command('get');

  cmd
    .argument('<key>', 'Key to retrieve')
    .option('--env <environment>', 'Environment to retrieve from')
    .description('Retrieve a decrypted value from the vault')
    .action((key, options) => {
      try {
        const keyBuf = getSessionKey();
        // Load from specific environment if --env is provided, otherwise current environment
        const vault = options.env ? loadVaultForEnvironment(options.env) : loadVault();

        if (!vault || Object.keys(vault).length === 0) {
          console.log('🔐 Vault is empty.');
          return;
        }

        const encrypted = getSecretValue(vault, key);

        if (!encrypted) {
          console.log(`❌ No such key: ${key}`);
          return;
        }

        // ⏰ Check expiration
        if (isExpired(vault, key)) {
          console.error(`🔴 Secret has EXPIRED`);
          return;
        }

        const decrypted = decrypt(encrypted, keyBuf);
        console.log(`${key}: ${decrypted}`);

        // ⚠️ Warn if expiring soon
        if (expiringsoon(vault, key)) {
          const meta = getMetadata(vault, key);
          const status = getExpirationStatus(meta.expiresAt);
          console.warn(`\n${status}`);
        }

        const meta = getMetadata(vault, key);
        if (meta.tags?.length) {
          console.log(`Tags: ${meta.tags.join(', ')}`);
        }
        if (meta.environment && meta.environment !== 'default') {
          console.log(`Environment: ${meta.environment}`);
        }
      } catch (err: any) {
        console.error(`❌ ${err.message}`);
      }
    });

  return cmd;
}
