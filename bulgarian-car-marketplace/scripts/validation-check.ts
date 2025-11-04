/**
 * Validation Check Script
 * Phase 1: Verify refactoring is complete
 * 
 * Checks:
 * - No DealerProfile interface definitions
 * - No DealerInfo interface definitions  
 * - No writes to isDealer
 * - No writes to dealerInfo
 * - No 'dealers' collection usage
 * 
 * Usage: npx ts-node scripts/validation-check.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const srcDir = path.join(__dirname, '../src');

interface Issue {
  file: string;
  line: number;
  issue: string;
  code: string;
}

const issues: Issue[] = [];

// Patterns to check
const FORBIDDEN_PATTERNS = [
  {
    pattern: /export\s+interface\s+DealerProfile\s*\{/,
    message: 'DealerProfile interface definition (should use DealershipInfo)',
    severity: 'high'
  },
  {
    pattern: /export\s+interface\s+DealerInfo\s*\{/,
    message: 'DealerInfo interface definition (should use DealershipInfo)',
    severity: 'high'
  },
  {
    pattern: /isDealer:\s*(true|false),/,
    message: 'Writing to isDealer field (should use profileType)',
    severity: 'high'
  },
  {
    pattern: /dealerInfo:\s*\{/,
    message: 'Writing to dealerInfo field (should use dealershipRef)',
    severity: 'high'
  },
  {
    pattern: /collection\(db,\s*['"]dealers['"]\)/,
    message: "Using 'dealers' collection (should use 'dealerships')",
    severity: 'high'
  },
  {
    pattern: /doc\(db,\s*['"]dealers['"]/,
    message: "Using 'dealers' collection (should use 'dealerships')",
    severity: 'high'
  },
];

function scanFile(filePath: string) {
  // Skip certain files
  if (filePath.includes('bulgarian-user.types.ts')) return; // Has deprecated definitions
  if (filePath.includes('.test.')) return;
  if (filePath.includes('Migration')) return; // Migration scripts are OK
  if (filePath.includes('/__tests__/')) return;

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    FORBIDDEN_PATTERNS.forEach(({ pattern, message, severity }) => {
      if (pattern.test(line)) {
        const relativePath = path.relative(srcDir, filePath);
        issues.push({
          file: relativePath,
          line: index + 1,
          issue: message,
          code: line.trim()
        });
      }
    });
  });
}

function scanDirectory(dir: string) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!['node_modules', 'build', 'dist', '.git', '__tests__'].includes(item)) {
        scanDirectory(fullPath);
      }
    } else if (stat.isFile()) {
      if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
        scanFile(fullPath);
      }
    }
  }
}

// Run scan
console.log('🔍 Validating refactoring...\n');
scanDirectory(srcDir);

// Report
if (issues.length === 0) {
  console.log('✅ ALL CHECKS PASSED!');
  console.log('\nNo forbidden patterns found.');
  console.log('Refactoring appears to be complete.\n');
  process.exit(0);
} else {
  console.log(`❌ FOUND ${issues.length} ISSUES:\n`);

  issues.forEach((issue, i) => {
    console.log(`${i + 1}. ${issue.file}:${issue.line}`);
    console.log(`   Issue: ${issue.issue}`);
    console.log(`   Code: ${issue.code}`);
    console.log('');
  });

  console.log('─'.repeat(60));
  console.log(`\n❌ ${issues.length} issues found. Please fix before proceeding.\n`);
  process.exit(1);
}

