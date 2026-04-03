import { Command } from 'commander';
import fs from 'fs';
import inquirer from 'inquirer';
import { encrypt } from '../utils/crypto';
import { getSessionKey } from '../utils/session';
import { loadVault, saveVault, updateSecret } from '../utils/vault';
import { getActiveEnvironment } from '../utils/environments';

export function importCommand() {
    const cmd = new Command('import');

    cmd
        .argument('<file>', 'Path to .env or shared file')
        .option('--use-existing', 'Use values from file without prompting')
        .option('--env <environment>', 'Environment for imported secrets')
        .description('Import secrets from file')
        .action(async (file, options) => {
            let key: Buffer;

            try {
                key = getSessionKey();
            } catch {
                console.log('❌ Please login first');
                return;
            }

            if (!fs.existsSync(file)) {
                console.log('❌ File not found');
                return;
            }

            const content = fs.readFileSync(file, 'utf-8');
            const lines = content.split('\n').filter(Boolean);
            const vault = loadVault();
            const environment = options.env || getActiveEnvironment();

            for (const line of lines) {
                // ✅ FIXED: Split on first '=' only to handle values with '='
                const eqIndex = line.indexOf('=');
                if (eqIndex === -1) continue;
                
                const k = line.slice(0, eqIndex).trim();
                const v = line.slice(eqIndex + 1).trim();

                if (!k || !v) continue;

                let finalValue = v;

                // 🔥 If NOT using fast mode → ask user
                if (!options.useExisting) {
                    const answer = await inquirer.prompt([
                        {
                            type: 'input',
                            name: 'value',
                            message: `🔑 ${k}: Use file value (${v}) or enter new:`,
                            default: v, // 👈 pressing enter keeps existing
                        },
                    ]);

                    finalValue = answer.value;
                }

                const encrypted = encrypt(finalValue, key);
                updateSecret(vault, k, encrypted, { environment });

                console.log(`✅ Imported ${k}`);
            }

            saveVault(vault);
        });

    return cmd;
}