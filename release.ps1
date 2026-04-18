#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Automated release script for Cloakx
.DESCRIPTION
    This script automates the complete release process:
    1. Update version in src/config/version.ts
    2. Sync version to package.json
    3. Build the project
    4. Publish to npm (ONLY if build succeeds)
.EXAMPLE
    .\release.ps1
    .\release.ps1 -Version "1.0.9"
.PARAMETER Version
    The new version number (optional - will prompt if not provided)
#>

param(
    [string]$Version = ""
)

$ErrorActionPreference = "Continue"

# Colors
$colors = @{
    Green   = "Green"
    Red     = "Red"
    Yellow  = "Yellow"
    Cyan    = "Cyan"
    Gray    = "Gray"
}

function Write-Header($message) {
    Write-Host ""
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor $colors.Cyan
    Write-Host $message -ForegroundColor $colors.Cyan
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor $colors.Cyan
    Write-Host ""
}

function Write-Status($message, $status) {
    if ($status -eq "success") {
        Write-Host "✅ $message" -ForegroundColor $colors.Green
    } elseif ($status -eq "error") {
        Write-Host "❌ $message" -ForegroundColor $colors.Red
    } else {
        Write-Host "⏳ $message" -ForegroundColor $colors.Yellow
    }
}

# Clear screen
Clear-Host

Write-Header "🚀 CLOAKX RELEASE AUTOMATION"

# Get current version
$versionFile = "src/config/version.ts"
$currentVersionLine = Select-String -Path $versionFile -Pattern "export const APP_VERSION" | Select-Object -First 1
Write-Host "Current version: $($currentVersionLine.Line)"
Write-Host ""

# Get new version
if ([string]::IsNullOrEmpty($Version)) {
    $Version = Read-Host "Enter new version (e.g., 1.0.9)"
}

if ([string]::IsNullOrEmpty($Version)) {
    Write-Status "Version cannot be empty" "error"
    exit 1
}

Write-Host ""
Write-Host "New version: $Version" -ForegroundColor $colors.Green
Write-Host ""

$confirm = Read-Host "Ready to release? (Y/n)"
if ($confirm -ne "" -and $confirm -ne "Y" -and $confirm -ne "y") {
    Write-Status "Release cancelled" "error"
    exit 0
}

# Step 1: Update version
Write-Header "📝 Step 1: Updating version"

try {
    $content = Get-Content $versionFile -Raw
    $content = $content -replace "export const APP_VERSION = '.*?'", "export const APP_VERSION = '$Version'"
    Set-Content $versionFile $content -Encoding UTF8 -ErrorAction Stop
    Write-Status "Version updated in src/config/version.ts" "success"
} catch {
    Write-Status "Failed to update version: $_" "error"
    exit 1
}

# Step 2: Sync to package.json
Write-Header "🔄 Step 2: Syncing to package.json"

try {
    npm run update-version 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "update-version script failed"
    }
    Write-Status "Version synced to package.json" "success"
} catch {
    Write-Status "Failed to sync version: $_" "error"
    exit 1
}

# Step 3: Build
Write-Header "🏗️  Step 3: Building project"

Write-Host "Building..." -ForegroundColor $colors.Gray
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "" 
    Write-Header "❌ BUILD FAILED - ABORTING PUBLISH"
    Write-Status "Version was updated but build failed" "error"
    Write-Host "Fix the errors above and run: npm run build" -ForegroundColor $colors.Yellow
    Write-Host "Then publish with: npm publish" -ForegroundColor $colors.Yellow
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Status "Build succeeded!" "success"

# Step 4: Publish (ONLY if build succeeded)
Write-Header "📤 Step 4: Publishing to npm"

Write-Host "Publishing..." -ForegroundColor $colors.Gray
npm publish

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Header "❌ PUBLISH FAILED"
    Write-Status "Build succeeded but publish failed" "error"
    Write-Host "Version was already bumped. Retry with: npm publish" -ForegroundColor $colors.Yellow
    Write-Host ""
    exit 1
}

# Success!
Write-Host ""
Write-Header "🎉 RELEASE SUCCESSFUL!"

Write-Host "✅ Version updated:        $Version" -ForegroundColor $colors.Green
Write-Host "✅ Build status:           SUCCESS" -ForegroundColor $colors.Green
Write-Host "✅ Publish status:         SUCCESS" -ForegroundColor $colors.Green
Write-Host ""

Write-Host "📊 What changed:" -ForegroundColor $colors.Cyan
Write-Host "   • src/config/version.ts  -> Updated to $Version"
Write-Host "   • package.json           -> Synced to $Version"
Write-Host "   • npm registry           -> Published v$Version"
Write-Host ""

Write-Host "📢 For users to update:" -ForegroundColor $colors.Gray
Write-Host "   npm install -g cloakx@latest"
Write-Host ""
