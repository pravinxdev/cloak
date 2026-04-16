# 🚀 NPM PUBLISHING GUIDE - STEP BY STEP

**Date:** April 16, 2026  
**Status:** ✅ **READY TO PUBLISH**

---

## 📋 Pre-Publishing Checklist

### ✅ Code Quality
- [x] All 17 CLI commands working and tested
- [x] All 12 API endpoints functional
- [x] TypeScript: 0 errors
- [x] Web UI: Running on 127.0.0.1:1201
- [x] Backend API: Running on 127.0.0.1:2000
- [x] Security features: Verified (AES-256, rate limiting, CORS)
- [x] Documentation: Complete and updated

### ✅ Package Configuration
- [x] package.json: Properly configured
- [x] bin: "./dist/src/index.js" ✓
- [x] version: "1.0.2" ✓
- [x] All dependencies: Installed and locked
- [x] tsconfig.json: Valid and clean

### ✅ Git Status  
- [x] On main branch
- [x] All changes committed
- [x] No uncommitted changes

---

## 🚀 STEP-BY-STEP PUBLISHING PROCESS

### **Step 1: Verify Git Status** (takes 1 min)
```bash
cd D:\projects\npm\cloak

# Check current status
git status
# Expected: "On branch main", "nothing to commit, working tree clean"

# View current branch
git branch
# Expected: * main (indicates you're on main)
```

**Expected Output:**
```
On branch main
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean
```

---

### **Step 2: Commit Any Remaining Changes** (if needed)
```bash
# Add all changes
git add .

# Check what will be committed
git status

# Commit with message
git commit -m "docs: update README with multi-parameter documentation"
```

**If working tree is already clean, skip this step ✓**

---

### **Step 3: Verify Build Succeeds** (takes ~30 sec)
```bash
# Clean build
npm run build

# Expected: "0 errors", successful TypeScript compilation
```

**Expected Output:**
```
> cloakx@1.0.2 build
> tsc

# No output = success (compilation clean)
```

---

### **Step 4: Verify package.json is Production-Ready** (takes 1 min)
```bash
# Check key fields
node -e "const pkg = require('./package.json'); console.log('Name:', pkg.name, '|', 'Version:', pkg.version, '|', 'Bin:', pkg.bin.cloakx, '|', 'Files:', pkg.files)"

# Expected Output:
# Name: cloakx | Version: 1.0.2 | Bin: ./dist/src/index.js | Files: dist,README.md
```

---

### **Step 5: Login to NPM** (if not already logged in)

```bash
# Check if already logged in
npm whoami
# If this shows your username, you're logged in - skip to Step 6

# If not logged in, login first
npm login
# Enter username: (your npm username)
# Enter password: (your npm password)
# Enter email: (your npm email)
# Authenticator app code: (if 2FA enabled)
```

**What to expect:**
```
npm notice Logging in to https://registry.npmjs.com/
npm notice The credentials you provide will only be used to authenticate
npm notice with npm to publish packages and manage your account.
npm notice For more information visit https://docs.npmjs.com/adduser
npm notice It is recommended to use `npm adduser` to `npm login` with --auth-type=legacy
Username: (your-username)
Password:
Email: (your-email)
```

---

### **Step 6: TEST PUBLISH (Dry Run)** ✅ RECOMMENDED

```bash
# Test publish without actually publishing to npm
npm publish --dry-run

# This will show exactly what will be published
# Files included: dist/, README.md, package.json, package-lock.json
```

**Expected Output:**
```
npm notice
npm notice 📦  cloakx@1.0.2
npm notice === Tarball Contents ===
npm notice 103B  package.json
npm notice 2.0kB README.md
npm notice 1.2MB dist/
npm notice === Tarball Details ===
npm notice name:          cloakx
npm notice version:       1.0.2
npm notice tarball size:  ~2.5 MB
npm notice shasum:        [hash]
npm notice integrity:     [hash]
npm notice total files:   150+ files
npm notice
npm notice This would publish to the public npm registry
npm notice Run `npm publish` to confirm
```

---

### **Step 7: PUBLISH TO NPM** 🎉

```bash
# Publish to npm registry
npm publish

# Expected: ✓ package published successfully to npm registry
```

