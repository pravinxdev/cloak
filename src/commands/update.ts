// src/commands/update.ts
import { Command } from 'commander';
import { loadVault, saveVault } from '../utils/vault';
import { encrypt } from '../utils/crypto';
import { getSessionPassword } from '../utils/session';

/**
 * Update a secret value by key.
 */
export async function updateSecret(key: string, value: string): Promise<void> {
  try {
    const vault = loadVault();

    if (!vault[key]) {
      console.error(`❌ Key "${key}" does not exist.`);
      process.exit(1);
    }

    const password = await getSessionPassword();
    const encrypted = encrypt(value, password);
    vault[key] = encrypted;
    saveVault(vault);

    console.log(`✅ Key "${key}" has been updated.`);
  } catch (err: any) {
    console.error(`❌ Error updating key: ${err.message || err}`);
    process.exit(1);
  }
}

const command = new Command('upd')
  .description('Update a secret by key')
  .argument('<key>', 'Key of the secret to update')
  .argument('<value>', 'New value of the secret')
  .action(async (key, value) => {
    await updateSecret(key, value);
  });

export default command;
