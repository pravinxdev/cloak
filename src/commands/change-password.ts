import { Command } from 'commander';
import readlineSync from 'readline-sync';
import { loadVault, saveVault, getSecretValue, updateSecret } from '../utils/vault';
import { encrypt, decrypt, deriveKey } from '../utils/crypto';

export function changePasswordCommand() {
  const cmd = new Command('change-password');

  cmd.description('Change vault password');

  cmd.action(() => {
    try {
      const oldPassword = readlineSync.question('Enter current password: ', {
        hideEchoBack: true,
      });

      const vault = loadVault();

      // 🔐 Validate old password
      const oldKey = deriveKey(oldPassword);
      const firstKey = Object.keys(vault)[0];
      if (firstKey) {
        try {
          const encrypted = getSecretValue(vault, firstKey);
          if (encrypted) decrypt(encrypted, oldKey);
        } catch {
          console.log('❌ Incorrect current password');
          return;
        }
      }

      // 🔐 New password
      const newPassword = readlineSync.question('Enter new password: ', {
        hideEchoBack: true,
      });

      const confirmPassword = readlineSync.question('Confirm new password: ', {
        hideEchoBack: true,
      });

      if (newPassword !== confirmPassword) {
        console.log('❌ Passwords do not match');
        return;
      }

      // 🔁 Re-encrypt all secrets
      const newKey = deriveKey(newPassword);
      const updatedVault = { ...vault };

      for (const key of Object.keys(vault)) {
        const encrypted = getSecretValue(vault, key);
        if (encrypted) {
          const decrypted = decrypt(encrypted, oldKey);
          updateSecret(updatedVault, key, encrypt(decrypted, newKey));
        }
      }

      saveVault(updatedVault);

      console.log('✅ Password updated successfully');

    } catch (err: any) {
      console.error('❌ Failed to change password:', err.message);
    }
  });

  return cmd;
}