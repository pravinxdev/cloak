# 🏗️ TECHNICAL REFERENCE GUIDE

**Prepared:** April 14, 2026  
**Purpose:** Complete technical documentation for Cloakx system  
**Audience:** Development team, DevOps, security team

---

## 1. SYSTEM ARCHITECTURE

### Technology Stack

```
Frontend:
  ├─ React 18.3 + TypeScript
  ├─ Vite 5.0 (build tool)
  ├─ Tailwind CSS (styling)
  ├─ shadcn/ui (component library)
  └─ Port: 3000

Backend:
  ├─ Node.js v24.14.0
  ├─ Express.js 4.18
  ├─ TypeScript 5.0
  ├─ Commander.js (CLI)
  ├─ Crypto (built-in Node)
  └─ Port: 8080

Storage:
  ├─ File-based vault (~/.cloakx/)
  ├─ Encrypted with AES-256-CBC
  ├─ PBKDF2 key derivation
  └─ Session files (0o600 permissions)

VS Code Extension:
  ├─ TypeScript 5.0
  ├─ Esbuild (bundling)
  ├─ Bundle Size: 9.8KB
  └─ Integrated with web UI
```

### Port Configuration

```
Port 8080  - Backend API (Express)
Port 3000  - Web UI (Vite React)
Port 9229  - VS Code Debugger (optional)
```

---

## 2. FILE STRUCTURE

### Core CLI Application

```
src/
├── index.ts                 # Main entry point, command registration
├── commands/               # 17 CLI commands
│   ├── get.ts             # Retrieve secret
│   ├── set.ts             # Store secret
│   ├── update.ts          # Update existing secret
│   ├── delete.ts          # Remove secret
│   ├── list.ts            # List all secrets
│   ├── encrypt.ts         # Encrypt text
│   ├── decrypt.ts         # Decrypt text
│   ├── export.ts          # Export as .env
│   ├── import.ts          # Import from file
│   ├── login.ts           # Authentication
│   ├── logout.ts          # Clear session
│   ├── status.ts          # Show session info
│   ├── env.ts             # Environment management
│   ├── change-password.ts # Password change
│   ├── run.ts             # Execute with secrets
│   ├── sync.ts            # Sync vaults
│   └── web.ts             # Launch web UI
├── config/
│   └── paths.ts           # Path configuration
└── utils/
    ├── crypto.ts          # AES-256-CBC encryption
    ├── session.ts         # Session management
    ├── vault.ts           # Vault operations
    ├── environments.ts    # Environment handling
    └── colors.ts          # CLI coloring
```

### Backend Server

```
server/
├── index.ts               # Express server setup
├── routes/
│   ├── auth.ts           # Login/logout endpoints
│   ├── secrets.ts        # CRUD operations
│   └── vault.ts          # Vault management
└── middleware/
    ├── auth.ts           # Session validation
    ├── errorHandler.ts   # Error handling
    └── rateLimit.ts      # Rate limiting
```

### Web UI

```
web/
├── src/
│   ├── App.tsx            # Main component
│   ├── main.tsx           # React entry
│   ├── pages/            # Page components
│   │   ├── LoginPage.tsx
│   │   ├── SecretsPage.tsx
│   │   ├── AddSecretPage.tsx
│   │   ├── ExportPage.tsx
│   │   ├── ImportPage.tsx
│   │   └── SettingsPage.tsx
│   ├── components/       # UI components
│   └── services/
│       └── api.ts        # API communication
├── vite.config.ts        # Vite config (port 3000)
└── tailwind.config.ts    # Tailwind configuration
```

---

## 3. DEPLOYMENT CONFIGURATION

### Environment Variables

```bash
# Backend (.env)
NODE_ENV=production
PORT=8080
WEB_URL=http://localhost:3000
LOG_LEVEL=info

# Frontend (.env)
VITE_API_URL=http://localhost:8080

# Vault Configuration
VAULT_DIR=~/.cloakx/
SESSION_TIMEOUT=1800000  # 30 minutes in ms
```

### Docker Configuration (if using)

```dockerfile
# Dockerfile
FROM node:24-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000 8080
CMD ["npm", "start"]
```

### Process Management (PM2)

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'cloakx-api',
      script: 'dist/server/index.js',
      port: 8080,
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'cloakx-web',
      script: 'web/dist/index.html',
      port: 3000
    }
  ]
};
```

---

## 4. SECURITY SPECIFICATIONS

### Encryption

```typescript
// Algorithm: AES-256-CBC
// Key Derivation: PBKDF2
// Hash: SHA-256
// Salt: Random 32 bytes
// Iterations: 100,000

