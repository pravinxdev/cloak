import { Router } from 'express';
import { deriveKey, encrypt } from '../../src/utils/crypto';
import { createSession, clearSession } from '../../src/utils/session';
import fs from 'fs';
import { getVaultPath } from '../../src/config/paths';
import { decrypt } from '../../src/utils/crypto';
import { loadVault, saveVault } from '../../src/utils/vault';

const router = Router();

// 🔐 Login
router.post('/login', (req, res) => {
  const { password } = req.body;

  try {
    const key = deriveKey(password);

    // Validate password using vault
    if (fs.existsSync(getVaultPath())) {
      const vault = JSON.parse(fs.readFileSync(getVaultPath(), 'utf-8'));
      const firstKey = Object.keys(vault)[0];

      if (firstKey) {
        decrypt(vault[firstKey], key); // throws if wrong
      }
    }

    createSession(key);
    res.json({ success: true });
  } catch {
    res.status(401).json({ error: 'Invalid password' });
  }
});





router.post('/change-password', (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const vault = loadVault();

    // 🔐 Derive keys from passwords
    const oldKey = deriveKey(oldPassword);
    const newKey = deriveKey(newPassword);

    const firstKey = Object.keys(vault)[0];

    if (firstKey) {
      try {
        decrypt(vault[firstKey], oldKey);
      } catch {
        return res.status(401).json({ error: 'Invalid current password' });
      }
    }

    const updatedVault: Record<string, string> = {};

    for (const key of Object.keys(vault)) {
      const decrypted = decrypt(vault[key], oldKey);
      updatedVault[key] = encrypt(decrypted, newKey);
    }

    saveVault(updatedVault);

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: 'Failed to change password' });
  }
});




// 🔓 Logout
router.post('/logout', (req, res) => {
  clearSession();
  res.json({ success: true });
});

export default router;