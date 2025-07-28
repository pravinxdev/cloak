// commands/login.ts
import { Command } from 'commander';
import inquirer from 'inquirer';
import fs from 'fs';
import { sessionPath, vaultPath } from '../config/paths';
import { decrypt } from '../utils/crypto';
import path from 'path'; // Add this

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

    // If vault exists, try to validate password
    if (fs.existsSync(vaultPath)) {
      try {
        const vault = JSON.parse(fs.readFileSync(vaultPath, 'utf-8'));

        const testKey = Object.keys(vault)[0];
        if (testKey) {
          decrypt(vault[testKey], password); // If this fails, catch will run
        }
      } catch (err) {
        console.log('❌ Incorrect password. Login failed.');
        return;
      }
    }

    const session = {
      token: Buffer.from(`${Date.now()}`).toString('base64'),
      createdAt: new Date().toISOString(),
      createdAtTimestamp: Date.now(),
    };
    fs.mkdirSync(path.dirname(sessionPath), { recursive: true });

    // fs.mkdirSync(sessionPath.replace('/session.json', ''), { recursive: true });
    fs.writeFileSync(sessionPath, JSON.stringify({ ...session, password }));
    console.log('🔐 Logged in');
  });

  return cmd;
}
 