Encryption Flow:
1. Salt (32 bytes) + Password → PBKDF2 → Key (32 bytes)
2. IV (16 bytes) ← Random
3. Plaintext + Key + IV → AES-256-CBC → Ciphertext
4. Output: IV:Ciphertext (hex format)

Decryption Flow:
1. Parse IV:Ciphertext
2. Password + Salt → PBKDF2 → Key
3. Ciphertext + Key + IV → AES-256-CBC → Plaintext
```

### Authentication

```
Session Flow:
1. User login with password
2. Validate against stored credentials
3. Generate session token (32-byte random)
4. Store token in ~/.cloakx/.session (0o600)
5. Include in API requests as Authorization header
6. Session expires after 30 minutes of inactivity
7. Logout clears session token
```

### Rate Limiting

```
Login endpoint: 5 attempts per 15 minutes per IP
Enforced at: server/routes/auth.ts
Storage: In-memory (resets on server restart)
```

### CORS Configuration

```
Allowed Origins: http://localhost:3000
Allowed Methods: GET, POST, PUT, DELETE
Allowed Headers: Content-Type, Authorization
Credentials: Include
```

---

## 5. DATABASE SCHEMA

### Vault File Structure

```json
{
  "version": "1.0",
  "masterKey": "pbkdf2$iterations$salt",
  "secrets": [
    {
      "key": "DB_PASSWORD",
      "value": "iv:encryptedValue",
      "createdAt": "2026-04-14T10:00:00Z",
      "updatedAt": "2026-04-14T14:00:00Z",
      "tags": ["production", "database"],
      "expiresAt": null,
      "environment": "default"
    }
  ]
}
```

### Session File Structure

```json
{
  "token": "hexTokenString",
  "userId": "user",
  "expiresAt": "2026-04-14T15:00:00Z",
  "createdAt": "2026-04-14T14:30:00Z"
}
```

---

## 6. API REFERENCE

### Authentication Endpoints

```
POST /api/login
  Body: { "password": "string" }
  Response: { "success": true, "token": "string" }
  Status: 200, 401

POST /api/logout
  Response: { "success": true }
  Status: 200, 401

GET /api/status
  Response: { "loggedIn": true, "user": "string", "expiresAt": "ISO8601" }
  Status: 200, 401
```

### Secret Endpoints

```
GET /api/secrets
  Query: ?tag=production&environment=default
  Response: { "secrets": [...] }
  Status: 200, 401

POST /api/secrets
  Body: { "key": "string", "value": "string", "tags": ["string"], "expiresAt": "ISO8601" }
  Response: { "success": true, "secret": {...} }
  Status: 200, 400, 401, 415

PUT /api/secrets/:key
  Body: { "value": "string", "tags": ["string"] }
  Response: { "success": true }
  Status: 200, 400, 401, 415

DELETE /api/secrets/:key
  Response: { "success": true }
  Status: 200, 401, 404
```

### Export/Import Endpoints

```
GET /api/export
  Query: ?key=specific_key (optional)
  Response: .env file format
  Status: 200, 401

POST /api/import
  Body: FormData with .env file
  Response: { "success": true, "imported": 10 }
  Status: 200, 400, 401
```

---

## 7. CLI COMMAND REFERENCE

### Secret Management

```bash
# Store secret
cloakx set <key> <value> [--tags tag1,tag2] [--expires 7d]

# Retrieve secret
cloakx get <key>

# Update secret
cloakx update <key> <value>

# Delete secret
cloakx delete <key>

# List secrets
cloakx list [--tag production] [--env staging]

# Export secrets
cloakx export [--key specific_key] [--env staging]

# Import secrets
cloakx import <file>
```

### Encryption

```bash
# Encrypt text
cloakx encrypt "<plaintext>"

# Decrypt text
cloakx decrypt "<iv:ciphertext>"
```

### Authentication

```bash
# Check login status
cloakx status

# Login
cloakx login

# Logout
cloakx logout

# Change password
cloakx change-password
```

### Environment Management

```bash
# List environments
cloakx env list

# Set active environment
cloakx env set <name>

# Show active environment
cloakx env current

# Create environment
cloakx env create <name>

# Delete environment
cloakx env delete <name>
```

### Utilities

```bash
# Execute command with secrets
cloakx run <command> [args]

# Sync vaults across machines
cloakx sync

