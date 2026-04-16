import { Router } from 'express';
import { loadVault, saveVault, getSecretValue, updateSecret } from '../../src/utils/vault';
import { decrypt, encrypt } from '../../src/utils/crypto';
import { getSessionKey } from '../../src/utils/session';
import { parseExpiration } from '../../src/utils/expiration';

const router = Router();

// 🔐 Validate input
function validateKey(key: any): string | null {
  if (!key || typeof key !== 'string') {
    return 'Key must be a non-empty string';
  }
  if (key.length > 256) {
    return 'Key is too long (max 256 characters)';
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
    return 'Key can only contain letters, numbers, hyphens, and underscores';
  }
  return null;
}

function validateValue(value: any): string | null {
  if (typeof value !== 'string') {
    return 'Value must be a string';
  }
  if (value.length > 1000000) {
    return 'Value is too large (max 1MB)';
  }
  return null;
}

// GET all
router.get('/', (req, res) => {
  // 🔐 Validate Content-Type
  if (req.headers['content-type'] && !req.headers['content-type'].includes('application/json')) {
    return res.status(415).json({ error: 'Content-Type must be application/json' });
  }

  try {
    const key = getSessionKey();
    const vault = loadVault();

    const data = Object.keys(vault).map((k) => {
      const encrypted = getSecretValue(vault, k);
      const value = encrypted ? decrypt(encrypted, key) : '';
      
      // Return metadata + decrypted value
      const secret = vault[k];
      const metadata = typeof secret === 'string' ? {} : {
        tags: secret.tags,
        environment: secret.environment,
        expiresAt: secret.expiresAt
      };

      return {
        key: k,
        value,
        ...metadata
      };
    });

    res.json(data);
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Not logged in' });
  }
});

// POST add/update
router.post('/', (req, res) => {
  // 🔐 Validate Content-Type
  if (!req.headers['content-type']?.includes('application/json')) {
    return res.status(415).json({ error: 'Content-Type must be application/json' });
  }

  try {
    const { key, value, tags, environment, expires } = req.body;
    
    // Validate inputs
    const keyError = validateKey(key);
    if (keyError) {
      return res.status(400).json({ error: keyError });
    }

    const valueError = validateValue(value);
    if (valueError) {
      return res.status(400).json({ error: valueError });
    }

    const keyBuf = getSessionKey();
    const encrypted = encrypt(value, keyBuf);

    // Parse expiration if provided
    let expiresAt: number | undefined;
    if (expires) {
      const parsed = parseExpiration(expires);
      if (!parsed) {
        return res.status(400).json({ error: 'Invalid expiration format' });
      }
      expiresAt = parsed;
    }

    const vault = loadVault();
    updateSecret(vault, key, encrypted, {
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : undefined,
      environment,
      expiresAt
    });
    saveVault(vault);

    res.json({ success: true });
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Not logged in' });
  }
});

// DELETE specific key
router.delete('/:key', (req, res) => {
  try {
    getSessionKey();
  } catch (err: any) {
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

// DELETE all (clear vault)
router.delete('/', (req, res) => {
  try {
    getSessionKey();
  } catch (err: any) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  try {
    saveVault({});
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to clear vault' });
  }
});

export default router;