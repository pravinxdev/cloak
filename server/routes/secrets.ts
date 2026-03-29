import { Router } from 'express';
import { loadVault, saveVault } from '../../src/utils/vault';
import { decrypt, encrypt } from '../../src/utils/crypto';
import { getSessionKey } from '../../src/utils/session';

const router = Router();

// GET all
router.get('/', (req, res) => {
  try {
    const key = getSessionKey();
    const vault = loadVault();

    const data = Object.keys(vault).map((k) => ({
      key: k,
      value: decrypt(vault[k], key),
    }));

    res.json(data);
  } catch {
    res.status(401).json({ error: 'Not logged in' });
  }
});

// POST add/update
router.post('/', (req, res) => {
  try {
    const { key, value } = req.body;
    const keyBuf = getSessionKey();

    const vault = loadVault();
    vault[key] = encrypt(value, keyBuf);
    saveVault(vault);

    res.json({ success: true });
  } catch {
    res.status(401).json({ error: 'Not logged in' });
  }
});

// DELETE
router.delete('/:key', (req, res) => {
  try {
    getSessionKey();
  } catch {
    return res.status(401).json({ error: 'Not logged in' });
  }

  const keyName = req.params.key;
  const vault = loadVault();

  if (!vault[keyName]) {
    return res.status(404).json({ error: 'Key not found' });
  }

  delete vault[keyName];
  saveVault(vault);

  res.json({ success: true });
});

export default router;