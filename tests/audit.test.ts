import { auditVault } from '../src/commands/audit';
import * as vaultModule from '../src/utils/vault';

jest.mock('../src/utils/vault');

describe('Vault Health & Expiration Auditor (audit Vault)', () => {
  const mockLoadVault = vaultModule.loadVault as jest.Mock;

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return score 100 for clean vault', () => {
    mockLoadVault.mockReturnValue({
      API_KEY: { value: 'sk-proj-valid-long-secret-key-12345678', createdAt: Date.now(), updatedAt: Date.now() }
    });

    const result = auditVault();
    expect(result.score).toBe(100);
    expect(result.findings.length).toBe(0);
  });

  test('should detect expired secrets', () => {
    const pastTime = Date.now() - 10000;
    mockLoadVault.mockReturnValue({
      EXPIRED_KEY: { value: 'some-value-12345', expiresAt: pastTime, createdAt: pastTime, updatedAt: pastTime }
    });

    const result = auditVault();
    expect(result.findings.some(f => f.type === 'EXPIRED')).toBe(true);
    expect(result.score).toBeLessThan(100);
  });

  test('should detect weak secrets and duplicate values', () => {
    mockLoadVault.mockReturnValue({
      KEY_ONE: { value: '123456', createdAt: Date.now(), updatedAt: Date.now() },
      KEY_TWO: { value: '123456', createdAt: Date.now(), updatedAt: Date.now() }
    });

    const result = auditVault();
    expect(result.findings.some(f => f.type === 'WEAK_VALUE')).toBe(true);
    expect(result.findings.some(f => f.type === 'DUPLICATE_VALUE')).toBe(true);
  });
});