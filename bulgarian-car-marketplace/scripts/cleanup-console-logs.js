#!/usr/bin/env node
/**
 * Cleanup Script - Remove console.log statements
 * تنظيف console.log من الكود
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Files to skip (utility/debug files that need console.log)
const SKIP_FILES = [
  'logger-service.ts',
  'debug-service.ts',
  'checkCarsStatus.ts', // Debug utility
  'lazyImport.ts' // Keep error logging
];

// Patterns to remove
const PATTERNS_TO_REMOVE = [
  /^\s*console\.log\([^)]*\);?\s*$/gm,
  /^\s*console\.debug\([^)]*\);?\s*$/gm,
  /^\s*console\.info\([^)]*\);?\s*$/gm,
];

// Patterns to keep (error handling)
const PATTERNS_TO_KEEP = [
  /console\.error/,
  /console\.warn/
];

let filesProcessed = 0;
let linesRemoved = 0;

function shouldSkipFile(filePath) {
  return SKIP_FILES.some(skip => filePath.includes(skip));
}

function cleanFile(filePath) {
  if (shouldSkipFile(filePath)) {
    console.log(`⏭️  Skipping: ${path.relative(process.cwd(), filePath)}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const originalLength = lines.length;
  
  const cleanedLines = lines.filter(line => {
    // Keep error/warn logging
    if (PATTERNS_TO_KEEP.some(pattern => pattern.test(line))) {
      return true;
    }
    
    // Remove console.log/debug/info
    for (const pattern of PATTERNS_TO_REMOVE) {
      if (pattern.test(line)) {
        return false;
      }
    }
    
    return true;
  });
  
  const removedCount = originalLength - cleanedLines.length;
  
  if (removedCount > 0) {
    fs.writeFileSync(filePath, cleanedLines.join('\n'), 'utf8');
    console.log(`✅ ${path.relative(process.cwd(), filePath)}: removed ${removedCount} lines`);
    filesProcessed++;
    linesRemoved += removedCount;
  }
}

// Find all TypeScript/JavaScript files
const srcFiles = glob.sync('src/**/*.{ts,tsx,js,jsx}', {
  cwd: process.cwd(),
  absolute: true,
  ignore: ['**/node_modules/**', '**/build/**', '**/*.test.*', '**/*.spec.*']
});

console.log(`\n🧹 تنظيف console.log من ${srcFiles.length} ملف...\n`);

srcFiles.forEach(cleanFile);

console.log(`\n✅ اكتمل التنظيف!`);
console.log(`📁 ملفات معدلة: ${filesProcessed}`);
console.log(`📝 سطور محذوفة: ${linesRemoved}\n`);
