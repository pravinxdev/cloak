// // commands/login.ts
// import { Command } from 'commander';
// import inquirer from 'inquirer';
// import fs from 'fs';
// import { sessionPath, getVaultPath() } from '../config/paths';
// import { decrypt, deriveKey } from '../utils/crypto';
// import path from 'path'; // Add this

// export function loginCommand() {
//   const cmd = new Command('login');

//   cmd.action(async () => {
//     const { password } = await inquirer.prompt([
//       {
//         type: 'password',
//         name: 'password',
//         message: 'Enter your vault password:',
//       },
//     ]);

//     // If vault exists, try to validate password
//     if (fs.existsSync(getVaultPath())) {
//       try {
//         const vault = JSON.parse(fs.readFileSync(getVaultPath(), 'utf-8'));

//         const testKey = Object.keys(vault)[0];
//         if (testKey) {
//           decrypt(vault[testKey], password); // If this fails, catch will run
//         }
//       } catch (err) {
//         console.log('❌ Incorrect password. Login failed.');
//         return;
//       }
//     }

//     const session = {
//       token: Buffer.from(`${Date.now()}`).toString('base64'),
//       createdAt: new Date().toISOString(),
//       createdAtTimestamp: Date.now(),
//     };
//     fs.mkdirSync(path.dirname(sessionPath), { recursive: true });
//     const key = deriveKey(password);

//     fs.writeFileSync(sessionPath, JSON.stringify({
//       ...session,
//       key: key.toString('hex') // ✅ store key, not password
//     }));
//     // fs.mkdirSync(sessionPath.replace('/session.json', ''), { recursive: true });
//     // fs.writeFileSync(sessionPath, JSON.stringify({ ...session, password }));
//     console.log('🔐 Logged in');
//   });

//   return cmd;
// }

// export function getSessionKey(): Buffer {
//   if (!fs.existsSync(sessionPath)) {
//     throw new Error('Please login first');
//   }

//   const session = JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));

//   return Buffer.from(session.key, 'hex');
// }


import { Command } from 'commander';
import inquirer from 'inquirer';
import fs from 'fs';
import { getVaultPath} from '../config/paths';
import { decrypt, deriveKey } from '../utils/crypto';
import { createSession } from '../utils/session';
import { loadVault, getSecretValue } from '../utils/vault';

export function loginCommand() {
  const cmd = new Command('login');

  cmd.action(async () => {
    const { password } = await inquirer.prompt([
      {
        type: 'password',
        name: 'password',
        message: 'Enter your vault password:',
      },
    ]);

    const key = deriveKey(password);

    // Validate password if vault exists
    if (fs.existsSync(getVaultPath())) {
      try {
        const vault = loadVault();
        const testKey = Object.keys(vault)[0];

        if (testKey) {
          const encrypted = getSecretValue(vault, testKey);
          if (encrypted) decrypt(encrypted, key);
        }else{
          console.log('🔐 Vault is empty. Creating new session.');
        }
      } catch {
        console.log('❌ Incorrect password.');
        return;
      }
    }

    createSession(key);
    console.log('🔐 Logged in');
  });

  return cmd;
}