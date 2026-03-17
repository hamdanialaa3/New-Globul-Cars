#!/usr/bin/env node
/**
 * sync-shared.js
 *
 * Copies shared/src/ → mobile_new/src/shared/ and verifies integrity.
 * Run after any change to shared/src/ to keep mobile_new in sync.
 *
 * Usage:
 *   node scripts/sync-shared.js          # sync + verify
 *   node scripts/sync-shared.js --check  # verify only (CI mode)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, 'shared', 'src');
const TARGET = path.join(ROOT, 'mobile_new', 'src', 'shared');
const CHECK_ONLY = process.argv.includes('--check');

function hashFile(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function getAllFiles(dir, base = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, base));
    } else {
      files.push(path.relative(base, fullPath));
    }
  }
  return files;
}

function syncShared() {
  if (!fs.existsSync(SOURCE)) {
    console.error('❌ Source not found:', SOURCE);
    process.exit(1);
  }

  const sourceFiles = getAllFiles(SOURCE);
  console.log(`📦 Found ${sourceFiles.length} files in shared/src/`);

  if (CHECK_ONLY) {
    let mismatches = 0;
    for (const relPath of sourceFiles) {
      const srcPath = path.join(SOURCE, relPath);
      const tgtPath = path.join(TARGET, relPath);
      if (!fs.existsSync(tgtPath)) {
        console.error(`  ❌ MISSING: mobile_new/src/shared/${relPath}`);
        mismatches++;
      } else if (hashFile(srcPath) !== hashFile(tgtPath)) {
        console.error(`  ❌ MISMATCH: ${relPath}`);
        mismatches++;
      } else {
        console.log(`  ✅ ${relPath}`);
      }
    }
    if (mismatches > 0) {
      console.error(`\n❌ ${mismatches} file(s) out of sync. Run: node scripts/sync-shared.js`);
      process.exit(1);
    }
    console.log('\n✅ All shared files are in sync.');
    return;
  }

  // Sync mode: copy files
  let copied = 0;
  let skipped = 0;

  for (const relPath of sourceFiles) {
    const srcPath = path.join(SOURCE, relPath);
    const tgtPath = path.join(TARGET, relPath);
    const tgtDir = path.dirname(tgtPath);

    // Skip if already identical
    if (fs.existsSync(tgtPath) && hashFile(srcPath) === hashFile(tgtPath)) {
      skipped++;
      continue;
    }

    // Ensure target directory exists
    if (!fs.existsSync(tgtDir)) {
      fs.mkdirSync(tgtDir, { recursive: true });
    }

    fs.copyFileSync(srcPath, tgtPath);
    console.log(`  📝 Copied: ${relPath}`);
    copied++;
  }

  console.log(`\n✅ Sync complete: ${copied} copied, ${skipped} already in sync.`);
}

syncShared();
