@echo off
REM ╔════════════════════════════════════════════════════════════════════════════╗
REM ║                    🚀 CLOAKX RELEASE AUTOMATION SCRIPT                     ║
REM ║                                                                            ║
REM ║  This script automates the release process:                              ║
REM ║  1. Update version in src/config/version.ts                              ║
REM ║  2. Sync version to package.json                                         ║
REM ║  3. Build project                                                         ║
REM ║  4. If build succeeds → Publish to npm                                   ║
REM ║  5. If build fails → Stop and show error                                 ║
REM ║                                                                            ║
REM ║  Usage: release.bat                                                       ║
REM ║  Then enter the new version number when prompted                         ║
REM ╚════════════════════════════════════════════════════════════════════════════╝

setlocal enabledelayedexpansion

cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║           🚀 CLOAKX RELEASE AUTOMATION SCRIPT                 ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Get current version from src/config/version.ts
for /f "tokens=*" %%a in ('findstr /R "export const APP_VERSION" src\config\version.ts') do set CURRENT_VERSION=%%a
echo 📦 Current version: %CURRENT_VERSION%
echo.

REM Prompt user for new version
set /p NEW_VERSION="Enter new version number (e.g., 1.0.9): "

if "%NEW_VERSION%"=="" (
    echo.
    echo ❌ Error: Version cannot be empty!
    echo.
    pause
    exit /b 1
)

echo.
echo ✓ New version: %NEW_VERSION%
echo.
echo Press any key to proceed with release...
pause

REM Step 1: Update version in src/config/version.ts
echo.
echo 📝 Step 1: Updating version in src/config/version.ts...
echo.

REM Use Node.js script to update version reliably
call node scripts\update-version-to.js %NEW_VERSION%
if errorlevel 1 (
    echo ❌ Failed to update version file!
    pause
    exit /b 1
)
echo ✅ Version updated in src/config/version.ts

echo.
echo.

REM Step 2: Sync version to package.json
echo 🔄 Step 2: Syncing version to package.json...
echo.

call npm run update-version
if errorlevel 1 (
    echo.
    echo ❌ Failed to sync version to package.json!
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Version synced to package.json
echo.
echo.

REM Step 3: Build project
echo 🏗️  Step 3: Building project...
echo.
echo ╔════════════════════════════════════════════════════════════════╗

call npm run build
set BUILD_EXIT_CODE=%errorlevel%

echo ╚════════════════════════════════════════════════════════════════╝
echo.

if %BUILD_EXIT_CODE% neq 0 (
    echo ❌ BUILD FAILED!
    echo.
    echo ⚠️  Build exited with code: %BUILD_EXIT_CODE%
    echo.
    echo 🔙 Rolling back version changes...
    echo    (You'll need to manually revert src/config/version.ts and package.json)
    echo.
    pause
    exit /b 1
)

echo ✅ Build succeeded!
echo.
echo.

REM Step 4: Publish to npm (only if build succeeded)
echo 📤 Step 4: Publishing to npm...
echo.
echo ╔════════════════════════════════════════════════════════════════╗

call npm publish

set PUBLISH_EXIT_CODE=%errorlevel%

echo ╚════════════════════════════════════════════════════════════════╝
echo.

if %PUBLISH_EXIT_CODE% neq 0 (
    echo ❌ PUBLISH FAILED!
    echo.
    echo ⚠️  Publish exited with code: %PUBLISH_EXIT_CODE%
    echo.
    echo 📝 Note: Version was already bumped and built successfully.
    echo    Fix the publish error and try again with: npm publish
    echo.
    pause
    exit /b 1
)

echo ✅ Published successfully!
echo.
echo.

REM Final Summary
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                  🎉 RELEASE COMPLETE!                        ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo ✅ Version updated:        %NEW_VERSION%
echo ✅ Build status:           SUCCESS
echo ✅ Publish status:         SUCCESS
echo.
echo 📊 Release Summary:
echo    • src/config/version.ts  → Updated to %NEW_VERSION%
echo    • package.json           → Synced to %NEW_VERSION%
echo    • npm registry           → Published v%NEW_VERSION%
echo.
echo Next steps for users:
echo    npm install -g cloakx@latest
echo.
echo.
pause
