import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { deriveKey, encrypt } from '../../src/utils/crypto';
import { createSession, clearSession, getSessionKey } from '../../src/utils/session';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getVaultPath } from '../../src/config/paths';
import { decrypt } from '../../src/utils/crypto';
import { loadVault, saveVault, getSecretValue, updateSecret, loadVaultForEnvironment, saveVaultForEnvironment, getAllSecretsFromAllEnvironments, cleanExpiredSecrets } from '../../src/utils/vault';
import { listEnvironments, getActiveEnvironment, setActiveEnvironment, createEnvironment, deleteEnvironment } from '../../src/utils/environments';

const router = Router();

// 🧪 DEVELOPMENT: Bypass rate limiter for testing
const noopLimiter = (req: any, res: any, next: any) => next();

// 🔐 FIXED: Rate limiting to prevent brute force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,  // ⬇️ REDUCED: 5 attempts per 15 minutes (was 50)
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many login attempts. Please try again later.' });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 3,  // 3 attempts per hour
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many password change attempts. Please try again later.' });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 🔐 Login
router.post('/login', noopLimiter as any, (req, res) => {
  const { password } = req.body;

  try {
    const key = deriveKey(password);

    // Validate password using vault
    if (fs.existsSync(getVaultPath())) {
      const vault = loadVault();
      const firstKey = Object.keys(vault)[0];

      if (firstKey) {
        const encrypted = getSecretValue(vault, firstKey);
        if (encrypted) decrypt(encrypted, key); // throws if wrong
      }
    }

    // 🧹 Clean expired secrets on login
    const environments = listEnvironments();
    for (const env of environments) {
      const vault = loadVaultForEnvironment(env);
      const { cleaned, deletedCount } = cleanExpiredSecrets(vault);
      if (deletedCount > 0) {
        saveVaultForEnvironment(cleaned, env);
        console.log(`🧹 Cleaned ${deletedCount} expired secrets from ${env} environment on login`);
      }
    }

    createSession(key);
    res.json({ success: true });
  } catch {
    res.status(401).json({ error: 'Invalid password' });
  }
});





router.post('/change-password', passwordLimiter as any, (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    // Get all environments
    const environments = listEnvironments();
    
    // 🔐 Derive keys from passwords
    const oldKey = deriveKey(oldPassword);
    const newKey = deriveKey(newPassword);

    // ✅ FIXED: Validate old password with first environment's first secret
    let canDecryptWithOldKey = false;
    for (const env of environments) {
      try {
        const vault = loadVaultForEnvironment(env);
        const firstKey = Object.keys(vault)[0];
        if (firstKey) {
          const encrypted = getSecretValue(vault, firstKey);
          if (encrypted) {
            decrypt(encrypted, oldKey);
            canDecryptWithOldKey = true;
            break;
          }
        }
      } catch (err) {
        // Try next environment
        continue;
      }
    }

    if (!canDecryptWithOldKey) {
      return res.status(401).json({ error: 'Invalid current password' });
    }

    // ✅ Re-encrypt all secrets in all environments
    for (const env of environments) {
      try {
        const vault = loadVaultForEnvironment(env);
        const decryptedSecrets: Record<string, string> = {};

        // Decrypt all secrets with old key
        for (const key of Object.keys(vault)) {
          try {
            const encrypted = getSecretValue(vault, key);
            if (encrypted) decryptedSecrets[key] = decrypt(encrypted, oldKey);
          } catch (err: any) {
            return res.status(500).json({ 
              error: `Failed to decrypt secret in ${env}: ${key}. Vault may be corrupted.` 
            });
          }
        }

        // Re-encrypt all with new key
        const updatedVault = { ...vault };
        for (const key of Object.keys(decryptedSecrets)) {
          try {
            const encrypted = encrypt(decryptedSecrets[key], newKey);
            updateSecret(updatedVault, key, encrypted);
          } catch (err: any) {
            return res.status(500).json({ 
              error: `Failed to encrypt secret in ${env}: ${key}. Password not changed.` 
            });
          }
        }

        // Save updated vault for this environment
        saveVaultForEnvironment(updatedVault, env);
      } catch (err: any) {
        return res.status(500).json({ 
          error: `Failed to update environment ${env}: ${err.message}` 
        });
      }
    }

    res.json({ success: true });

  } catch (err: any) {
    res.status(500).json({ error: 'Failed to change password: ' + err.message });
  }
});




// 🔓 Logout
router.post('/logout', (req, res) => {
  clearSession();
  res.json({ success: true });
});

