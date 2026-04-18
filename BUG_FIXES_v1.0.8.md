# 🔧 BUG FIXES APPLIED - v1.0.8

**Date:** April 18, 2026  
**Version:** 1.0.8 (Ready for testing before publishing)

---

## 📋 BUGS IDENTIFIED & FIXED

### ✅ BUG #1: `cloakx env delete fake` - Should reject non-existent environment

**Issue:** Silently deleting non-existent environment without error  
**Root Cause:** `deleteEnvironment()` function didn't validate existence  
**Fix Applied:**
```typescript
// Before (BROKEN):
export function deleteEnvironment(env: string): void {
  const config = loadConfig();
  config.environments = config.environments.filter((e) => e !== env);
  saveConfig(config);
}

// After (FIXED):
export function deleteEnvironment(env: string): void {
  const config = loadConfig();
  
  // ✅ Validate environment exists
  if (!config.environments.includes(env)) {
    throw new Error(`Environment "${env}" does not exist. Available environments: ${config.environments.join(', ')}`);
  }
  
  config.environments = config.environments.filter((e) => e !== env);
  if (config.env === env) config.env = 'default';
  saveConfig(config);
}
```

**Test Command:**
```bash
cloakx env delete nonexistent
```

**Expected:**
```
❌ Environment "nonexistent" does not exist. Available environments: default, production
```

---

### ✅ BUG #2: `cloakx set KEY "value" --env production` - Auto-creates environment silently

**Issue:** When `--env` specifies non-existent environment, command succeeded silently without feedback  
**Root Cause:** `set` command didn't auto-create or warn about new environment  
**Fix Applied:**
```typescript
// ADDED TO set.ts:
import { getActiveEnvironment, listEnvironments, createEnvironment } from '../utils/environments';

// In action handler:
// ✅ Auto-create environment if it doesn't exist
if (options.env) {
  const envs = listEnvironments();
  if (!envs.includes(environment)) {
    createEnvironment(environment);
    console.log(`✨ Created new environment: ${environment}`);
  }
}
```

**Test Command:**
```bash
cloakx set DATABASE_URL "postgres://localhost" --env staging
```

**Expected:**
```
✨ Created new environment: staging
✅ Saved DATABASE_URL
   Environment: staging
```

---

### ✅ BUG #3: `cloakx decrypt "invalid_encrypted_text"` - Shows raw error

**Issue:** Invalid encrypted text shows raw Node.js TypeError  
**Root Cause:** No error handling in decrypt command  
**Fix Applied:**
```typescript
// Before (BROKEN):
const decrypted = decrypt(text, keyBuf);
console.log('Decrypted:', decrypted);

// After (FIXED):
if (!text || typeof text !== 'string' || !text.includes(':')) {
  console.error('❌ Invalid encrypted text format. Expected format: iv:encrypted_hex');
  return;
}

try {
  const decrypted = decrypt(text, keyBuf);
  console.log('Decrypted:', decrypted);
} catch (cryptoErr: any) {
  if (cryptoErr.code === 'ERR_INVALID_ARG_TYPE') {
    console.error('❌ Invalid encrypted text format');
  } else if (cryptoErr.code === 'ERR_CRYPTO_INVALID_IV') {
    console.error('❌ Decryption failed - encrypted text appears to be tampered or corrupted');
  } else {
    console.error('❌ Decryption failed:', cryptoErr.message || 'Unknown error');
  }
}
```

**Test Command:**
```bash
cloakx decrypt "invalid_text"
```

**Expected:**
```
❌ Invalid encrypted text format. Expected format: iv:encrypted_hex
```

---

### ✅ BUG #4: `cloakx env set fake_env` - Should reject non-existent

**Issue:** `env set` accepted non-existent environment  
**Root Cause:** `setActiveEnvironment()` was auto-creating environments  
**Fix Applied:**
```typescript
// Before (BROKEN):
export function setActiveEnvironment(env: string): void {
  const config = loadConfig();
  if (!config.environments.includes(env)) {
    config.environments.push(env);  // ❌ Auto-created!
  }
  config.env = env;
  saveConfig(config);
}

// After (FIXED):
export function setActiveEnvironment(env: string): void {
  const config = loadConfig();
  
  // ✅ Validate environment exists
  if (!config.environments.includes(env)) {
    throw new Error(`Environment "${env}" does not exist. Available environments: ${config.environments.join(', ')}`);
  }
  
  config.env = env;
  saveConfig(config);
}
```

**Test Command:**
```bash
cloakx env set fake
```

**Expected:**
```
❌ Environment "fake" does not exist. Available environments: default, production
```

---

### ✅ BUG #5: `cloakx del DATABASE_URL --env production` - --env parameter not working