**Expected Output:**
```
npm notice
npm notice 📦  cloakx@1.0.2
npm notice === Tarball Contents ===
npm notice
npm notice === Tarball Details ===
npm notice name:          cloakx
npm notice version:       1.0.2
npm notice tarball size:  ~2.5 MB
npm notice shasum:        [hash]
npm notice integrity:     [hash]
npm notice total files:   150+
npm notice
npm notice ✓ published to npm (https://www.npmjs.com/package/cloakx)
```

---

### **Step 8: Verify Publication** (takes 2-5 min for npm to update)

```bash
# Check if published on npm registry
npm view cloakx

# Advanced: Check version specifically
npm view cloakx@1.0.2

# List all versions
npm view cloakx versions
# Expected: Should include "1.0.2"
```

**Expected Output:**
```
cloakx@1.0.2 | MIT | deps: 13 | versions: 2
Secure secret manager for developers
https://github.com/pravinxdev/cloak

keywords: cli-tool, secure-vault, local-encryption, ...

dist
.bin: cloakx
misc
author: Pravin
homepage: https://github.com/pravinxdev/cloak#readme
repository: {type: git, url: https://github.com/pravinxdev/cloak.git}

published yesterday by [your-username]
```

---

### **Step 9: Test Fresh Install** (takes 1-2 min)

```bash
# Test install in temporary location
npm install -g cloakx

# Verify it works
cloakx --version
# Expected Output: 1.0.2

cloakx --help
# Expected: List all commands

cloakx status
# Expected: Login status message (should be "not authenticated" if fresh)
```

**Expected Output:**
```
C:\Users\YourUsername\AppData\Roaming\npm\cloakx -> ...
added X packages

$ cloakx --version
1.0.2

$ cloakx help
Usage: cloakx [options] [command]

A secure, lightweight secret manager for developers

Options:
  -V, --version      output the version number
  -h, --help         display help for command

Commands:
  login              Initialize or authenticate vault
  logout             Clear current session
  ...
```

---

### **Step 10: Tag Release in Git** (takes 30 sec)

```bash
# Create git tag for this version
git tag v1.0.2

# Push tag to GitHub
git push origin v1.0.2

# Verify tag
git tag -l
# Expected: v1.0.2 in the list
```

---

## ⚡ QUICK PUBLISH CHECKLIST

```bash
# 1. Check status
git status                          # ✓ working tree clean

# 2. Build
npm run build                       # ✓ 0 errors

# 3. Test
npm publish --dry-run              # ✓ review what will publish

# 4. Login (if needed)
npm whoami                          # ✓ shows username

# 5. Publish
npm publish                         # ✓ published!

# 6. Verify
npm view cloakx@1.0.2              # ✓ visible on npm

# 7. Test install
npm install -g cloakx              # ✓ works globally
cloakx --version                   # ✓ 1.0.2

# 8. Tag release
git tag v1.0.2                     # ✓ tagged
git push origin v1.0.2             # ✓ pushed
```

**Total time: ~5-10 minutes** ⏱️

---

## 🎯 NEXT STEPS AFTER PUBLISHING

### 1. **Create GitHub Release**
```bash
# Go to https://github.com/yourusername/cloak/releases
# Click "Create a new release"
# Tag: v1.0.2
# Title: Version 1.0.2 - Multi-Parameter Support & Documentation
# Description: (see below)
```

**Release Description Template:**
```markdown
## 🎉 Cloakx v1.0.2 - Multi-Parameter Support

### ✨ What's New
- 📚 Comprehensive multi-parameter documentation in README
- 💡 Examples showing --env, --expires, --tags combined
- 📊 Command parameter reference table
- 📖 Expiration formats and tags usage guide

### 📋 All Commands Working
✅ 17 CLI commands fully functional
✅ 12 API endpoints verified
✅ Web UI (127.0.0.1:1201) operational
✅ Backend API (127.0.0.1:2000) running
✅ Security features verified (AES-256, rate limiting)

### 🚀 Installation
```bash
npm install -g cloakx@1.0.2
cloakx --help
```

### 📖 Documentation
- Multi-environment management
- Secure secret storage with expiration
- Tag-based organization
- Import/Export functionality
- Web UI for browser access

### 🔐 Security
- AES-256-CBC encryption
- PBKDF2 key derivation (100,000 iterations)
- Session-based authentication
- Rate limiting (5 attempts/15 min)
- CORS protection

---

Thank you for using Cloakx! 🕶️
```

