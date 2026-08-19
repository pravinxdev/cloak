import { deriveKey, encrypt, decrypt } from '../src/utils/crypto';
import { cleanExpiredSecrets, Vault } from '../src/utils/vault';

console.log('Running Cloakx Unit Tests...');

// Test 1: Encryption & Decryption
const key = deriveKey('myPassword123');
const text = 'API_KEY_SECRET_VALUE';
const enc = encrypt(text, key);
const dec = decrypt(enc, key);

if (dec !== text) {
  console.error('❌ Test 1 Failed: Encryption/Decryption mismatch');
  process.exit(1);
} else {
  console.log('✅ Test 1 Passed: Encryption & Decryption works!');
}

// Test 2: Expired Secrets Cleanup
const pastEpoch = Date.now() - 100000;
const futureEpoch = Date.now() + 100000;
const nowTime = Date.now();

const testVault: Vault = {
  OLD_KEY: { value: 'enc1', expiresAt: pastEpoch, createdAt: nowTime, updatedAt: nowTime },
  NEW_KEY: { value: 'enc2', expiresAt: futureEpoch, createdAt: nowTime, updatedAt: nowTime }
};

const result = cleanExpiredSecrets(testVault);
if (result.cleaned['OLD_KEY'] || !result.cleaned['NEW_KEY']) {
  console.error('❌ Test 2 Failed: Expired secret filtering failed');
  process.exit(1);
} else {
  console.log('✅ Test 2 Passed: Expired secrets automatically cleaned!');
}

console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');