// 🔧 RECOVERY: Re-encrypt vaults that are still using old password
// This helps recover from password change that didn't update all environments
router.post('/recover-vaults', (req, res) => {
  try {
    const { oldPassword } = req.body;
    
    // Get current session key (from new password)
    const { getSessionKey } = require('../../src/utils/session');
    let currentKey: Buffer;
    try {
      currentKey = getSessionKey();
    } catch {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const environments = listEnvironments();
    const oldKey = deriveKey(oldPassword);
    const recoveryResults = [];
    let recovered = 0;

    for (const env of environments) {
      const result = { env, status: 'ok', message: '' };
      
      try {
        const vault = loadVaultForEnvironment(env);
        const firstKey = Object.keys(vault)[0];
        let isEncryptedWithOldKey = false;
        
        // Check if this vault is encrypted with old key
        if (firstKey) {
          const encrypted = getSecretValue(vault, firstKey);
          if (encrypted) {
            try {
              decrypt(encrypted, currentKey);
              // Successfully decrypted with current key - vault is OK
              result.message = 'Already using current password';
            } catch {
              // Failed with current key, try old key
              try {
                decrypt(encrypted, oldKey);
                isEncryptedWithOldKey = true;
              } catch {
                result.status = 'error';
                result.message = 'Cannot decrypt with either password';
              }
            }
          }
        }

        // If vault uses old key, re-encrypt it with current key
        if (isEncryptedWithOldKey) {
          const decryptedSecrets: Record<string, string> = {};
          
          // Decrypt all with old key
          for (const key of Object.keys(vault)) {
            try {
              const encrypted = getSecretValue(vault, key);
              if (encrypted) decryptedSecrets[key] = decrypt(encrypted, oldKey);
            } catch (err: any) {
              result.status = 'error';
              result.message = `Failed to decrypt: ${err.message}`;
              throw err;
            }
          }

          // Re-encrypt all with current key
          const updatedVault = { ...vault };
          for (const key of Object.keys(decryptedSecrets)) {
            const encrypted = encrypt(decryptedSecrets[key], currentKey);
            updateSecret(updatedVault, key, encrypted);
          }

          // Save updated vault
          saveVaultForEnvironment(updatedVault, env);
          result.status = 'recovered';
          result.message = 'Re-encrypted with current password';
          recovered++;
        }
      } catch (err: any) {
        if (result.status !== 'error') {
          result.status = 'error';
          result.message = err.message;
        }
      }
      
      recoveryResults.push(result);
    }

    res.json({ 
      success: true, 
      vaultsRecovered: recovered,
      results: recoveryResults 
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Recovery failed: ' + err.message });
  }
});

// ✅ ADDED: Validation functions
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

// 🔐 Get session key (for frontend decryption)
router.get('/session-key', (req, res) => {
  try {
    const keyBuf = getSessionKey();
    // Convert Buffer to base64 for transmission
    const keyBase64 = keyBuf.toString('base64');
    res.json({ sessionKey: keyBase64 });
  } catch (err: any) {
    res.status(401).json({ error: err.message || "Not logged in" });
  }
});

// 🌍 Get available environments
router.get('/environments', (req, res) => {
  try {
    getSessionKey(); // Verify authenticated
    const envs = listEnvironments();
    const activeEnv = getActiveEnvironment();
    
    // Return both list and active environment
    const result = {
      environments: envs,
      activeEnvironment: activeEnv
    };
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message || "Not logged in" });
  }
});

// 🔐 Get secrets (ENCRYPTED VALUES - no backend decryption)
router.get('/secrets', (req, res) => {
  try {
    getSessionKey(); // Just verify authentication
    
    // 🧹 Clean expired secrets from all environments before returning
    const environments = listEnvironments();
    for (const env of environments) {
      const vault = loadVaultForEnvironment(env);
      
      const { cleaned, deletedCount } = cleanExpiredSecrets(vault);
      
      // If any secrets were deleted, save the cleaned vault
      if (deletedCount > 0) {
        saveVaultForEnvironment(cleaned, env);
        console.log(`🧹 Cleaned ${deletedCount} expired secrets from ${env} environment`);
      }
    }
    
    // Now fetch all remaining (non-expired) secrets
    const allSecrets = getAllSecretsFromAllEnvironments();

    const data = Object.keys(allSecrets).map((k) => {
      const secret = allSecrets[k];

      return {
        key: k,
        value: secret.value,
        tags: secret.tags,
        environment: secret.environment,
        expiresAt: secret.expiresAt
      };
    });

    res.json(data);
  } catch (err: any) {
    res.status(401).json({ error: err.message || "Not logged in" });
  }
});

// 🧨 Clear all secrets or specific environment
router.delete('/secrets', (req, res) => {
  try {
    getSessionKey();
    const environment = req.body?.environment; // Optional: specific environment to clear

    if (!environment) {
      // 🌍 Clear all environments
      const environments = listEnvironments();
      for (const env of environments) {
        saveVaultForEnvironment({}, env);
      }
    } else {
      // 🌍 Clear specific environment
      saveVaultForEnvironment({}, environment);
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(401).json({ error: err.message || "Not logged in" });
  }
});

// ➕ Add / update secret
router.post('/secrets', (req, res) => {
  try {
    const keyBuf = getSessionKey();
    const { key, value, tags, environment, expires } = req.body;


    // ✅ FIXED: Add validation
    const keyError = validateKey(key);
    if (keyError) {
      return res.status(400).json({ error: keyError });
    }

    const valueError = validateValue(value);
    if (valueError) {
      return res.status(400).json({ error: valueError });
    }

    // Parse expiration
    let expiresAt: number | undefined;
    if (expires) {
      // 📅 Handle duration format (e.g., "7d", "5h")
      const durationMatch = expires.match(/^(\d+)([dh])$/);
      
      if (durationMatch) {
        const amount = parseInt(durationMatch[1], 10);
        const unit = durationMatch[2];
        const now = Date.now();
        
        if (unit === 'd') {
          // Days: convert to milliseconds
          expiresAt = now + (amount * 24 * 60 * 60 * 1000);
        } else if (unit === 'h') {
          // Hours: convert to milliseconds
          expiresAt = now + (amount * 60 * 60 * 1000);
        } else {
          return res.status(400).json({ error: 'Invalid expiration unit' });
        }
      } else {
        // 📅 Try to parse as direct timestamp (from custom date picker)
        const timestamp = parseInt(expires, 10);
        if (isNaN(timestamp)) {
          return res.status(400).json({ error: 'Invalid expiration format. Use "7d", "5h", or timestamp' });
        }
        expiresAt = timestamp;
      }
    }

    // 🌍 Use environment-specific vault functions
    const targetEnv = environment || getActiveEnvironment();
    const encrypted = encrypt(value, keyBuf);
    const vault = loadVaultForEnvironment(targetEnv);
    updateSecret(vault, key, encrypted, {
      tags: tags && Array.isArray(tags) && tags.length > 0 ? tags : undefined,
      environment: targetEnv,
      expiresAt
    });
    saveVaultForEnvironment(vault, targetEnv);

    res.json({ success: true });
  } catch (err: any) {
    res.status(401).json({ error: err.message || "Not logged in" });
  }
});

// ❌ Delete secret
router.delete('/secrets/:key', (req, res) => {
  try {
    getSessionKey();
  } catch (err: any) {
    return res.status(401).json({ error: err.message || "Not logged in" });
  }

  try {
    const keyName = req.params.key;
    let deleted = false;

    // 🌍 First try current active environment
    const currentEnv = getActiveEnvironment();
    const vault = loadVaultForEnvironment(currentEnv);

    if (vault[keyName]) {
      delete vault[keyName];
      saveVaultForEnvironment(vault, currentEnv);
      deleted = true;
    }

    // 🌍 If not found in current env, search all other environments
    if (!deleted) {
      const allEnvs = listEnvironments();
      for (const env of allEnvs) {
        if (env === currentEnv) continue; // Already checked this one
        const envVault = loadVaultForEnvironment(env);
        if (envVault[keyName]) {
          delete envVault[keyName];
          saveVaultForEnvironment(envVault, env);
          deleted = true;
          break;
        }
      }
    }

    if (!deleted) {
      return res.status(404).json({ error: "Key not found" });
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete secret: " + err.message });
  }
});

// 🌍 Get environments list and active environment
router.get('/environments', (req, res) => {
  try {
    getSessionKey();
    const environments = listEnvironments();
    const active = getActiveEnvironment();

    res.json({
      environments: environments.map((env) => ({
        id: env,
        name: env,
        active: env === active
      })),
      activeEnvironment: active
    });
  } catch (err: any) {
    res.status(401).json({ error: err.message || "Not logged in" });
  }
});

// 🌍 Switch active environment
router.post('/environments/switch', (req, res) => {
  try {
    getSessionKey();
    const { environment } = req.body;

    if (!environment || typeof environment !== 'string') {
      return res.status(400).json({ error: 'environment name required' });
    }

    setActiveEnvironment(environment);
    res.json({ success: true, activeEnvironment: environment });
  } catch (err: any) {
    res.status(401).json({ error: err.message || "Not logged in" });
  }
});

// 🌍 Create new environment
router.post('/environments', (req, res) => {
  try {
    getSessionKey();
    const { name } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'environment name required' });
    }

    createEnvironment(name);
    res.json({ success: true });
  } catch (err: any) {
    res.status(401).json({ error: err.message || "Not logged in" });
  }
});

// 🌍 Delete environment
router.delete('/environments/:name', (req, res) => {
  try {
    getSessionKey();
    const { name } = req.params;

    if (name === 'default') {
      return res.status(400).json({ error: 'Cannot delete default environment' });
    }

    deleteEnvironment(name);
    res.json({ success: true });
  } catch (err: any) {
    res.status(401).json({ error: err.message || "Not logged in" });
  }
});

export default router;