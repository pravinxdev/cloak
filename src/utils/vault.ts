import fs from 'fs';
import { getVaultPath } from '../config/paths';

export function loadVault(): Record<string, string> {
  if (!fs.existsSync(getVaultPath())) return {};

  try {
    const raw = fs.readFileSync(getVaultPath(), 'utf-8');
    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== 'object') {
      console.warn('⚠️ Vault is empty or invalid.');
      return {};
    }

    return parsed;
  } catch (err) {
    console.error('⚠️ Failed to load vault:', err);
    return {};
  }
}

export function saveVault(vault: Record<string, string>): void {
  try {
    fs.writeFileSync(getVaultPath(), JSON.stringify(vault, null, 2), 'utf-8');
  } catch (err) {
    console.error('❌ Failed to save vault:', err);
    process.exit(1);
  }
}
