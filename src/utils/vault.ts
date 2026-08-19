import fs from 'fs';
import path from 'path';
import { getVaultPath, baseDir } from '../config/paths';

// 📊 New vault schema with metadata support
export interface SecretMetadata {
  value: string;
  tags?: string[];
  environment?: string;
  expiresAt?: number;
  createdAt: number;
  updatedAt: number;
}

export type Vault = Record<string, SecretMetadata | string>;

// 🔄 Load vault (auto-migrates old format)
export function loadVault(): Vault {
  if (!fs.existsSync(getVaultPath())) return {};

  try {
    const raw = fs.readFileSync(getVaultPath(), 'utf-8');
    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== 'object') {
      console.warn('⚠️ Vault is empty or invalid.');
      return {};
    }

    // 🔄 Auto-migrate old format (plain strings) to new format
    const migrated = migrateVault(parsed);
    
    // ✅ If migration happened, save the new format
    if (migrated !== parsed) {
      saveVault(migrated);
    }

    return migrated;
  } catch (err) {
    console.error('⚠️ Failed to load vault:', err);
    return {};
  }
}

// 🔄 Migrate old vault format to new format
function migrateVault(vault: any): Vault {
  const migrated: Vault = {};
  const now = Date.now();

  for (const [key, value] of Object.entries(vault)) {
    if (typeof value === 'string') {
      // Old format: convert to new format
      migrated[key] = {
        value,
        tags: [],
        environment: 'default',
        createdAt: now,
        updatedAt: now
      };
    } else if (typeof value === 'object' && value !== null && 'value' in value) {
      // Already in new format
      const metadata = value as any;
      migrated[key] = {
        value: metadata.value as string,
        tags: (metadata.tags as string[]) || [],
        environment: (metadata.environment as string) || 'default',
        expiresAt: metadata.expiresAt as number | undefined,  // ✅ PRESERVE expiresAt!
        createdAt: (metadata.createdAt as number) || now,
        updatedAt: (metadata.updatedAt as number) || now
      };
    }
  }

  return migrated;
}

export function saveVault(vault: Vault): void {
  try {
    fs.writeFileSync(getVaultPath(), JSON.stringify(vault, null, 2), 'utf-8');
  } catch (err) {
    console.error('❌ Failed to save vault:', err);
    process.exit(1);
  }
}

// 🌍 Load vault for a specific environment
export function loadVaultForEnvironment(environment: string): Vault {
  const vaultPath = path.join(baseDir, `${environment}.vault.json`);
  
  if (!fs.existsSync(vaultPath)) return {};

  try {
    const raw = fs.readFileSync(vaultPath, 'utf-8');
    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== 'object') {
      return {};
    }

    // 🔄 Auto-migrate old format
    const migrated = migrateVault(parsed);
    
    // ✅ If migration happened, save the new format
    if (migrated !== parsed) {
      saveVaultForEnvironment(migrated, environment);
    }

    return migrated;
  } catch (err) {
    return {};
  }
}

// 🌍 Save vault for a specific environment
export function saveVaultForEnvironment(vault: Vault, environment: string): void {
  try {
    const vaultPath = path.join(baseDir, `${environment}.vault.json`);
    
    fs.writeFileSync(vaultPath, JSON.stringify(vault, null, 2), 'utf-8');
  } catch (err) {
    console.error('❌ Failed to save vault:', err);
    process.exit(1);
  }
}

// 📖 Get secret value (handles old & new format)
export function getSecretValue(vault: Vault, key: string): string | null {
  const secret = vault[key];
  if (!secret) return null;
  if (typeof secret === 'string') return secret;
  return secret.value;
}

// 📝 Update secret with metadata
export function updateSecret(
  vault: Vault,
  key: string,
  value: string,
  metadata?: {
    tags?: string[];
    environment?: string;
    expiresAt?: number | null; // null explicitly clears the expiry; undefined preserves the existing value
  }
): Vault {
  const now = Date.now();
  const existing = vault[key];

  // expiresAt semantics: explicit null clears the expiry, a number sets it,
  // and undefined preserves whatever the secret already had.
  const expiresAt = metadata?.expiresAt === undefined
    ? (typeof existing === 'object' ? existing.expiresAt : undefined)
    : metadata.expiresAt;

  vault[key] = {
    value,
    tags: metadata?.tags || (typeof existing === 'object' ? existing.tags : []),
    environment: metadata?.environment || (typeof existing === 'object' ? existing.environment : 'default'),
    // Drop the key entirely when cleared so the vault file stays clean
    ...(expiresAt === null || expiresAt === undefined ? {} : { expiresAt }),
    createdAt: typeof existing === 'object' ? existing.createdAt : now,
    updatedAt: now
  };

  return vault;
}

