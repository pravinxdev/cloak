# 🚀 AUTOMATED RELEASE SCRIPTS

**Three ways to release Cloakx - Pick your favorite!**

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
release-final.bat
# Or with version:
release-final.bat 1.0.9
```

**Pros:**
- ✅ No PowerShell policy issues
- ✅ Simple and clear
- ✅ Good feedback

### Option 3: Simple Batch (Quick)

```batch
simple-release.bat 1.0.9
```

**Pros:**
- ✅ Fastest
- ✅ Minimal output
- ✅ Copy-paste commands

---

## 🔄 WHAT EACH SCRIPT DOES

All three scripts follow the SAME process:

```
1️⃣ Prompt for version (or use parameter)
   ↓
2️⃣ Update src/config/version.ts
   ↓
3️⃣ Run: npm run update-version
   ↓
4️⃣ Run: npm run build
   ↓
5️⃣ IF build succeeds → Run: npm publish
   ↓
6️⃣ IF build fails → STOP (don't publish)
```

---

## 📖 DETAILED USAGE

### POWERSHELL (Recommended)

**Interactive mode (prompts for version):**
```powershell
.\release.ps1
# Output:
# Current version: export const APP_VERSION = '1.0.8'
# Enter new version (e.g., 1.0.9): 1.0.9
# Ready to release? (Y/n): Y
# ... building and publishing ...
```

**Direct mode (version as parameter):**
```powershell
.\release.ps1 -Version "1.0.9"
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
release-final.bat
# Prompts for version and confirmation
```

**Direct mode:**
```batch
release-final.bat 1.0.9
# Skips the prompt
```

**Features:**
- Easy-to-read output
- Step-by-step feedback
- Clear error messages

---

### SIMPLE BATCH (Quick)

**Must provide version:**
```batch
simple-release.bat 1.0.9
```

**What it does:**
- Updates version
- Syncs to package.json
- Builds
- Publishes (if build succeeds)
- Exits with status code

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
| PowerShell disabled | Batch | `release-final.bat` |
| Quick release | Simple Batch | `simple-release.bat 1.0.9` |
| CI/CD pipeline | Any (add to pipeline) | See CI/CD section |

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

### Release 1.0.9 using PowerShell

```powershell
PS> .\release.ps1 -Version "1.0.9"
```

### Release 1.1.0 using Batch (interactive)

```batch
C:\cloakx> release-final.bat
C:\cloakx> (prompts for version)
C:\cloakx> (prompts for confirmation)
```

### Release 2.0.0 quickly

```batch
C:\cloakx> simple-release.bat 2.0.0
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
release-final.bat 1.0.9
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

| Feature | PS1 | Batch | Simple |
|---------|-----|-------|--------|
| **Version prompt** | ✅ | ✅ | ❌ |
| **Confirmation prompt** | ✅ | ✅ | ❌ |
| **Colored output** | ✅ | ⚠️ | ❌ |
| **Error handling** | ✅✅✅ | ✅✅ | ✅ |
| **Windows native** | ✅ | ✅✅ | ✅✅ |
| **PowerShell required** | ✅ | ❌ | ❌ |
| **Speed** | Medium | Medium | Fast |
| **Readability** | Excellent | Good | OK |

---

## 🚀 NEXT RELEASE

Pick your preferred method and run it:

```powershell
# PowerShell (recommended)
.\release.ps1

# Or Batch
release-final.bat

# Or Simple
simple-release.bat 1.0.9
```

That's it! Full automation with safety checks! 🎉

---

## 📞 QUICK REFERENCE

| Task | Command |
|------|---------|
| Release (interactive) | `.\release.ps1` |
| Release 1.0.9 directly | `.\release.ps1 -Version "1.0.9"` |
| Release (batch mode) | `release-final.bat` |
| Fast release | `simple-release.bat 1.0.9` |
| Manual process | `npm run update-version && npm run build && npm publish` |

All scripts do the same thing - pick what works best for you! 🎯
