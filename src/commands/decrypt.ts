import { Command } from 'commander';
import { decrypt } from '../utils/crypto';

export function decryptCommand() {
  const cmd = new Command('decrypt');
  cmd.argument('<text>', 'Encrypted text').action((text) => {
    const password = 'default'; // Replace with session password if needed
    const decrypted = decrypt(text, password);
    console.log('Decrypted:', decrypted);
  });
  return cmd;
}