// 🏷️ Get secrets by tag
export function getByTag(vault: Vault, tag: string): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const [key, secret] of Object.entries(vault)) {
    const meta = typeof secret === 'string' ? { tags: [] } : secret;
    if (meta.tags?.includes(tag)) {
      result[key] = getSecretValue(vault, key) || '';
    }
  }

  return result;
}

// 🌍 Get secrets by environment
export function getByEnvironment(vault: Vault, env: string): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const [key, secret] of Object.entries(vault)) {
    const meta = typeof secret === 'string' ? { environment: 'default' } : secret;
    if ((meta.environment || 'default') === env) {
      result[key] = getSecretValue(vault, key) || '';
    }
  }

  return result;
}

// ⏰ Check if secret is expired
export function isExpired(vault: Vault, key: string): boolean {
  const secret = vault[key];
  if (typeof secret === 'string') return false;
  if (!secret.expiresAt) return false;
  return Date.now() > secret.expiresAt;
}

// ⏰ Check if secret expires soon (within 7 days)
export function expiringsoon(vault: Vault, key: string): boolean {
  const secret = vault[key];
  if (typeof secret === 'string') return false;
  if (!secret.expiresAt) return false;
  const daysUntilExpiry = (secret.expiresAt - Date.now()) / (1000 * 60 * 60 * 24);
  return daysUntilExpiry < 7 && daysUntilExpiry > 0;
}

// 🗑️ Clean expired secrets from vault
export function cleanExpiredSecrets(vault: Vault): { cleaned: Vault; deletedCount: number } {
  const cleaned: Vault = {};
  let deletedCount = 0;
  const now = Date.now();

  for (const [key, value] of Object.entries(vault)) {
    const secret = typeof value === 'string' ? { expiresAt: undefined } : value;
    
    // Keep secret if it's not expired
    if (!secret.expiresAt || now <= secret.expiresAt) {
      cleaned[key] = value;
    } else {
      // Secret is expired, skip it (delete)
      deletedCount++;
      console.log(`🗑️ Removed expired secret: ${key}`);
    }
  }

  return { cleaned, deletedCount };
}

// 📊 Get metadata for a secret
export function getMetadata(vault: Vault, key: string) {
  const secret = vault[key];
  if (typeof secret === 'string') {
    return {
      tags: [],
      environment: 'default',
      expiresAt: undefined,
      createdAt: 0,
      updatedAt: 0
    };
  }
  return secret;
}

// 🌍 Load all secrets from all environments (for web UI)
// Returns a flat list with environment context, handling duplicates across environments.
// Naming: the first-seen key (default env preferred) keeps the plain name; on a
// cross-environment collision every copy is stored as `key@<environment>`.
export function getAllSecretsFromAllEnvironments(): Record<string, SecretMetadata> {
  const allSecrets: Record<string, SecretMetadata> = {};
  // Track which environments have already been recorded for each plain key, so
  // collisions are resolved deterministically and no secret is ever dropped.
  const seenFor: Record<string, Set<string>> = {};

  try {
    // Read all .vault.json files from the vault directory
    const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.vault.json'));

    // Sort files to ensure consistent ordering (default first, then alphabetically)
    files.sort((a, b) => {
      if (a === 'default.vault.json') return -1;
      if (b === 'default.vault.json') return 1;
      return a.localeCompare(b);
    });

    for (const file of files) {
      const vaultPath = path.join(baseDir, file);
      try {
        const raw = fs.readFileSync(vaultPath, 'utf-8');
        const vault = JSON.parse(raw);

        // Merge all secrets from this environment's vault
        for (const [key, secret] of Object.entries(vault)) {
          if (typeof secret !== 'object' || secret === null) continue;
          const metadata = secret as SecretMetadata;
          const env = metadata.environment || 'default';

          if (!seenFor[key]) {
            // First encounter of this plain key anywhere → keep the plain name
            allSecrets[key] = metadata;
            seenFor[key] = new Set([env]);
          } else if (seenFor[key].has(env)) {
            // Same key from the same environment already recorded — keep the first
            continue;
          } else {
            // Cross-environment collision.
            if (allSecrets[key]) {
              // The plain name is still occupied → promote it to its suffixed form
              const existingEnv = allSecrets[key].environment || 'default';
              if (!allSecrets[`${key}@${existingEnv}`]) {
                allSecrets[`${key}@${existingEnv}`] = allSecrets[key];
              }
              delete allSecrets[key];
            }
            // Store the newcomer under its environment suffix
            if (!allSecrets[`${key}@${env}`]) {
              allSecrets[`${key}@${env}`] = metadata;
            }
            seenFor[key].add(env);
          }
        }
      } catch (err) {
        // Skip invalid vault files
        continue;
      }
    }
  } catch (err) {
    // Return empty if directory doesn't exist
  }

  return allSecrets;
}