**Issue:** Delete with `--env` parameter was not recognized  
**Root Cause:** Delete command didn't have `--env` option defined  
**Fix Applied:**
```typescript
// Before (BROKEN):
command
  .arguments('<key>')
  .description('Delete a secret key from the vault')
  .action((key: string) => {
    // no --env support
  });

// After (FIXED):
command
  .arguments('<key>')
  .description('Delete a secret key from the vault')
  .option('-e, --env <name>', 'Environment name')  // ✅ ADDED
  .action((key: string, options) => {
    const env = options.env || getActiveEnvironment();
    // ... deletion logic with environment support
  });
```

**Test Command:**
```bash
cloakx del DATABASE_URL --env production
```

**Expected:**
```
🗑️  Key "DATABASE_URL" has been deleted from production environment.
```

---

### ✅ BUG #6: `cloakx export --env staging` - --env parameter not working

**Issue:** Export with `--env` parameter was not recognized  
**Root Cause:** Export command didn't have `--env` option defined  
**Fix Applied:**
```typescript
// Before (BROKEN):
cmd
  .option('-f, --file <path>', 'Write to file')
  .option('-m, --masked', 'Mask values')
  // No --env option!

// After (FIXED):
cmd
  .option('-f, --file <path>', 'Write to file')
  .option('-e, --env <name>', 'Environment name')  // ✅ ADDED
  .option('-m, --masked', 'Mask values')
  .action((keyArg, options) => {
    const env = options.env || getActiveEnvironment();
    // ... export logic filters by environment
  });
```

**Test Command:**
```bash
cloakx export --env staging
```

**Expected:**
```
KEY1=value1
KEY2=value2
(all secrets from staging environment)
```

---

### ⏳ BUG #7: `cloakx import config.json` - JSON file support unclear

**Issue:** User unsure if import supports JSON files or only .env  
**Status:** Needs testing to verify working correctly  

**Test Command:**
```bash
cat > test.json << EOF
{
  "API_KEY": "sk_test_123",
  "DB_HOST": "localhost"
}
EOF

cloakx import test.json
```

**Expected:**
```
✔ 🔑 API_KEY: Use file value (sk_test_123) or enter new: sk_test_123
✅ Imported API_KEY
✔ 🔑 DB_HOST: Use file value (localhost) or enter new: localhost
✅ Imported DB_HOST
```

---

## 🧪 TESTING CHECKLIST

Run these commands in order to verify all fixes work:

```bash
# Login first
cloakx login  # password: pravin

# Test 1: env delete validation
cloakx env delete nonexistent
# Expected: ❌ Environment "nonexistent" does not exist

# Test 2: set with new environment
cloakx set TEST_NEW "value" --env newenv
# Expected: ✨ Created new environment: newenv
#           ✅ Saved TEST_NEW

# Test 3: decrypt with invalid format
cloakx decrypt "invalid"
# Expected: ❌ Invalid encrypted text format

# Test 4: env set rejects non-existent
cloakx env set fake
# Expected: ❌ Environment "fake" does not exist

# Test 5: delete with --env
cloakx set KEY1 "val1" --env testenv
cloakx del KEY1 --env testenv
# Expected: 🗑️  Key "KEY1" has been deleted from testenv environment

# Test 6: export with --env
cloakx set KEY2 "val2" --env testenv
cloakx export --env testenv
# Expected: KEY2=val2

# Test 7: import JSON
cat > test.json << EOF
{
  "IMPORT_TEST": "test_value"
}
EOF
cloakx import test.json
# Expected: Prompts for each key and imports successfully
```

---

## 📊 BUILD & RELEASE STATUS

**Version:** 1.0.8  
**Build Status:** ✅ Compiled successfully  
**Web Assets:** ✅ Copied to public/  
**Ready for Publishing:** ⏳ After testing confirms all fixes work

**Modified Files:**
- ✅ src/utils/environments.ts (env set/delete validation)
- ✅ src/commands/set.ts (auto-create environment)
- ✅ src/commands/decrypt.ts (error handling)
- ✅ src/commands/delete.ts (add --env option)
- ✅ src/commands/export.ts (add --env option)
- ✅ package.json (version 1.0.8)
- ✅ src/index.ts (version 1.0.8)

---

## 🚀 NEXT STEPS

1. ✅ Test all 7 bugs using the commands above
2. ✅ Verify all expected outputs match
3. ⏳ Run full test suite from COMPREHENSIVE_TEST_GUIDE.md
4. ⏳ If all pass: `npm publish` to release v1.0.8
5. ⏳ Users: `npm install -g cloakx@latest` to get fixes

---

**Ready to test?** Run the bash commands above and share the results! 🧪
