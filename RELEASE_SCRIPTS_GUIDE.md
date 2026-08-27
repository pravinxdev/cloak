# 🚀 AUTOMATED RELEASE SCRIPTS

**Release Cloakx to npm and GitHub from Windows.**

---

## 📋 QUICK START

### Option 1: PowerShell (RECOMMENDED - Most Robust)

```powershell
.\release.ps1
# Or with version directly:
.\release.ps1 -Version "1.0.9"
```

**Pros:**
- ✅ Best error handling
- ✅ Colored output
- ✅ Most readable
- ✅ Windows native

### Option 2: Batch File (Interactive)

```batch
release.bat
# Or with version:
release.bat
```

**Pros:**
- ✅ No PowerShell policy issues
- ✅ Simple and clear
- ✅ Good feedback

---

## 🔄 WHAT THE SCRIPTS DO

Both scripts follow this process:

```
1️⃣ Prompt for version (or use parameter)
   ↓
2️⃣ Update src/config/version.ts
   ↓
3️⃣ Run: npm run update-version
   ↓
4️⃣ Run: npm run build
   ↓
5️⃣ If the build succeeds, run: npm publish
   ↓
6️⃣ Commit, tag, and push the release to GitHub manually
```

If the build fails, publishing stops. Fix the build before running `npm publish`.

---

## 📖 DETAILED USAGE

### POWERSHELL (Recommended)

**Interactive mode (prompts for version):**
```powershell
.\release.ps1
# Output:
# Current version: export const APP_VERSION = '1.0.9'
# Enter new version (e.g., 1.1.0): 1.1.0
# Ready to release? (Y/n): Y
# ... building and publishing ...
```

**Direct mode (version as parameter):**
```powershell
.\release.ps1 -Version "1.1.0"
# Skips the prompt and releases directly
```

**With error handling:**
- Shows clear messages if build fails
- Shows clear messages if publish fails
- Logs all steps with timestamps

---

### BATCH FILE (Interactive)

**Interactive mode:**
```batch
release.bat
# Prompts for version and confirmation
```

**Interactive mode:**
```batch
release.bat
# Prompts for the version and confirmation
```

**Features:**
- Easy-to-read output
- Step-by-step feedback
- Clear error messages

---

---

## ⚙️ WHAT HAPPENS STEP-BY-STEP

### Step 1: Update Version
```
Reads: src/config/version.ts
Finds: export const APP_VERSION = '1.0.8'
Changes to: export const APP_VERSION = '1.0.9'
```

### Step 2: Sync to package.json
```
Runs: npm run update-version
Which reads version.ts and updates package.json
```

### Step 3: Build
```
Runs: npm run build
This compiles TypeScript and copies web assets
If it fails → STOP (don't publish!)
If it succeeds → Continue to publish
```

### Step 4: Publish (ONLY if build succeeded)
```
Runs: npm publish
Publishes to npm registry
```

---

## ✅ SUCCESS OUTPUT

When everything works:

```
════════════════════════════════════════════════════════════════
🎉 RELEASE SUCCESSFUL!
════════════════════════════════════════════════════════════════

✅ Version updated:        1.0.9
✅ Build status:           SUCCESS
✅ Publish status:         SUCCESS

📊 What changed:
   • src/config/version.ts  → 1.0.9
   • package.json           → 1.0.9
   • npm registry           → cloakx@1.0.9

📢 For users to update:
   npm install -g cloakx@latest
```

---

## ❌ ERROR HANDLING

### If Build Fails:

```
════════════════════════════════════════════════════════════════
❌ BUILD FAILED - ABORTING PUBLISH
════════════════════════════════════════════════════════════════

Version was updated but build failed.
Fix errors and run: npm run build
Then publish with: npm publish
```

**What happened:**
- ✅ Version was updated
- ✅ package.json was synced
- ❌ Build failed
- ⚠️ **Did NOT publish** (safe!)

**To fix:**
1. Check error messages above
2. Fix the build issue
3. Run: `npm run build`
4. Run: `npm publish`

### If Publish Fails:

```
════════════════════════════════════════════════════════════════
❌ PUBLISH FAILED
════════════════════════════════════════════════════════════════

Build succeeded but publish failed.
Try again with: npm publish
```

**What happened:**
- ✅ Version updated
- ✅ Build succeeded
- ❌ Publish failed (usually network issue)
- ⚠️ Version bumped but not published

**To fix:**
1. Run: `npm publish`

---

## 🎯 WHICH SCRIPT TO USE?

| Situation | Script | Command |
|-----------|--------|---------|
| Daily releases | PowerShell | `.\release.ps1` |
| First time | PowerShell | `.\release.ps1` |
| PowerShell disabled | Batch | `release.bat` |
| CI/CD pipeline | Run the npm commands directly | See the steps above |

---

## 🔐 SAFETY CHECKS

All scripts include:

✅ **Version Validation**
- Requires non-empty version
- Requires confirmation before proceeding

✅ **Build Validation**
- Only publishes if build succeeds
- Shows build output for debugging

✅ **Error Handling**
- Clear error messages
- Proper exit codes
- Rollback information

✅ **Audit Trail**
- Shows what changed
- Shows which files updated
- Shows what users need to do

---

## 📝 EXAMPLES

### Release 1.1.0 using PowerShell

```powershell
PS> .\release.ps1 -Version "1.1.0"
```

### Release 1.1.0 using Batch (interactive)

```batch
C:\cloakx> release.bat
C:\cloakx> (prompts for version)
C:\cloakx> (prompts for confirmation)
```

---

## 🛠️ TROUBLESHOOTING

### PowerShell Script Won't Run
```powershell
# Error: "cannot be loaded because running scripts is disabled"
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# Then try again
.\release.ps1
```

### Batch File Not Found
```batch
# Make sure you're in the project root
cd d:\projects\npm\cloak
release.bat
```

### Build Fails
```
Check the error messages in the build output
Fix the issues
Run: npm run build (manually to test)
Run: npm publish (once build works)
```

### Version Not Updated
```
Make sure you have write permissions to:
- src/config/version.ts
- package.json

Check file permissions:
attrib src\config\version.ts
```

---

## 📊 COMPARISON TABLE

| Feature | PS1 | Batch |
|---------|-----|-------|
| **Version prompt** | ✅ | ✅ |
| **Confirmation prompt** | ✅ | ✅ |
| **Colored output** | ✅ | ⚠️ |
| **Error handling** | ✅✅✅ | ✅✅ |
| **Windows native** | ✅ | ✅✅ |
| **PowerShell required** | ✅ | ❌ |
| **Speed** | Medium | Medium |
| **Readability** | Excellent | Good |

---

## 🚀 NEXT RELEASE

Pick your preferred method and run it:

```powershell
# PowerShell (recommended)
.\release.ps1

# Or Batch
release.bat
```

After npm publish succeeds, push the release to GitHub:

```powershell
git add .
git commit -m "chore: release v1.1.0"
git tag v1.1.0
git push origin main --follow-tags
```

---

## 📞 QUICK REFERENCE

| Task | Command |
|------|---------|
| Release (interactive) | `.\release.ps1` |
| Release 1.1.0 directly | `.\release.ps1 -Version "1.1.0"` |
| Release (batch mode) | `release.bat` |
| Manual process | `npm run update-version; npm run build; npm publish` |

The scripts publish to npm. GitHub commits and tags are pushed separately with the commands above.
