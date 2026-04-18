import { Command } from 'commander';
import { decrypt } from '../utils/crypto';
import { getSessionKey } from '../utils/session';

export function decryptCommand() {
  const cmd = new Command('decrypt');
  cmd
    .argument('<text>', 'Encrypted text')
    .action((text) => {
      try {
        const keyBuf = getSessionKey();
        
        // Validate encrypted text format (should have iv:encrypted format)
        if (!text || typeof text !== 'string' || !text.includes(':')) {
          console.error('❌ Invalid encrypted text format. Expected format: iv:encrypted_hex');
          return;
        }

        try {
          const decrypted = decrypt(text, keyBuf);
          console.log('Decrypted:', decrypted);
        } catch (cryptoErr: any) {
          if (cryptoErr.code === 'ERR_INVALID_ARG_TYPE') {
            console.error('❌ Invalid encrypted text format');
          } else if (cryptoErr.code === 'ERR_CRYPTO_INVALID_IV') {
            console.error('❌ Decryption failed - encrypted text appears to be tampered or corrupted');
          } else {
            console.error('❌ Decryption failed:', cryptoErr.message || 'Unknown error');
          }
        }
      } catch (err: any) {
        console.error('❌ ', err.message || 'Failed to decrypt');
      }
    });
  return cmd;
}
