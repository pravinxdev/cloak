import { Command } from 'commander';
import { loadVault, loadVaultForEnvironment, saveVault, saveVaultForEnvironment, SecretMetadata } from '../utils/vault';
import { getActiveEnvironment } from '../utils/environments';
import { deriveKey, encrypt, decrypt } from '../utils/crypto';
import crypto from 'crypto';

export interface EncryptedPayload {
  version: string;
  createdAt: number;
  environment?: string;
  count: number;
  data: string; // AES-256 encrypted JSON string of secrets map
}

export const SHARE_PASSCODE_MIN_LENGTH = 8;
export const SHARE_PASSCODE_MAX_LENGTH = 128;
export const ALL_ENVIRONMENTS = '__all__';

export function validateSharePasscode(passcode: unknown): asserts passcode is string {
  if (typeof passcode !== 'string' || passcode.trim().length === 0) {
    throw new Error('Passcode is required.');
  }

  if (passcode.length < SHARE_PASSCODE_MIN_LENGTH) {
    throw new Error(`Passcode must be at least ${SHARE_PASSCODE_MIN_LENGTH} characters.`);
  }

  if (passcode.length > SHARE_PASSCODE_MAX_LENGTH) {
    throw new Error(`Passcode must be no more than ${SHARE_PASSCODE_MAX_LENGTH} characters.`);
  }
}

export function createSharePayload(passcode: string, envFilter?: string): { token: string; count: number } {
  validateSharePasscode(passcode);
  const shareAllEnvironments = envFilter === ALL_ENVIRONMENTS;
  const env = envFilter && !shareAllEnvironments ? envFilter : getActiveEnvironment();
  const vault = envFilter && !shareAllEnvironments ? loadVaultForEnvironment(envFilter) : loadVault();
  const keys = Object.keys(vault);
  const secretsToShare: Record<string, SecretMetadata | string> = {};

  for (const key of keys) {
    const raw = vault[key];
    const metadata: SecretMetadata = typeof raw === 'string'
      ? { value: raw, createdAt: Date.now(), updatedAt: Date.now(), environment: env }
      : raw;

    const entryEnv = metadata.environment || env;
    if (!envFilter || shareAllEnvironments || entryEnv === envFilter) {
      secretsToShare[key] = metadata;
    }
  }

  const count = Object.keys(secretsToShare).length;
  if (count === 0) {
    return { token: '', count: 0 };
  }

  const derivedKey = deriveKey(passcode);
  const encryptedData = encrypt(JSON.stringify(secretsToShare), derivedKey);

  const payload: EncryptedPayload = {
    version: '1.0',
    createdAt: Date.now(),
    environment: shareAllEnvironments ? 'all' : envFilter || env,
    count,
    data: encryptedData
  };

  const payloadStr = JSON.stringify(payload);
  const token = 'clkx_' + Buffer.from(payloadStr).toString('base64url');

  return { token, count };
}

export function receiveSharePayload(token: string, passcode: string): { importedCount: number; environment?: string } {
  validateSharePasscode(passcode);
  if (!token.startsWith('clkx_')) {
    throw new Error('Invalid CloakX share token format.');
  }

  const rawBase64 = token.replace('clkx_', '');
  const payloadStr = Buffer.from(rawBase64, 'base64url').toString('utf8');
  const payload: EncryptedPayload = JSON.parse(payloadStr);

  const derivedKey = deriveKey(passcode);
  const decryptedJson = decrypt(payload.data, derivedKey);
  const secretsMap: Record<string, SecretMetadata | string> = JSON.parse(decryptedJson);

  const targetEnv = payload.environment && payload.environment !== 'all' ? payload.environment : getActiveEnvironment();
  const vault = loadVaultForEnvironment(targetEnv);
  let count = 0;

  for (const [key, val] of Object.entries(secretsMap)) {
    vault[key] = val;
    count++;
  }

  if (targetEnv === 'default') {
    saveVault(vault);
  } else {
    saveVaultForEnvironment(vault, targetEnv);
  }

  return { importedCount: count, environment: targetEnv };
}

export function shareCommand(): Command {
  const command = new Command('share');

  command
    .description('Share encrypted environment secrets via one-time payload token')
    .option('--env <environment>', 'Specify environment to package')
    .option('--passcode <passcode>', 'Custom passcode (auto-generated if omitted)')
    .action((options) => {
      const passcode = options.passcode || crypto.randomBytes(4).toString('hex').toUpperCase();

      try {
        const { token, count } = createSharePayload(passcode, options.env);
        if (count === 0) {
          console.log(`ℹ️ No secrets found for environment '${options.env || 'active'}'.`);
          return;
        }

        console.log(`\n✔ Encrypted ${count} secret(s) from environment '${options.env || 'active'}'.`);
        console.log(`🔑 Passcode: ${passcode}\n`);
        console.log(`Shareable Token Payload:\n${token}\n`);
        console.log(`Recipient command:\n  cloakx receive ${token} --passcode ${passcode}\n`);
      } catch (err: any) {
        console.error(`❌ Failed to package share payload: ${err.message}`);
      }
    });

  return command;
}

export function receiveCommand(): Command {
  const command = new Command('receive');

  command
    .description('Import an encrypted share payload token into active vault')
    .argument('<token>', 'The clkx_ token payload')
    .option('--passcode <passcode>', 'Passcode to decrypt the payload')
    .action((token, options) => {
      if (!options.passcode) {
        console.error('❌ Passcode is required to decrypt token. Use --passcode <passcode>');
        process.exit(1);
      }

      try {
        const { importedCount, environment } = receiveSharePayload(token, options.passcode);
        console.log(`\n✔ Successfully imported ${importedCount} secret(s) into environment '${environment || 'default'}'.`);
      } catch (err: any) {
        console.error(`❌ Failed to decrypt or import share payload: Incorrect passcode or corrupt token.`);
        process.exit(1);
      }
    });

  return command;
}
