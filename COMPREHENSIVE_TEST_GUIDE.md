# 🧪 COMPREHENSIVE CLOAKX CLI TESTING GUIDE

**Date:** April 16, 2026  
**Version:** 1.0.6  
**Status:** Ready for Testing

---

## 📝 Testing Overview

This guide covers all 17 CLI commands with:
- ✅ No parameters
- ✅ Single parameters
- ✅ Multiple parameters
- ✅ Different scenarios
- ✅ Error cases

**Test Password:** `pravin` (use this throughout)

---

## 🔐 PHASE 1: AUTHENTICATION COMMANDS (4 commands)

### 1️⃣ **LOGIN** - Initialize vault
```bash
# ✅ No parameters (interactive)
cloakx login
# Enter password: pravin
# Confirm password: pravin
# Expected: ✅ Vault created, session started

# ✅ Check login status
cloakx status
# Expected: ✅ Logged in as: ..., Token: ..., Expires: ...
```

---

### 2️⃣ **STATUS** - Check authentication
```bash
# ✅ No parameters
cloakx status
# Expected: ✅ Shows login status, token, expiry time
```

---

### 3️⃣ **LOGOUT** - Clear session
```bash
# ✅ No parameters
cloakx logout
# Expected: ✅ Session cleared

# ✅ Verify logout
cloakx status
# Expected: ❌ Not authenticated (expected after logout)
```

---

### 4️⃣ **CHANGE-PASSWORD** - Update vault password
```bash
# First, login again
cloakx login
# Enter password: pravin

# ✅ No parameters (interactive)
cloakx change-password
# Old password: pravin
# New password: newpass123
# Confirm: newpass123
# Expected: ✅ Password updated

# ✅ Verify new password works
cloakx logout
cloakx login
# Enter password: newpass123
# Expected: ✅ Login successful with new password

# ✅ Change back to original password
cloakx change-password
# Old password: newpass123
# New password: pravin
# Confirm: pravin
# Expected: ✅ Password changed back
```

---

## 💾 PHASE 2: SECRET MANAGEMENT (5 commands)

### 5️⃣ **SET** - Store secrets
```bash
# ✅ Single parameter (key + value)
cloakx set API_KEY "sk_live_123abc"
# Expected: ✅ Saved API_KEY

# ✅ Multiple parameters - with environment
cloakx set DATABASE_URL "postgres://localhost" --env production
# Expected: ✅ Saved to production environment

# ✅ Multiple parameters - with expiration (days)
cloakx set TEMP_TOKEN "token_xyz" --expires 7d
# Expected: ✅ Saved with 7-day expiration

# ✅ Multiple parameters - with tags
cloakx set STRIPE_KEY "rk_test_456" --tags "payment,stripe"
# Expected: ✅ Saved with tags

# ✅ Multiple parameters - all combined
cloakx set SECRET "value123" --env production --expires 30d --tags "critical,security"
# Expected: ✅ Saved with all metadata

# ✅ Different expiration formats
cloakx set EXP_TEST1 "val1" --expires 24h
# Expected: ✅ Expires in 24 hours

cloakx set EXP_TEST2 "val2" --expires 2026-12-31
# Expected: ✅ Expires on 2026-12-31

# ✅ Multiple tags
cloakx set MULTI_TAG "val" --tags "tag1,tag2,tag3,tag4"
# Expected: ✅ All tags saved
```

---

### 6️⃣ **GET** - Retrieve secrets
```bash
# ✅ Single parameter (key only)
cloakx get API_KEY
# Expected: ✅ sk_live_123abc

# ✅ Multiple parameters - from specific environment
cloakx get DATABASE_URL --env production
# Expected: ✅ postgres://localhost

# ✅ Get secret that doesn't exist
cloakx get NONEXISTENT
# Expected: ❌ No such key (expected error)

# ✅ Get from wrong environment
cloakx get API_KEY --env staging
# Expected: ❌ No such key (not in staging)

# ✅ Get expired secret
cloakx set EXPIRED_SECRET "will_expire" --expires 1s
# Wait 2 seconds
cloakx get EXPIRED_SECRET
# Expected: ❌ Secret has EXPIRED
```

---

### 7️⃣ **LIST** - Show all secrets
```bash
# ✅ No parameters (current environment)
cloakx list
# Expected: ✅ Lists: API_KEY, DATABASE_URL, STRIPE_KEY, TEMP_TOKEN, SECRET, EXP_TEST1, EXP_TEST2, MULTI_TAG

# ✅ Single parameter - specific environment
cloakx list --env production
# Expected: ✅ Lists secrets in production env

# ✅ Filter by tag
cloakx list --tag payment
# Expected: ✅ STRIPE_KEY

cloakx list --tag critical
# Expected: ✅ SECRET

# ✅ Show expired secrets
cloakx list --expired
# Expected: ✅ Shows EXPIRED_SECRET (if still in vault)

# ✅ Multiple parameters
cloakx list --env production --tag critical
# Expected: ✅ SECRET (from production, tagged critical)

# ✅ All environments
cloakx list --all
# Expected: ✅ Lists secrets from all environments
```

