import { scanFiles } from '../src/commands/hook';
import fs from 'fs';
import path from 'path';

describe('Git Pre-Commit Hook Secret Scanner', () => {
  const tmpDir = path.join(__dirname, 'tmp-hook-test');

  beforeAll(() => {
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('should detect OpenAI secret key in staged file', () => {
    const filePath = path.join(tmpDir, 'config.js');
    fs.writeFileSync(filePath, 'const apiKey = "sk-abcdefghijklmnopqrstuvwxyz1234567890";');

    const violations = scanFiles([filePath]);
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0].pattern).toBe('OpenAI API Key');
  });

  test('should detect plaintext .env file additions', () => {
    const filePath = path.join(tmpDir, '.env');
    fs.writeFileSync(filePath, 'SECRET_TOKEN=123456');

    const violations = scanFiles([filePath]);
    expect(violations.length).toBe(1);
    expect(violations[0].pattern).toBe('Plaintext .env File');
  });

  test('should ignore inline comment with cloakx-ignore', () => {
    const filePath = path.join(tmpDir, 'safe.js');
    fs.writeFileSync(filePath, 'const key = "sk-abcdefghijklmnopqrstuvwxyz1234567890"; // cloakx-ignore');

    const violations = scanFiles([filePath]);
    expect(violations.length).toBe(0);
  });
});