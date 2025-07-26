import fs from 'fs';
import { vaultPath } from '../config/paths';

export function loadVault(): Record<string, string> | null {
  if (!fs.existsSync(vaultPath)) return null;

  try {
    const raw = fs.readFileSync(vaultPath, 'utf-8');
    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== 'object') {
      console.warn('⚠️ Vault is empty or invalid.');
      return {};
    }

    return parsed;
  } catch (err) {
    console.error('⚠️ Failed to load vault:', err);
    return null;
  }
}
