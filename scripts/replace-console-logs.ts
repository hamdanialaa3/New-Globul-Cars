/**
 * Replace Console Statements
 * Phase 1 (Automation): Replace console.* with logger.*
 * 
 * Usage:
 *   npx ts-node scripts/replace-console-logs.ts
 *   npx ts-node scripts/replace-console-logs.ts --dry-run
 */

import * as fs from 'fs';
import * as path from 'path';

const srcDir = path.join(__dirname, '../src');
const isDryRun = process.argv.includes('--dry-run');

let filesUpdated = 0;
let replacements = 0;

const REPLACEMENTS = [
  {
    // console.error('Message:', error);
    pattern: /console\.error\(['"]([^'"]+)['"],\s*error\);?/g,
    replacement: "logger.error('$1', error as Error);"
  },
  {
    // console.error('Message', error);
    pattern: /console\.error\(['"]([^'"]+)['"],\s*(\w+)\);?/g,
    replacement: "logger.error('$1', $2 as Error);"
  },
  {
    // console.log('Message');
    pattern: /console\.log\(['"]([^'"]+)['"]\);?/g,
    replacement: "if (process.env.NODE_ENV === 'development') { logger.debug('$1'); }"
  },
  {
    // console.warn('Message');
    pattern: /console\.warn\(['"]([^'"]+)['"]\);?/g,
    replacement: "logger.warn('$1');"
  },
];

function processFile(filePath: string) {
  // Skip certain files
  if (filePath.includes('node_modules')) return;
  if (filePath.includes('.test.')) return;
  if (filePath.includes('/__tests__/')) return;

  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  let fileReplacements = 0;

  // Apply replacements
  REPLACEMENTS.forEach(({ pattern, replacement }) => {
    const before = content;
    content = content.replace(pattern, replacement);

    if (content !== before) {
      modified = true;
      fileReplacements++;
    }
  });

  // Add import if modified and not present
  if (modified && !content.includes("from '../services/logger-service'") && !content.includes("from '@/services/logger-service'")) {
    // Find the last import statement
    const lines = content.split('\n');
    let lastImportIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) {
        lastImportIndex = i;
      }
    }

    if (lastImportIndex !== -1) {
      lines.splice(lastImportIndex + 1, 0, "import { logger } from '../services/logger-service';");
      content = lines.join('\n');
    }
  }

  // Write back if modified
  if (modified) {
    const relativePath = path.relative(srcDir, filePath);

    if (!isDryRun) {
      fs.writeFileSync(filePath, content, 'utf-8');
      filesUpdated++;
      replacements += fileReplacements;
      console.log(`✅ Updated: ${relativePath} (${fileReplacements} replacements)`);
    } else {
      console.log(`Would update: ${relativePath} (${fileReplacements} replacements)`);
      filesUpdated++;
      replacements += fileReplacements;
    }
  }
}

function scanDirectory(dir: string) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!['node_modules', 'build', 'dist', '.git'].includes(item)) {
        scanDirectory(fullPath);
      }
    } else if (stat.isFile()) {
      if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
        processFile(fullPath);
      }
    }
  }
}

// Run
console.log(`🔧 Replacing console statements with logger...\n`);
console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'LIVE'}\n`);

scanDirectory(srcDir);

console.log('\n' + '─'.repeat(60));
console.log(`📊 Summary:`);
console.log(`  Files updated: ${filesUpdated}`);
console.log(`  Total replacements: ${replacements}`);
console.log('─'.repeat(60));

if (isDryRun) {
  console.log('\n✅ DRY RUN COMPLETE - No files were modified');
} else {
  console.log('\n✅ REPLACEMENT COMPLETE');
}

