# 🔐 CLOAKX - SECURITY AUDIT & BUG REPORT

**Date:** April 14, 2026  
**Severity Breakdown:** 🔴 Critical (1) | 🟠 High (4) | 🟡 Medium (6) | 🔵 Low (3)

---

## 🔴 CRITICAL ISSUES

### 1. **CORS Configuration Mismatch**
**File:** `server/index.ts:9`  
**Severity:** 🔴 CRITICAL  
**Issue:** CORS is hardcoded to `http://localhost:3001` but web UI runs on `http://localhost:3000`

**Current Code:**
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true,
}));
```

**Fix:**
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
```

**Impact:** API calls fail, extension won't work properly
**Required for:** ✅ Immediate (blocks functionality)

---

## 🟠 HIGH SEVERITY ISSUES

### 2. **Session File Permissions Not Restricted**
**File:** `src/utils/session.ts`  
**Severity:** 🟠 HIGH  
**Issue:** Session file containing encryption keys is created without restricted permissions, readable by other processes

**Current Code:**
```typescript
fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2));
```

**Fix:**
```typescript
fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2), { mode: 0o600 });
```

**Impact:** Other processes on the same system could read session keys
**Required for:** ✅ Production

---

### 3. **Rate Limiting Too Lenient for Login**
**File:** `server/routes/auth.ts:24-28`  
**Severity:** 🟠 HIGH  
**Issue:** 50 login attempts per 15 minutes is too high - allows brute force attacks

**Current Code:**
```typescript
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,  // TOO HIGH!
  ...
});
```

**Recommended Fix:**
```typescript
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,   // Reduce to 5 attempts
  ...
});
```

**Impact:** Easier to brute force master password
**Required for:** ✅ Production

---

### 4. **Secrets Decrypted Server-Side (Privacy Issue)**
**File:** `server/routes/secrets.ts:37-48`  
**Severity:** 🟠 HIGH  
**Issue:** All secrets are decrypted on the server and sent to client in plaintext over the network, even if HTTPS is used

**Current Code:**
```typescript
const data = Object.keys(vault).map((k) => {
  const encrypted = getSecretValue(vault, k);
  const value = encrypted ? decrypt(encrypted, key) : '';  // ❌ Decrypted here!
  return { key: k, value, ...metadata };
});
res.json(data);
```

**Recommended Fix:**
```typescript
// Send only encrypted values and session key
const data = Object.keys(vault).map((k) => {
  const encrypted = getSecretValue(vault, k);
  return { key: k, value: encrypted, ...metadata };  // ✅ Keep encrypted
});
res.json(data);
```

**Impact:** Reduces end-to-end encryption benefits; secrets visible in network logs
**Required for:** ✅ Production (if you want true E2E)

---

### 5. **No HTTPS Enforcement in Production**
**File:** `server/index.ts`  
**Severity:** 🟠 HIGH  
**Issue:** Server runs on HTTP. Passwords and session keys transmitted in plaintext

**Current Code:**
```typescript
app.listen(8080, () => {
  console.log('🚀 API running on http://localhost:8080');
});
```

**Fix:** For extensions it's localhost only, so acceptable. But add warning:

```typescript
if (process.env.NODE_ENV !== 'development') {
  console.warn('⚠️ WARNING: Running on HTTP without SSL. Use HTTPS in production!');
}
```

**Impact:** Man-in-the-middle attacks possible
**Required for:** ✅ If exposed to network

---

## 🟡 MEDIUM SEVERITY ISSUES

### 6. **No Request Body Size Limit**
**File:** `server/index.ts:12`  
**Severity:** 🟡 MEDIUM  
**Issue:** No size limit on JSON parsing - could lead to DoS attacks

**Current Code:**
```typescript
app.use(express.json());
```

**Fix:**
```typescript
app.use(express.json({ limit: '1mb' }));  // Add limit
app.use(express.urlencoded({ limit: '1mb' }));
```

**Impact:** Server could be crashed with large payloads
**Required for:** ✅ Production

---

