import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { loadVaultForEnvironment, loadVault, getSecretValue, Vault } from '../utils/vault';
import { decrypt } from '../utils/crypto';
import { getSessionKey } from '../utils/session';
import { getActiveEnvironment } from '../utils/environments';

export function parseEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf-8');
  const result: Record<string, string> = {};
  
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) continue;
    
    const key = line.slice(0, eqIdx).trim();
    let val = line.slice(eqIdx + 1).trim();
    
    // Unquote single/double quotes if present
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    
    if (key) {
      result[key] = val;
    }
  }
  return result;
}

export function syncCommand() {
  const cmd = new Command('sync');

  cmd
    .description('Sync vault secrets into a local .env file')
    .option('-f, --file <path>', 'Target .env file path', '.env')
    .option('-e, --env <environment>', 'Target environment (default: active environment)')
    .option('--dry-run', 'Show differences without modifying file')
    .option('--override', 'Force override existing file without merge warning')
    .action((options) => {
      try {
        const key = getSessionKey();
        const environment = options.env || getActiveEnvironment();
        const targetFile = options.file || '.env';

        const vault: Vault = options.env
          ? loadVaultForEnvironment(environment)
          : loadVault();

        if (!vault || Object.keys(vault).length === 0) {
          console.log(`🔒 Vault for environment "${environment}" is empty.`);
          return;
        }

        const existingEnv = parseEnvFile(targetFile);
        const vaultSecrets: Record<string, string> = {};
        const decryptedKeys: string[] = [];

        for (const k of Object.keys(vault)) {
          if (k.startsWith('__')) continue;
          const encrypted = getSecretValue(vault, k);
          if (encrypted) {
            try {
              vaultSecrets[k] = decrypt(encrypted, key);
              decryptedKeys.push(k);
            } catch {
              console.warn(`⚠️ Failed to decrypt key: ${k}`);
            }
          }
        }

        if (decryptedKeys.length === 0) {
          console.log('⚠️ No secrets could be decrypted.');
          return;
        }

        // Compare diffs
        const added: string[] = [];
        const updated: string[] = [];
        const unchanged: string[] = [];

        for (const k of decryptedKeys) {
          if (!(k in existingEnv)) {
            added.push(k);
          } else if (existingEnv[k] !== vaultSecrets[k]) {
            updated.push(k);
          } else {
            unchanged.push(k);
          }
        }

        if (options.dryRun) {
          console.log(`🔍 Sync Dry Run for ${targetFile} [Env: ${environment}]:`);
          if (added.length) console.log(`   ➕ New secrets to add: ${added.join(', ')}`);
          if (updated.length) console.log(`   🔄 Existing secrets to update: ${updated.join(', ')}`);
          if (unchanged.length) console.log(`   ✅ Up-to-date: ${unchanged.join(', ')}`);
          if (!added.length && !updated.length) console.log('   ✨ File is already completely in sync!');
          return;
        }

        let lines: string[] = [];
        // Preserve comments and formatting if file exists and not strictly --override
        if (fs.existsSync(targetFile) && !options.override) {
          const fileLines = fs.readFileSync(targetFile, 'utf-8').split('\n');
          const syncedKeys = new Set<string>();

          for (const rawLine of fileLines) {
            const trimmed = rawLine.trim();
            if (!trimmed || trimmed.startsWith('#')) {
              lines.push(rawLine);
              continue;
            }
            const eqIdx = rawLine.indexOf('=');
            if (eqIdx !== -1) {
              const k = rawLine.slice(0, eqIdx).trim();
              if (k in vaultSecrets) {
                // Quote if contains spaces
                const v = vaultSecrets[k].includes(' ') ? `"${vaultSecrets[k]}"` : vaultSecrets[k];
                lines.push(`${k}=${v}`);
                syncedKeys.add(k);
                continue;
              }
            }
            lines.push(rawLine);
          }

          // Append newly added keys
          for (const k of decryptedKeys) {
            if (!syncedKeys.has(k)) {
              const v = vaultSecrets[k].includes(' ') ? `"${vaultSecrets[k]}"` : vaultSecrets[k];
              lines.push(`${k}=${v}`);
            }
          }
        } else {
          // Fresh build or --override
          lines.push(`# Generated by Cloakx (Env: ${environment}) - ${new Date().toISOString()}`);
          for (const k of decryptedKeys) {
            const v = vaultSecrets[k].includes(' ') ? `"${vaultSecrets[k]}"` : vaultSecrets[k];
            lines.push(`${k}=${v}`);
          }
        }

        fs.writeFileSync(targetFile, lines.join('\n'));
        console.log(`✅ Synced secrets from environment "${environment}" to ${targetFile}`);
        if (added.length) console.log(`   ➕ Added ${added.length} keys: ${added.join(', ')}`);
        if (updated.length) console.log(`   🔄 Updated ${updated.length} keys: ${updated.join(', ')}`);
      } catch (err: any) {
        console.error(`❌ Sync error: ${err.message || 'Please login first'}`);
      }
    });

  return cmd;
}
