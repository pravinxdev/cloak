import { Command } from 'commander';
import { encrypt } from '../utils/crypto';

export function encryptCommand() {
  const cmd = new Command('encrypt');
  cmd.argument('<text>', 'Text to encrypt').action((text) => {
    const password = 'default'; // Replace with session password if needed
    const encrypted = encrypt(text, password);
    console.log('Encrypted:', encrypted);
  });
  return cmd;
}
