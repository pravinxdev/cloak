#!/usr/bin/env node

/**
 * 📋 VERSION UPDATE SCRIPT
 * Syncs version from src/config/version.ts to package.json
 * 
 * Usage: node scripts/update-version.js
 */

const fs = require('fs');
const path = require('path');

// 📖 Extract version from src/config/version.ts
const versionFilePath = path.join(__dirname, '..', 'src', 'config', 'version.ts');
const versionContent = fs.readFileSync(versionFilePath, 'utf-8');
const versionMatch = versionContent.match(/export const APP_VERSION = ['"](.+?)['"]/);

if (!versionMatch) {
  console.error('❌ Could not find APP_VERSION in src/config/version.ts');
  process.exit(1);
}

const newVersion = versionMatch[1];
console.log(`📦 Detected version: ${newVersion}`);

// 📝 Update package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const oldVersion = packageJson.version;
packageJson.version = newVersion;

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
console.log(`✅ Updated package.json: ${oldVersion} → ${newVersion}`);

console.log('\n✨ Version sync complete!');
console.log(`   Next step: npm run build && npm publish`);
