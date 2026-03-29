import { Command } from 'commander';
import { encrypt } from '../utils/crypto';
import { getSessionKey } from '../utils/session';

export function encryptCommand() {
  const cmd = new Command('encrypt');
  cmd.argument('<text>', 'Text to encrypt').action((text) => {
    const password = 'default'; // Replace with session password if needed
    const keyBuf = getSessionKey();
    
    const encrypted = encrypt(text, keyBuf);
    console.log('Encrypted:', encrypted);
  });
  return cmd;
}