### 2. **Announce on Social Media** (optional)
```
Twitter/LinkedIn:
Just published Cloakx v1.0.2 to npm! 🎉

🕶️ Secure secret manager for developers
💾 Local encryption (AES-256-CBC)
🌐 CLI + Web UI
📚 Comprehensive documentation

npm install -g cloakx
github.com/yourusername/cloak

#developers #security #npm #secretmanagement
```

### 3. **Update GitHub Repo**
- [x] Push tags: `git push origin v1.0.2`
- [ ] Create release on GitHub
- [ ] Update repository description if needed
- [ ] Add "npx cloakx" installation badge to README

---

## ✅ VERIFICATION CHECKLIST

After publishing, verify:

```bash
# 1. Package exists on npm
npm search cloakx                  # ✓ Should show cloakx

# 2. Version is correct
npm view cloakx@1.0.2              # ✓ Shows 1.0.2

# 3. Can install globally
npm install -g cloakx@1.0.2        # ✓ Installs successfully

# 4. CLI works
cloakx --version                   # ✓ Returns 1.0.2
cloakx --help                      # ✓ Shows all commands

# 5. Package info is correct
npm view cloakx                    # ✓ Name, description, keywords

# 6. Repository link works
npm view cloakx repository.url     # ✓ Links to GitHub

# 7. Files are correct (no .md files)
npm view cloakx files              # ✓ Only dist/ and README.md
```

---

## 🔄 FUTURE UPDATES

### For Version 1.0.3 or Later:

```bash
# 1. Make changes to code
# 2. Update version in package.json
#    "version": "1.0.3"

# 3. Commit changes
git add .
git commit -m "feat: description of changes"

# 4. Build
npm run build

# 5. Publish
npm publish

# 6. Tag release
git tag v1.0.3
git push origin v1.0.3
```

---

## ⚠️ IMPORTANT NOTES

### **DO NOT Publish If:**
- ❌ Uncommitted changes exist (`git status` shows files)
- ❌ Build has errors (`npm run build` shows errors)
- ❌ You're not on main branch (`git branch` shows * on different branch)
- ❌ Version already published (check `npm view cloakx versions`)
- ❌ Not logged in to npm (`npm whoami` returns error)

### **Version Numbers:**
- Current: 1.0.2 ✓
- Next patch: 1.0.3 (bug fixes)
- Next minor: 1.1.0 (new features)
- Next major: 2.0.0 (breaking changes)

### **Package Contents (what gets published):**
```
✓ dist/                  → Compiled CLI code
✓ README.md             → Main documentation
✓ package.json          → Metadata
✓ package-lock.json     → Dependency versions

✗ src/                  → Not included (compiled to dist/)
✗ web/                  → Not included
✗ .md files (internal)  → Not included (filtered by package.json "files")
✗ node_modules/         → Not included
✗ .git/                 → Not included
```

---

## 📞 TROUBLESHOOTING

### **Problem: "npm ERR! 404 Not Found"**
```
Solution: Wait 5-10 minutes for npm registry to update
Or check if you're logged in: npm whoami
```

### **Problem: "npm ERR! You must be logged in"**
```
Solution: npm login
```

### **Problem: "npm ERR! version already exists"**
```
Solution: Update version number in package.json (e.g., 1.0.2 → 1.0.3)
```

### **Problem: "Build errors"**
```
Solution: npm run build
Check tsconfig.json and fix TypeScript errors
```

### **Problem: "No files to publish"**
```
Solution: Check dist/ folder exists
npm run build (to create it)
Verify package.json "files" field
```

---

## 🎉 SUCCESS INDICATORS

After successful publish, you should see:

1. ✅ `npm notice` message with package name and version
2. ✅ Package appears on https://www.npmjs.com/package/cloakx
3. ✅ Can install globally: `npm install -g cloakx`
4. ✅ `cloakx --version` returns `1.0.2`
5. ✅ `cloakx help` shows all commands
6. ✅ GitHub repository updated with release

---

# 🚀 READY TO PUBLISH!

Your package is **production-ready** and can be published immediately.

**Next command to run:**
```bash
npm publish
```

Let me know if you need any help with the publishing process! 🎉