### 7. **Missing Content-Type Validation**
**File:** `server/routes/secrets.ts`  
**Severity:** 🟡 MEDIUM  
**Issue:** API accepts any content-type, no validation

**Fix:**
```typescript
router.post('/', (req, res) => {
  if (req.headers['content-type'] !== 'application/json') {
    return res.status(415).json({ error: 'Content-Type must be application/json' });
  }
  // ... rest of code
});
```

**Impact:** Potential for injection attacks
**Required for:** ✅ Production

---

### 8. **API Version Missing**
**File:** `server/index.ts`  
**Severity:** 🟡 MEDIUM  
**Issue:** No API versioning for future compatibility

**Fix:**
```typescript
// Add API version to all routes
app.use('/api/v1', authRouter);
app.use('/api/v1/secrets', requireAuth, secretsRouter);
```

**Impact:** Breaking changes will affect all clients
**Required for:** ⭐ Recommended

---

### 9. **Weak Clipboard Timeout in Extension**
**File:** `vscode-extension/src/secretPanel.ts:50-53`  
**Severity:** 🟡 MEDIUM  
**Issue:** Only 10 seconds before clipboard clears - too short for some users

**Current Code:**
```typescript
setTimeout(() => {
  vscode.env.clipboard.writeText('');
}, 10000);
```

**Recommended Fix:**
```typescript
// Make configurable, but at least 30 seconds
const CLIPBOARD_TIMEOUT = parseInt(process.env.CLIPBOARD_TIMEOUT || '30000');
setTimeout(() => {
  vscode.env.clipboard.writeText('');
}, CLIPBOARD_TIMEOUT);
```

**Impact:** Usability issue, may not be enough time
**Required for:** ⭐ Recommended

---

### 10. **Process Cleanup May Be Incomplete**
**File:** `vscode-extension/src/webServerManager.ts:120-127`  
**Severity:** 🟡 MEDIUM  
**Issue:** If processes spawn child processes, they won't be killed on SIGTERM

**Current Code:**
```typescript
dispose(): void {
  if (this.webProcess) {
    this.outputChannel.appendLine('🛑 Stopping web server...');
    this.webProcess.kill('SIGTERM');  // May not kill descendants
  }
  if (this.backendProcess) {
    this.outputChannel.appendLine('🛑 Stopping backend server...');
    this.backendProcess.kill('SIGTERM');
  }
}
```

**Fix:**
```typescript
dispose(): void {
  if (this.webProcess) {
    this.outputChannel.appendLine('🛑 Stopping web server...');
    process.kill(-this.webProcess.pid!);  // Kill entire process group
  }
  if (this.backendProcess) {
    this.outputChannel.appendLine('🛑 Stopping backend server...');
    process.kill(-this.backendProcess.pid!);
  }
}
```

**Impact:** Orphan processes may consume resources
**Required for:** ✅ Production

---

### 11. **No Audit Logging**
**File:** `server/routes/auth.ts`, `server/routes/secrets.ts`  
**Severity:** 🟡 MEDIUM  
**Issue:** No logging of who accessed what secrets, when

**Impact:** No security incident trail, no compliance records
**Required for:** ✅ Production (especially if handling sensitive data)

---

## 🔵 LOW SEVERITY ISSUES

### 12. **Hardcoded Salt in Production**
**File:** `src/utils/crypto.ts:7`  
**Severity:** 🔵 LOW  
**Issue:** While acceptable for this use case, hardcoded salt is not ideal

**Note:** This is acceptable for a desktop app where the salt isn't meant to be secret. The password IS the secret.

**Current Code:**
```typescript
const HARDCODED_SALT = 'cloakx_vault_0x2024_v1';
```

**This is OK because:** Password = secret, salt doesn't need to be secret
**This is NOT OK for:** Web apps where you store passwords for users

---

### 13. **Error Messages May Leak Information**
**File:** `server/routes/auth.ts:36-42`  
**Severity:** 🔵 LOW  

**Current Code:**
```typescript
res.status(401).json({ error: 'Invalid password' });
```

**This is actually good** - doesn't leak if password vs vault exists. ✅

---

