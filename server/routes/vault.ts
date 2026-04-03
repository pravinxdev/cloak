import { Router } from 'express';
import { loadVault, saveVault, getSecretValue, updateSecret } from '../../src/utils/vault';
import { decrypt, encrypt } from '../../src/utils/crypto';
import { getSessionKey } from '../../src/utils/session';

const router = Router();

// 📤 Export
router.get('/export', (req, res) => {
  try {
    const key = getSessionKey();
    const vault = loadVault();

    const lines = Object.keys(vault).map((k) => {
      const encrypted = getSecretValue(vault, k);
      const value = encrypted ? decrypt(encrypted, key) : '';
      return `${k}=${value}`;
    });

    res.send(lines.join('\n'));
  } catch {
    res.status(401).json({ error: 'Not logged in' });
  }
});

// 📥 Import
router.post('/import', (req, res) => {
  try {
    const key = getSessionKey();
    const vault = loadVault();

    const lines = req.body.data.split('\n');

    for (const line of lines) {
      // ✅ FIXED: Split on first '=' only to handle values with '='
      const eqIndex = line.indexOf('=');
      if (eqIndex === -1) continue;
      
      const k = line.slice(0, eqIndex).trim();
      const v = line.slice(eqIndex + 1).trim();
      
      if (!k || !v) continue;

      const encrypted = encrypt(v, key);
      updateSecret(vault, k, encrypted);
    }

    saveVault(vault);
    res.json({ success: true });
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Not logged in' });
  }
});

export default router;