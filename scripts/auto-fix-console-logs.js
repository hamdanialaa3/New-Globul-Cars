#!/usr/bin/env node
/**
 * Automatic Console.log Fixer
 * Converts all console.log/error/warn to logger service
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const SRC_DIR = path.join(__dirname, '../bulgarian-car-marketplace/src');

// Files to skip (logger service itself)
const SKIP_FILES = [
  'logger-service.ts',
  'logger-service.test.ts'
];

// Patterns to replace
const PATTERNS = [
  {
    // console.log → logger.info
    from: /console\.log\((.*?)\);?/g,
    to: 'logger.info($1);',
    logLevel: 'info'
  },
  {
    // console.error → logger.error
    from: /console\.error\((.*?)\);?/g,
    to: 'logger.error($1);',
    logLevel: 'error'
  },
  {
    // console.warn → logger.warn
    from: /console\.warn\((.*?)\);?/g,
    to: 'logger.warn($1);',
    logLevel: 'warn'
  },
  {
    // console.debug → logger.debug
    from: /console\.debug\((.*?)\);?/g,
    to: 'logger.debug($1);',
    logLevel: 'debug'
  }
];

let totalFixed = 0;
let filesModified = 0;

function shouldSkipFile(filePath) {
  return SKIP_FILES.some(skip => filePath.includes(skip));
}

function hasLoggerImport(content) {
  return content.includes("from '../services/logger-service'") ||
         content.includes("from '../../services/logger-service'") ||
         content.includes("from '../../../services/logger-service'") ||
         content.includes("from '../../../../services/logger-service'") ||
         content.includes("import { logger }");
}

function addLoggerImport(content, filePath) {
  // Calculate relative path to logger service
  const fileDir = path.dirname(filePath);
  const loggerPath = path.join(__dirname, '../bulgarian-car-marketplace/src/services/logger-service.ts');
  const relativePath = path.relative(fileDir, path.dirname(loggerPath));
  const importPath = relativePath.replace(/\\/g, '/') + '/logger-service';
  
  // Add import at the top after existing imports
  const importStatement = `import { logger } from '${importPath}';\n`;
  
  // Find the last import statement
  const lines = content.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ') || lines[i].startsWith('import{')) {
      lastImportIndex = i;
    }
  }
  
  if (lastImportIndex !== -1) {
    lines.splice(lastImportIndex + 1, 0, importStatement);
    return lines.join('\n');
  }
  
  // If no imports found, add at the top
  return importStatement + '\n' + content;
}

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fixCount = 0;
    
    // Apply all patterns
    PATTERNS.forEach(pattern => {
      const matches = content.match(pattern.from);
      if (matches && matches.length > 0) {
        content = content.replace(pattern.from, pattern.to);
        fixCount += matches.length;
        modified = true;
      }
    });
    
    // Add logger import if needed and not present
    if (modified && !hasLoggerImport(content)) {
      content = addLoggerImport(content, filePath);
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      filesModified++;
      totalFixed += fixCount;
      console.log(`✅ Fixed ${fixCount} console statements in: ${path.relative(SRC_DIR, filePath)}`);
    }
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🔧 Starting automatic console.log fixes...\n');
  
  // Find all TS/TSX files
  const files = glob.sync('**/*.{ts,tsx}', {
    cwd: SRC_DIR,
    absolute: true,
    ignore: ['**/*.test.ts', '**/*.test.tsx', '**/node_modules/**']
  });
  
  console.log(`📁 Found ${files.length} files to scan\n`);
  
  files.forEach(file => {
    if (!shouldSkipFile(file)) {
      fixFile(file);
    }
  });
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ COMPLETE!`);
  console.log(`📊 Files modified: ${filesModified}`);
  console.log(`🔧 Total fixes: ${totalFixed}`);
  console.log('='.repeat(50));
}

main();
