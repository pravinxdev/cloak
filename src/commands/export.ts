import { Command } from 'commander';
import fs from 'fs';
import clipboard from 'clipboardy';
import { vaultPath } from '../config/paths';
import { decrypt } from '../utils/crypto';
import { getSessionKey } from '../utils/session';

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

      if (!fs.existsSync(vaultPath)) {
        console.log('🔐 Vault is empty.');
        return;
      }

      const vault = JSON.parse(fs.readFileSync(vaultPath, 'utf-8'));

      const keys = keyArg ? [keyArg] : Object.keys(vault);
      const lines: string[] = [];

      for (const k of keys) {
        if (!vault[k]) {
          console.log(`❌ No such key: ${k}`);
          continue;
        }

        if (k.startsWith('__')) continue; // skip internal keys

        try {
          let value = decrypt(vault[k], key);

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