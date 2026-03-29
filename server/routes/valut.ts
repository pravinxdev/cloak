import { Router } from 'express';
import { loadVault, saveVault } from '../../src/utils/vault';
import { decrypt, encrypt } from '../../src/utils/crypto';
import { getSessionKey } from '../../src/utils/session';

const router = Router();

// 📤 Export
router.get('/export', (req, res) => {
  try {
    const key = getSessionKey();
    const vault = loadVault();

    const lines = Object.keys(vault).map(
      (k) => `${k}=${decrypt(vault[k], key)}`
    );

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
      const [k, v] = line.split('=');
      if (!k || !v) continue;

      vault[k] = encrypt(v, key);
    }

    saveVault(vault);
    res.json({ success: true });
  } catch {
    res.status(401).json({ error: 'Not logged in' });
  }
});

export default router;