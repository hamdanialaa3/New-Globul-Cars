/**
 * Console.log Usage Scanner
 * فحص استخدامات console.log في الكود
 */
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

console.log('🔍 Scanning for console.log usage...\n');

function scanDirectory(dir, results = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'build') {
        scanDirectory(filePath, results);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, idx) => {
        // Skip comments
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
          return;
        }
        
        // Match console.* calls (log, error, warn, info, debug)
        const consoleMatch = line.match(/console\.(log|error|warn|info|debug|table|dir|trace)/g);
        if (consoleMatch) {
          results.push({
            file: filePath.replace(/\\/g, '/').split('src/')[1] || filePath,
            line: idx + 1,
            content: line.trim(),
            type: consoleMatch[0].split('.')[1]
          });
        }
      });
    }
  });
  
  return results;
}

function categorizeByType(results) {
  const byType = {
    log: [],
    error: [],
    warn: [],
    info: [],
    debug: [],
    other: []
  };
  
  results.forEach(r => {
    if (byType[r.type]) {
      byType[r.type].push(r);
    } else {
      byType.other.push(r);
    }
  });
  
  return byType;
}

function categorizeByFile(results) {
  const byFile = {};
  
  results.forEach(r => {
    if (!byFile[r.file]) {
      byFile[r.file] = [];
    }
    byFile[r.file].push(r);
  });
  
  return byFile;
}

// Run scan
const results = scanDirectory(srcDir);
const byType = categorizeByType(results);
const byFile = categorizeByFile(results);

console.log('📊 Console Usage Analysis\n');
console.log('=' .repeat(60));

// Summary by type
console.log('\n📈 By Type:');
Object.keys(byType).forEach(type => {
  const count = byType[type].length;
  if (count > 0) {
    console.log(`  ${type}: ${count} occurrences`);
  }
});

// Top files
console.log('\n🔝 Top Files (by count):');
const sortedFiles = Object.entries(byFile)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 15);

sortedFiles.forEach(([file, occurrences]) => {
  console.log(`  ${file} (${occurrences.length})`);
});

if (Object.keys(byFile).length > 15) {
  console.log(`  ... and ${Object.keys(byFile).length - 15} more files`);
}

// Recommendations
console.log('\n💡 Recommendations:');
console.log('  1. Replace console.log → logger.info()');
console.log('  2. Replace console.error → logger.error()');
console.log('  3. Replace console.warn → logger.warn()');
console.log('  4. Replace console.debug → logger.debug()');
console.log('  5. Add environment check for production (logger-service has this built-in)');

console.log('\n' + '='.repeat(60));
console.log(`\n📈 Total: ${results.length} console.* calls in ${Object.keys(byFile).length} files`);

// Save detailed report
const reportPath = path.join(__dirname, '..', 'CONSOLE_LOG_AUDIT_REPORT.json');
fs.writeFileSync(reportPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  totalOccurrences: results.length,
  totalFiles: Object.keys(byFile).length,
  byType,
  byFile,
  topFiles: sortedFiles.map(([file, occurrences]) => ({
    file,
    count: occurrences.length
  }))
}, null, 2));

console.log(`💾 Detailed report saved to: CONSOLE_LOG_AUDIT_REPORT.json`);

console.log(`\n${JSON.stringify({
  ok: results.length === 0,
  totalOccurrences: results.length,
  totalFiles: Object.keys(byFile).length,
  byType: Object.fromEntries(
    Object.entries(byType).map(([k, v]) => [k, v.length])
  ),
  timestamp: new Date().toISOString()
}, null, 2)}`);
