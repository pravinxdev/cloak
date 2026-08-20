import { createSharePayload, receiveSharePayload } from '../src/commands/share';
import * as vaultModule from '../src/utils/vault';

jest.mock('../src/utils/vault');

describe('Encrypted Secret Bundle Sharing (share & receive)', () => {
  const mockLoadVault = vaultModule.loadVault as jest.Mock;
  const mockSaveVault = vaultModule.saveVault as jest.Mock;
  const mockLoadVaultForEnv = vaultModule.loadVaultForEnvironment as jest.Mock;
  const mockSaveVaultForEnv = vaultModule.saveVaultForEnvironment as jest.Mock;

  let currentVault: any = {};

  beforeEach(() => {
    currentVault = {
      DEV_DB: { value: 'postgres://localhost/dev', environment: 'development', createdAt: Date.now(), updatedAt: Date.now() },
      PROD_DB: { value: 'postgres://prod.server/main', environment: 'production', createdAt: Date.now(), updatedAt: Date.now() }
    };
    mockLoadVault.mockImplementation(() => currentVault);
    mockSaveVault.mockImplementation((updated) => { currentVault = updated; });
    mockLoadVaultForEnv.mockImplementation((env: string) => {
      const filtered: any = {};
      for (const [k, v] of Object.entries(currentVault)) {
        if ((v as any).environment === env) filtered[k] = v;
      }
      return filtered;
    });
    mockSaveVaultForEnv.mockImplementation((updated, env) => {
      currentVault = { ...currentVault, ...updated };
    });
  });

  test('should generate share token for specific environment', () => {
    const { token, count } = createSharePayload('SECRET123', 'production');
    expect(count).toBe(1);
    expect(token.startsWith('clkx_')).toBe(true);
  });

  test('should decrypt and receive payload into vault', () => {
    const { token } = createSharePayload('MYPASSCODE', 'production');
    
    // Reset vault state
    currentVault = {};
    const { importedCount } = receiveSharePayload(token, 'MYPASSCODE');

    expect(importedCount).toBe(1);
    expect(currentVault.PROD_DB.value).toBe('postgres://prod.server/main');
  });

  test('should fail decryption on wrong passcode', () => {
    const { token } = createSharePayload('RIGHT_PASS', 'production');
    expect(() => {
      receiveSharePayload(token, 'WRONG_PASS');
    }).toThrow();
  });
});