---

### 8️⃣ **UPDATE** - Modify secrets
```bash
# ✅ Single parameter change (key + new value)
cloakx update API_KEY "sk_live_new_key"
# Expected: ✅ Updated API_KEY

# ✅ Verify update
cloakx get API_KEY
# Expected: ✅ sk_live_new_key

# ✅ Update with new expiration
cloakx update TEMP_TOKEN "new_token" --expires 14d
# Expected: ✅ Updated with new expiration

# ✅ Update with environment
cloakx update DATABASE_URL "postgres://newhost" --env production
# Expected: ✅ Updated in production

# ✅ Update multiple properties
cloakx update SECRET "newsecret" --env production --expires 60d --tags "critical,updated"
# Expected: ✅ Updated with all properties

# ✅ Update non-existent secret
cloakx update FAKE_KEY "value"
# Expected: ❌ Key does not exist
```

---

### 9️⃣ **DELETE** - Remove secrets
```bash
# ✅ Single parameter (key only)
cloakx del EXP_TEST1
# Expected: ✅ Deleted EXP_TEST1

# ✅ Verify deletion
cloakx get EXP_TEST1
# Expected: ❌ No such key

# ✅ Delete from specific environment
cloakx del DATABASE_URL --env production
# Expected: ✅ Deleted from production

# ✅ Delete from default still works
cloakx list
# Expected: ✅ DATABASE_URL still there (in default env)

# ✅ Delete non-existent secret
cloakx del NONEXISTENT
# Expected: ❌ Key not found

# ✅ Delete all test secrets one by one
cloakx del API_KEY
cloakx del TEMP_TOKEN
cloakx del STRIPE_KEY
cloakx del SECRET
cloakx del EXP_TEST2
cloakx del MULTI_TAG
```

---

## 🔒 PHASE 3: ENCRYPTION UTILITIES (2 commands)

### 🔟 **ENCRYPT** - One-time encryption
```bash
# ✅ Single parameter
cloakx encrypt "sensitive data"
# Expected: ✅ Outputs encrypted string like: "iv:encrypted_hex"

# ✅ Multiple lines
cloakx encrypt "line1\nline2\nline3"
# Expected: ✅ Encrypted multiline text

# ✅ Special characters
cloakx encrypt "!@#$%^&*()_+-=[]{}|;:',.<>?/~`"
# Expected: ✅ Encrypted special chars

# ✅ Empty string
cloakx encrypt ""
# Expected: ✅ Encrypts empty string
```

---

### 1️⃣1️⃣ **DECRYPT** - One-time decryption
```bash
# ✅ Decrypt from encrypt above
ENCRYPTED=$(cloakx encrypt "test data")
cloakx decrypt "$ENCRYPTED"
# Expected: ✅ test data

# ✅ Wrong encrypted text
cloakx decrypt "invalid_encrypted_text"
# Expected: ❌ Error (invalid format)

# ✅ Tampered encrypted text
cloakx decrypt "12345:abcdef"
# Expected: ❌ Decryption failed (tampered)
```

---

## 🌍 PHASE 4: ENVIRONMENT MANAGEMENT (1 command with 5 subcommands)

### 1️⃣2️⃣ **ENV** - Manage environments

#### ENV LIST - Show all environments
```bash
# ✅ No parameters
cloakx env list
# Expected: ✅ Lists: default, production
```

#### ENV CURRENT - Show active environment
```bash
# ✅ No parameters
cloakx env current
# Expected: ✅ default (or whatever is active)
```

#### ENV SET - Switch environment
```bash
# ✅ Single parameter
cloakx env set production
# Expected: ✅ Switched to production

# ✅ Verify it switched
cloakx env current
# Expected: ✅ production

# ✅ Switch back
cloakx env set default
# Expected: ✅ Switched to default

# ✅ Switch to non-existent env
cloakx env set fake_env
# Expected: ❌ Environment not found
```

#### ENV CREATE - Create new environment
```bash
# ✅ Single parameter
cloakx env create staging
# Expected: ✅ Created staging environment

# ✅ Verify creation
cloakx env list
# Expected: ✅ default, production, staging

# ✅ Create duplicate
cloakx env create staging
# Expected: ❌ Environment already exists

