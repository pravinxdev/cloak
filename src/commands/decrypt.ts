import { Command } from 'commander';
import { decrypt } from '../utils/crypto';
import { getSessionKey } from '../utils/session';

export function decryptCommand() {
  const cmd = new Command('decrypt');
  cmd.argument('<text>', 'Encrypted text').action((text) => {
    const password = 'default'; // Replace with session password if needed
    const keyBuf = getSessionKey();
    
    const decrypted = decrypt(text, keyBuf);
    console.log('Decrypted:', decrypted);
  });
  return cmd;
}
