// import { Command } from 'commander';
// import fs from 'fs';
// import inquirer from 'inquirer';
// import { getVaultPath() } from '../config/paths';
// import { encrypt } from '../utils/crypto';
// import { getSessionKey } from '../utils/session';

// export function importCommand() {
//   const cmd = new Command('import');

//   cmd
//     .argument('<file>', 'Path to .env or shared file')
//     .description('Import secrets from file')
//     .action(async (file) => {
//       let key: Buffer;

//       try {
//         key = getSessionKey();
//       } catch {
//         console.log('❌ Please login first');
//         return;
//       }

//       if (!fs.existsSync(file)) {
//         console.log('❌ File not found');
//         return;
//       }

//       const content = fs.readFileSync(file, 'utf-8');
//       const lines = content.split('\n').filter(Boolean);

//       let vault: Record<string, string> = {};

//       if (fs.existsSync(getVaultPath())) {
//         vault = JSON.parse(fs.readFileSync(getVaultPath(), 'utf-8'));
//       }

//       for (const line of lines) {
//         const [k, v] = line.split('=');

//         if (!k) continue;

//         // If masked → ask user
//         let value = v;

//         if (v.includes('*')) {
//           const answer = await inquirer.prompt([
//             {
//               type: 'input',
//               name: 'value',
//               message: `Enter value for ${k}:`,
//             },
//           ]);

//           value = answer.value;
//         }

//         const encrypted = encrypt(value, key);
//         vault[k] = encrypted;

//         console.log(`✅ Imported ${k}`);
//       }

//       fs.writeFileSync(getVaultPath(), JSON.stringify(vault, null, 2));
//     });

//   return cmd;
// }
import { Command } from 'commander';
import fs from 'fs';
import inquirer from 'inquirer';
import { getVaultPath } from '../config/paths';
import { encrypt } from '../utils/crypto';
import { getSessionKey } from '../utils/session';

export function importCommand() {
    const cmd = new Command('import');

    cmd
        .argument('<file>', 'Path to .env or shared file')
        .option('--use-existing', 'Use values from file without prompting')
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

            let vault: Record<string, string> = {};

            if (fs.existsSync(getVaultPath())) {
                vault = JSON.parse(fs.readFileSync(getVaultPath(), 'utf-8'));
            }

            for (const line of lines) {
                const [k, v] = line.split('=');

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
                vault[k] = encrypted;

                console.log(`✅ Imported ${k}`);
            }

            fs.writeFileSync(getVaultPath(), JSON.stringify(vault, null, 2));
        });

    return cmd;
}