# ✅ Create another
cloakx env create development
# Expected: ✅ Created development environment
```

#### ENV DELETE - Remove environment
```bash
# ✅ Single parameter
cloakx env delete development
# Expected: ✅ Deleted development

# ✅ Verify deletion
cloakx env list
# Expected: ✅ default, production, staging

# ✅ Delete non-existent
cloakx env delete fake
# Expected: ❌ Environment not found

# ✅ Delete default (should fail)
cloakx env delete default
# Expected: ❌ Cannot delete default environment
```

---

## 📤 PHASE 5: IMPORT/EXPORT (2 commands)

### 1️⃣3️⃣ **EXPORT** - Export secrets

First, add some test data:
```bash
cloakx set KEY1 "value1"
cloakx set KEY2 "value2"
cloakx set KEY3 "value3"
```

Then test export:
```bash
# ✅ No parameters (stdout)
cloakx export
# Expected: ✅ Shows all secrets in .env format
# Output should look like:
# KEY1=value1
# KEY2=value2
# KEY3=value3

# ✅ Export to file
cloakx export --file backup.env
# Expected: ✅ backup.env created with all secrets

# ✅ Verify file created
cat backup.env
# Expected: ✅ Shows content

# ✅ Export specific secret
cloakx export KEY1
# Expected: ✅ KEY1=value1

# ✅ Export from specific environment
cloakx set ENV_KEY "env_value" --env staging
cloakx export --env staging
# Expected: ✅ ENV_KEY=env_value

# ✅ Export to file with environment
cloakx export --file staging.env --env staging
# Expected: ✅ staging.env contains staging secrets

# ✅ Export with masked values
cloakx export --masked
# Expected: ✅ Shows KEY1=***, KEY2=***, etc
```

---

### 1️⃣4️⃣ **IMPORT** - Import secrets

```bash
# Create a test file first
cat > test-import.env << EOF
IMPORT_KEY1=import_value1
IMPORT_KEY2=import_value2
IMPORT_KEY3=import_value3
EOF

# ✅ Basic import
cloakx import test-import.env
# Expected: ✅ All keys imported

# ✅ Verify import
cloakx list
# Expected: ✅ IMPORT_KEY1, IMPORT_KEY2, IMPORT_KEY3

# ✅ Import to specific environment
cat > staging-import.env << EOF
STAGING_KEY1=stage_value1
STAGING_KEY2=stage_value2
EOF

cloakx import staging-import.env --env staging
# Expected: ✅ Imported to staging

# ✅ Verify in staging
cloakx env set staging
cloakx list
# Expected: ✅ Contains STAGING_KEY1, STAGING_KEY2, ENV_KEY

# ✅ Import with duplicate (should ask)
cloakx env set default
cloakx import test-import.env
# Expected: Keys already exist, handling behavior

# ✅ Import without prompting
cloakx import test-import.env --use-existing
# Expected: ✅ Uses existing values, no prompt

# ✅ Import JSON format
cat > config.json << EOF
{
  "JSON_KEY1": "json_value1",
  "JSON_KEY2": "json_value2"
}
EOF

cloakx import config.json
# Expected: ✅ Imports from JSON
```

---

## 🌐 PHASE 6: WEB UI & RUN (2 commands)

### 1️⃣5️⃣ **WEB** - Launch Web UI

```bash
# ✅ No parameters
cloakx web
# Expected: ✅ 
# 🌐 Cloakx Web UI is running!
#   📱 Frontend URL: http://127.0.0.1:1201
#   🔗 Backend API: http://127.0.0.1:2000
# 
# Opens browser automatically to http://127.0.0.1:1201

# ✅ Test in browser
# - Login with password: pravin
# - View secrets dashboard
# - Add new secret
# - Edit existing secret
# - Delete secret
# - Switch environments
# - Change password

# ✅ Stop web server
# Press Ctrl+C in terminal
# Expected: ✅ Server stopped gracefully
```

---

### 1️⃣6️⃣ **RUN** - Execute with injected secrets

```bash
# Create a test script
cat > test-run.js << EOF
console.log('API_KEY:', process.env.API_KEY);
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('KEY1:', process.env.KEY1);
EOF

# First add secrets
cloakx set API_KEY "secret_api_key"
cloakx set DATABASE_URL "postgres://localhost"
cloakx set KEY1 "value1"

# ✅ Run with secrets injected
cloakx run node test-run.js
# Expected: ✅ Shows all injected values:
# API_KEY: secret_api_key
# DATABASE_URL: postgres://localhost
# KEY1: value1

# ✅ Run from specific environment
cloakx env set staging
cloakx set API_KEY "staging_api_key" --env staging
cloakx run --env staging node test-run.js
# Expected: ✅ API_KEY: staging_api_key