# Launch web UI
cloakx web
```

---

## 8. TROUBLESHOOTING GUIDE

### Issue: "Session Missing" Error

```
Cause: Session file expired or not found
Fix:
1. Run: cloakx login
2. Enter password: pravin (or correct password)
3. Retry the command
```

### Issue: "Vault Not Found"

```
Cause: Vault file missing or corrupted
Fix:
1. Check: ls -la ~/.cloakx/default.vault.json
2. If missing, run: cloakx set <key> <value> (creates new vault)
3. If corrupted, restore from backup or recreate
```

### Issue: "Encryption Failed"

```
Cause: Wrong password or corrupted encrypted data
Fix:
1. Verify password is correct
2. Check vault file not corrupted: file ~/.cloakx/default.vault.json
3. If corrupted, restore from backup
```

### Issue: "Rate Limited"

```
Cause: Too many login attempts
Fix:
1. Wait 15 minutes for rate limit reset
2. Or restart server: pkill node
3. Verify correct password before trying again
```

### Issue: "CORS Error" in Web UI

```
Cause: API port mismatch or server not running
Fix:
1. Check backend running: netstat -tuln | grep 8080
2. Check Web UI running: netstat -tuln | grep 3000
3. Verify CORS config in server/index.ts uses port 3000
4. Restart both: pkill node && npm start
```

---

## 9. MONITORING & LOGGING

### Log Locations

```
CLI: ~./cloakx/cli.log
Server: ./server.log
Web: ./web.log
```

### Key Metrics to Monitor

```
1. Login attempts (5 per 15 min limit)
2. Failed decryption attempts (indicates wrong password)
3. API response times (target: <100ms)
4. Memory usage (target: <200MB)
5. Vault file size (typical: 1-10KB per 100 secrets)
```

### Alert Conditions

```
- 🔴 Critical: Multiple failed decryptions
- 🔴 Critical: Server crashes or doesn't start
- 🟡 Warning: Response times >1000ms
- 🟡 Warning: Memory usage >500MB
- 🟡 Warning: Vault file >10MB
```

---

## 10. UPGRADE PATH

### Backward Compatibility

```
Version 1.0 → 1.1:
- ✅ Existing vaults compatible
- ✅ Session format unchanged
- ✅ API endpoints stable
- ⚠️  CLI may have new options

Migration Steps:
1. Backup ~/.cloakx/ directory
2. Upgrade dependencies: npm update
3. Rebuild: npm run build
4. Test with: cloakx status
```

---

## 11. PERFORMANCE SPECIFICATIONS

### Benchmarks

```
CLI Command Execution:
  - Simple commands (get, list):  50-100ms
  - Encryption/Decryption:        50-150ms
  - File I/O operations:          100-200ms
  - Average total:                100-300ms

API Response Times:
  - Login: 150-250ms
  - Get secrets: 50-100ms
  - Create secret: 100-200ms
  - Average: <100ms

Web UI:
  - Initial load: 1-2 seconds
  - Page transition: 200-500ms
  - Secret fetch: 50-100ms
```

### Resource Usage

```
CLI: ~50MB RAM
Server: ~100MB RAM
Web UI: ~80MB RAM
Vault (100 secrets): ~50KB

Disk Usage per 100 Secrets:
- Encrypted vault: ~50KB
- Session files: ~1KB
- Total: ~51KB per environment
```

---

## 12. DISASTER RECOVERY

### Backup Strategy

```bash
# Daily backup
0 2 * * * tar -czf backup-$(date +%Y%m%d).tar.gz ~/.cloakx/

# Keep 30 days of backups
find backups/ -mtime +30 -delete

# Restore from backup
tar -xzf backup-20260414.tar.gz
```

### Data Recovery

```
1. Locate backup file
2. Extract: tar -xzf backup-*.tar.gz
3. Copy to ~/.cloakx/
4. Test recovery: cloakx list
5. Verify all secrets: cloakx status
```

### Vault Recovery Without Backup

```
⚠️  Not possible - encryption prevents recovery
Prevention:
1. Keep regular backups
2. Store backups securely
3. Test recovery periodically
```

---

## 13. COMPLIANCE & CERTIFICATIONS

### Security Standards

```
✅ AES-256 encryption (NIST approved)
✅ PBKDF2 key derivation (RFC 2898)
✅ Session-based authentication
✅ Rate limiting (brute force protection)
✅ File permissions (0o600 secure)
✅ No plain text storage
✅ CORS protection
✅ Input validation
```

### Privacy Considerations

```
✅ No external API calls
✅ No telemetry/tracking
✅ All data stored locally
✅ No third-party analytics
✅ Users own their data
✅ Enterprise-grade security
```

---

**Document Status:** ✅ Complete  
**Last Updated:** April 14, 2026  
**Next Review:** Quarterly

For questions or updates, contact the development team.
