import { Command } from 'commander';
import { spawn } from 'child_process';
import { loadVault } from '../utils/vault';
import { decrypt } from '../utils/crypto';
import { getSessionKey } from '../utils/session';

export function runCommand() {
  const cmd = new Command('run');

  cmd
    .description('Run a command with injected secrets')
    .argument('<command...>', 'Command to execute')
    .action(async (commandParts: string[]) => {
      try {
        const key = getSessionKey();
        const vault = loadVault();

        // 🔐 decrypt all secrets
        const envVars: Record<string, string> = {};

        for (const k of Object.keys(vault)) {
          envVars[k] = decrypt(vault[k], key);
        }

        // 🧠 Merge with existing env
        const env = {
          ...process.env,
          ...envVars,
        };

        // 🚀 Run command
        const child = spawn(commandParts.join(' '), {
          shell: true,
          stdio: 'inherit',
          env,
        });

        child.on('exit', (code) => {
          process.exit(code || 0);
        });

      } catch (err: any) {
        console.error('❌ Failed to run command:', err.message);
        process.exit(1);
      }
    });

  return cmd;
}