# ✅ Run different commands
cloakx run echo "Test with secrets"
# Expected: ✅ Test with secrets

cloakx run npm --version
# Expected: ✅ npm version number

# ✅ Run bash script
cat > script.sh << EOF
#!/bin/bash
echo "API Key: $API_KEY"
echo "DB URL: $DATABASE_URL"
EOF

cloakx run bash script.sh
# Expected: ✅ Shows both environment variables
```

---

## 🔄 PHASE 7: SYNC & UTILITY (2 commands)

### 1️⃣7️⃣ **SYNC** - Synchronize vault
```bash
# ✅ No parameters
cloakx sync
# Expected: ✅ Vault synced (or message about sync status)
```

---

### HELP & VERSION - Built-in commands

```bash
# ✅ Show version
cloakx --version
# Expected: ✅ 1.0.6

# ✅ Show help
cloakx --help
# Expected: ✅ Lists all commands

# ✅ Get help for specific command
cloakx help set
# Expected: ✅ Shows set command help

cloakx help list
# Expected: ✅ Shows list command help

cloakx help
# Expected: ✅ Shows all commands
```

---

## ✅ PHASE 8: ERROR HANDLING & EDGE CASES

### Not Authenticated
```bash
# ✅ Logout first
cloakx logout

# ✅ Try to use commands without login
cloakx list
# Expected: ❌ Not authenticated error

cloakx set KEY "value"
# Expected: ❌ Please login first

cloakx get KEY
# Expected: ❌ Not authenticated

# ✅ Login again to continue
cloakx login
# Enter: pravin
```

---

### Invalid Parameters
```bash
# ✅ Command with wrong number of parameters
cloakx set KEY
# Expected: ❌ Missing required arguments

cloakx set
# Expected: ❌ Missing required arguments

cloakx get
# Expected: ❌ Missing required argument

cloakx get KEY1 KEY2
# Expected: ❌ Too many arguments (or ignores extra)
```

---

### Invalid Option Values
```bash
# ✅ Invalid environment name (should still work or fail gracefully)
cloakx set TEST "val" --env "invalid/env"
# Expected: Either creates or appropriate error

# ✅ Invalid expiration format
cloakx set TEST "val" --expires "invalid"
# Expected: ❌ Invalid expiration format

# ✅ Invalid date format
cloakx set TEST "val" --expires "2025-13-45"
# Expected: ❌ Invalid date
```

---

## 📊 SUMMARY TEST CHECKLIST

```
Phase 1: Authentication (4 commands)
✅ login ✅ status ✅ logout ✅ change-password

Phase 2: Secrets (5 commands)
✅ set ✅ get ✅ list ✅ update ✅ delete

Phase 3: Encryption (2 commands)
✅ encrypt ✅ decrypt

Phase 4: Environments (1 command, 5 subcommands)
✅ env list ✅ env current ✅ env set ✅ env create ✅ env delete

Phase 5: Import/Export (2 commands)
✅ export ✅ import

Phase 6: Web & Run (2 commands)
✅ web ✅ run

Phase 7: Sync (1 command)
✅ sync

Built-in (3 commands)
✅ --version ✅ --help ✅ help

Total: 17 main commands + utilities = ALL TESTED ✅
```

---

## 🎯 KEY TESTING SCENARIOS

| Scenario | Commands to Test |
|----------|------------------|
| **No Parameters** | login, logout, status, list, list, env list, export, sync, --version, help |
| **Single Parameter** | get, delete, encrypt, decrypt, env current, env set, env create, env delete |
| **Two Parameters** | set, update, run |
| **Multiple Parameters** | set (--env, --expires, --tags), update (same), list (--env, --tag), export (--env, --file) |
| **Combinations** | set + all 3 options, list + 2 filters, export + 2 options |
| **Error Cases** | wrong env, expired secret, non-existent key, invalid format |
| **Different Formats** | expiration (7d, 24h, date), tags (single, multiple), files (.env, .json) |

---

## 🚀 QUICK TEST SEQUENCE

If you want a faster test run, use this sequence:

```bash
# Setup
cloakx login  # password: pravin
cloakx set TEST_KEY "test_value"
cloakx set API_KEY "sk_123" --env production --expires 7d --tags "payment"

# Quick tests
cloakx get TEST_KEY
cloakx list
cloakx list --tag payment
cloakx update TEST_KEY "new_value"
cloakx encrypt "secret"
cloakx export --file backup.env
cloakx env create staging
cloakx env list
cloakx web  # (Ctrl+C after checking UI)
cloakx help
cloakx --version

# Cleanup
cloakx delete TEST_KEY
cloakx delete API_KEY --env production
```

---

**Good luck with testing! Report any issues found.** 🎉
