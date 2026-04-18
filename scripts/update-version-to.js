#!/usr/bin/env node

/**
 * Update version in src/config/version.ts
 * Usage: node scripts/update-version-to.js 1.0.9
 */

const fs = require('fs');
const path = require('path');

const newVersion = process.argv[2];

if (!newVersion) {
    console.error('Error: No version provided');
    console.error('Usage: node scripts/update-version-to.js 1.0.9');
    process.exit(1);
}

try {
    const versionFilePath = path.join(__dirname, '..', 'src', 'config', 'version.ts');
    const content = fs.readFileSync(versionFilePath, 'utf-8');
    
    const updated = content.replace(
        /export const APP_VERSION = '.*?';/,
        `export const APP_VERSION = '${newVersion}';`
    );
    
    fs.writeFileSync(versionFilePath, updated, 'utf-8');
    console.log(`✅ Version updated to ${newVersion}`);
    
} catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
}
