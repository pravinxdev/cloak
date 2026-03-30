import { Router } from 'express';
import { deriveKey } from '../../src/utils/crypto';
import { createSession, clearSession } from '../../src/utils/session';
import fs from 'fs';
import { getVaultPath } from '../../src/config/paths';
import { decrypt } from '../../src/utils/crypto';

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

// 🔓 Logout
router.post('/logout', (req, res) => {
  clearSession();
  res.json({ success: true });
});

export default router;