### 14. **Session Not Persisted for Multi-Instance**
**File:** `src/utils/session.ts`  
**Severity:** 🔵 LOW  
**Issue:** File-based sessions won't work if you scale to multiple server instances

**Not relevant for:** VS Code extension (single instance)
**Relevant for:** If deployed as standalone service

---

---

## 🐛 BUGS FOUND

### Bug #1: Typo in Server Routes
**File:** `server/routes/valut.ts` (supposed to be `vault.ts`)  
**Severity:** 🟡 MEDIUM  
**Issue:** Route file named `valut.ts` instead of `vault.ts`

**Impact:** Confusing for maintainers
**Fix:** Rename file to `vault.ts`

---

### Bug #2: Unused/Dead Code
**File:** `vscode-extension/src/secretPanel.ts`, `completeDashboard.ts`, `cloakxDashboard.ts`  
**Severity:** 🔵 LOW  
**Issue:** Multiple unused webview files still present

**Impact:** Bloats bundle, confuses developers
**Fix:** Delete these files as they're replaced by web UI

---

---

## ✅ FIXES SUMMARY TABLE

| Issue | Severity | Type | Effort | Impact |
|-------|----------|------|--------|--------|
| CORS Port Mismatch | 🔴 Critical | Bug | 5 min | Blocks functionality |
| Session Permissions | 🟠 High | Security | 10 min | Key exposure |
| Login Rate Limit | 🟠 High | Security | 5 min | Brute force |
| Server-Side Decryption | 🟠 High | Design | 1 hour | Privacy |
| No HTTPS Enforcement | 🟠 High | Config | 20 min | Network security |
| No Body Size Limit | 🟡 Medium | Security | 5 min | DoS |
| No Content-Type Check | 🟡 Medium | Security | 10 min | Injection |
| No API Versioning | 🟡 Medium | Design | 30 min | Maintenance |
| Clipboard Timeout | 🟡 Medium | UX | 10 min | Usability |
| Process Cleanup | 🟡 Medium | Bug | 15 min | Resource leak |
| No Audit Logging | 🟡 Medium | Feature | 2 hours | Compliance |
| File Typo | 🟡 Medium | Bug | 5 min | Maintainability |
| Dead Code Files | 🔵 Low | Cleanup | 2 min | Code quality |

---

## 🚀 PRODUCTION CHECKLIST

### Before Pushing to Production:
- [ ] Fix CORS port to 3000
- [ ] Add session file permissions (0o600)
- [ ] Reduce login rate limit to 5/15min
- [ ] Consider server-side vs client-side decryption architecture
- [ ] Add body size limits
- [ ] Add content-type validation
- [ ] Add request timeout limits
- [ ] Implement audit logging
- [ ] Fix `valut.ts` → `vault.ts`
- [ ] Delete unused webview files
- [ ] Add HTTPS warning for non-dev environments
- [ ] Test process cleanup on extension unload
- [ ] Set up error monitoring (Sentry/etc)
- [ ] Document security practices

### Recommended for Later:
- [ ] Implement persistent session store
- [ ] Add API versioning (/api/v1)
- [ ] Set up audit logging pipeline
- [ ] Add rate limiting to other endpoints
- [ ] Implement refresh tokens
- [ ] Add secrets rotation capability
- [ ] Set up backup/restore testing

---

## 🎯 CRITICAL PATH (Must Do Before Prod)

1. **Fix CORS** (5 min) - Extension won't work otherwise
2. **Session Permissions** (10 min) - Key security issue
3. **Rate Limiting** (5 min) - Brute force protection
4. **Body Size Limit** (5 min) - DoS protection
5. **Fix Typo** (5 min) - Code quality
6. **Delete Dead Code** (2 min) - Clean bundle

**Total Time: ~35 minutes**

---

## QUESTIONS TO CONSIDER

1. Do you want true end-to-end encryption (send encrypted values to client)?
2. Should secrets be shared across multiple devices?
3. Need audit logging for compliance?
4. Planning to deploy beyond VS Code extension?
5. What's the password policy (min length, complexity)?

---

**Generated:** April 14, 2026  
**Status:** ⚠️ Fix critical issues before production
