import { Command } from 'commander';
import fs from 'fs';
import clipboard from 'clipboardy';
import { decrypt } from '../utils/crypto';
import { getSessionKey } from '../utils/session';
import { loadVault, getSecretValue } from '../utils/vault';

function maskValue(value: string): string {
  if (value.length <= 4) return '****';
  return value.slice(0, 2) + '****' + value.slice(-2);
}

export function exportCommand() {
  const cmd = new Command('export');

  cmd
    .description('Export secrets as .env format')
    .argument('[key]', 'Export specific key (optional)')
    .option('-f, --file <path>', 'Write to file (e.g., .env)')
    .option('-m, --masked', 'Mask values')
    .option('-c, --copy', 'Copy output to clipboard')
    .action((keyArg, options) => {
      let key: Buffer;

      try {
        key = getSessionKey();
      } catch {
        console.log('❌ Please login first');
        return;
      }

      const vault = loadVault();
      if (!vault || Object.keys(vault).length === 0) {
        console.log('🔐 Vault is empty.');
        return;
      }

      const keys = keyArg ? [keyArg] : Object.keys(vault);
      const lines: string[] = [];

      for (const k of keys) {
        const encrypted = getSecretValue(vault, k);
        if (!encrypted) {
          console.log(`❌ No such key: ${k}`);
          continue;
        }

        if (k.startsWith('__')) continue; // skip internal keys

        try {
          let value = decrypt(encrypted, key);

          if (options.masked) {
            value = maskValue(value);
          }

          lines.push(`${k}=${value}`);
        } catch {
          console.log(`⚠️ Failed to decrypt key: ${k}`);
        }
      }

      const output = lines.join('\n');

      // 👉 Write to file
      if (options.file) {
        fs.writeFileSync(options.file, output);
        console.log(`✅ Exported to ${options.file}`);
      }

      // 👉 Copy to clipboard
      if (options.copy) {
        clipboard.writeSync(output);
        console.log('📋 Copied to clipboard');
      }

      // 👉 Default print
      if (!options.file && !options.copy) {
        console.log(output);
      }
    });

  return cmd;
}