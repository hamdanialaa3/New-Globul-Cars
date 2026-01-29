/**
 * Find Missing useEffect Cleanups
 * Phase 1 (Automation): Detect memory leaks
 * 
 * Scans TypeScript/TSX files for useEffect without cleanup
 * 
 * Usage: npx ts-node scripts/find-missing-cleanups.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const srcDir = path.join(__dirname, '../src');

interface Finding {
  file: string;
  line: number;
  code: string;
  severity: 'high' | 'medium' | 'low';
  reason: string;
}

const findings: Finding[] = [];

// Keywords that indicate cleanup might be needed
const CLEANUP_INDICATORS = [
  'onSnapshot',
  'addEventListener',
  'setInterval',
  'setTimeout',
  'subscribe',
  '.then(',
  'Promise',
  'async'
];

function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for useEffect
    if (line.includes('useEffect(') || line.includes('useEffect (() =>')) {
      // Look ahead for return cleanup
      let hasReturn = false;
      let hasCleanupIndicator = false;
      let effectBody = '';

      // Scan next 30 lines (typical useEffect length)
      for (let j = i; j < Math.min(i + 30, lines.length); j++) {
        effectBody += lines[j] + '\n';

        if (lines[j].includes('return () =>') || lines[j].includes('return function')) {
          hasReturn = true;
          break;
        }

        // Check for indicators that cleanup is needed
        for (const indicator of CLEANUP_INDICATORS) {
          if (lines[j].includes(indicator)) {
            hasCleanupIndicator = true;
          }
        }

        // If we hit closing of useEffect
        if (lines[j].includes('}, [')) {
          break;
        }
      }

      // Report if cleanup indicator found but no return
      if (hasCleanupIndicator && !hasReturn) {
        const relativePath = path.relative(srcDir, filePath);

        findings.push({
          file: relativePath,
          line: i + 1,
          code: effectBody.trim().substring(0, 100) + '...',
          severity: effectBody.includes('onSnapshot') || effectBody.includes('setInterval')
            ? 'high'
            : effectBody.includes('.then(') || effectBody.includes('Promise')
            ? 'medium'
            : 'low',
          reason: hasCleanupIndicator
            ? `Found ${CLEANUP_INDICATORS.find(ind => effectBody.includes(ind))} without cleanup`
            : 'Async operation without cleanup'
        });
      }
    }
  }
}

function scanDirectory(dir: string) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip node_modules, build, etc.
      if (!['node_modules', 'build', 'dist', '.git'].includes(item)) {
        scanDirectory(fullPath);
      }
    } else if (stat.isFile()) {
      // Only scan .ts and .tsx files
      if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
        scanFile(fullPath);
      }
    }
  }
}

// Run scan
console.log('🔍 Scanning for missing useEffect cleanups...\n');
scanDirectory(srcDir);

// Sort by severity
findings.sort((a, b) => {
  const severityOrder = { high: 3, medium: 2, low: 1 };
  return severityOrder[b.severity] - severityOrder[a.severity];
});

// Report results
console.log(`📊 Found ${findings.length} potential issues:\n`);

const high = findings.filter(f => f.severity === 'high');
const medium = findings.filter(f => f.severity === 'medium');
const low = findings.filter(f => f.severity === 'low');

if (high.length > 0) {
  console.log(`🔴 HIGH SEVERITY (${high.length}):`);
  high.forEach(f => {
    console.log(`  ${f.file}:${f.line}`);
    console.log(`    Reason: ${f.reason}`);
    console.log('');
  });
}

if (medium.length > 0) {
  console.log(`🟡 MEDIUM SEVERITY (${medium.length}):`);
  medium.forEach(f => {
    console.log(`  ${f.file}:${f.line} - ${f.reason}`);
  });
  console.log('');
}

if (low.length > 0) {
  console.log(`🟢 LOW SEVERITY (${low.length}):`);
  console.log(`  (${low.length} files - review manually)`);
  console.log('');
}

console.log('─'.repeat(60));
console.log(`\n✅ Scan complete. Review ${high.length + medium.length} high/medium priority issues.`);

// Export to JSON
const report = {
  timestamp: new Date().toISOString(),
  totalFindings: findings.length,
  breakdown: {
    high: high.length,
    medium: medium.length,
    low: low.length
  },
  findings: findings
};

fs.writeFileSync(
  path.join(__dirname, '../CLEANUP_REPORT.json'),
  JSON.stringify(report, null, 2)
);

console.log('📝 Report saved to: CLEANUP_REPORT.json\n');

