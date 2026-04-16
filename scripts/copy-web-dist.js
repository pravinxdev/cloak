#!/usr/bin/env node

/**
 * Copy built web assets from web/dist to public folder
 * This ensures the web UI is included in the npm package
 */

const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  // Create destination folder if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Copy all files
  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcFile = path.join(src, file);
    const destFile = path.join(dest, file);

    if (fs.statSync(srcFile).isDirectory()) {
      copyDir(srcFile, destFile);
    } else {
      fs.copyFileSync(srcFile, destFile);
    }
  });
}

try {
  const webDist = path.join(__dirname, '..', 'web', 'dist');
  const publicDir = path.join(__dirname, '..', 'public');

  if (fs.existsSync(webDist)) {
    console.log('📦 Copying web/dist to public...');
    copyDir(webDist, publicDir);
    console.log('✅ Web assets copied to public folder');
  } else {
    console.warn('⚠️  web/dist not found, skipping copy');
  }
} catch (err) {
  console.error('❌ Error copying web assets:', err.message);
  process.exit(1);
}
