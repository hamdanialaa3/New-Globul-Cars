/**
 * Legacy Location Fields Usage Analyzer
 * Analyzes location/city/region field usage and generates migration plan
 */
const fs = require('fs');
const path = require('path');

function scanDirectory(dir, pattern, results = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'build') {
        scanDirectory(filePath, pattern, results);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, idx) => {
        if (pattern.test(line)) {
          results.push({
            file: filePath,
            line: idx + 1,
            content: line.trim(),
            type: detectUsageType(line)
          });
        }
      });
    }
  });
  
  return results;
}

function detectUsageType(line) {
  if (/location\s*:/.test(line)) return 'location';
  if (/city\s*:/.test(line)) return 'city';
  if (/region\s*:/.test(line)) return 'region';
  if (/\.location\b/.test(line)) return 'location_access';
  if (/\.city\b/.test(line)) return 'city_access';
  if (/\.region\b/.test(line)) return 'region_access';
  return 'other';
}

function categorizeByFile(results) {
  const byFile = {};
  
  results.forEach(r => {
    const relPath = r.file.replace(/\\/g, '/').split('bulgarian-car-marketplace/')[1] || r.file;
    if (!byFile[relPath]) {
      byFile[relPath] = [];
    }
    byFile[relPath].push(r);
  });
  
  return byFile;
}

function generateMigrationPlan(byFile) {
  const categories = {
    services: [],
    types: [],
    components: [],
    pages: [],
    utils: [],
    tests: []
  };
  
  Object.keys(byFile).forEach(file => {
    const count = byFile[file].length;
    const entry = { file, count, occurrences: byFile[file] };
    
    if (file.includes('/services/')) categories.services.push(entry);
    else if (file.includes('/types/')) categories.types.push(entry);
    else if (file.includes('/components/')) categories.components.push(entry);
    else if (file.includes('/pages/')) categories.pages.push(entry);
    else if (file.includes('/utils/')) categories.utils.push(entry);
    else if (file.includes('test') || file.includes('spec')) categories.tests.push(entry);
    else categories.utils.push(entry);
  });
  
  return categories;
}

function main() {
  const srcDir = path.join(__dirname, '..', 'src');
  const pattern = /\b(location|city|region)\s*[:.]|\.(location|city|region)\b/;
  
  console.log('🔍 Scanning for legacy location field usage...\n');
  
  const results = scanDirectory(srcDir, pattern);
  const byFile = categorizeByFile(results);
  const categories = generateMigrationPlan(byFile);
  
  console.log('📊 Legacy Location Fields Analysis\n');
  console.log('=' .repeat(60));
  
  Object.keys(categories).forEach(cat => {
    const items = categories[cat];
    if (items.length > 0) {
      console.log(`\n${cat.toUpperCase()} (${items.length} files):`);
      items.slice(0, 10).forEach(item => {
        console.log(`  - ${item.file} (${item.count} occurrences)`);
      });
      if (items.length > 10) {
        console.log(`  ... and ${items.length - 10} more files`);
      }
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n📈 Total: ${results.length} legacy field usages across ${Object.keys(byFile).length} files`);
  
  // Save detailed report
  const reportPath = path.join(__dirname, '..', 'LEGACY_LOCATION_FIELDS_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalOccurrences: results.length,
    totalFiles: Object.keys(byFile).length,
    categories,
    detailedResults: byFile
  }, null, 2));
  
  console.log(`\n💾 Detailed report saved to: LEGACY_LOCATION_FIELDS_REPORT.json`);
  
  // Generate migration priority
  console.log('\n📋 Migration Priority (Recommended Order):');
  console.log('1. Types definitions (update interfaces first)');
  console.log('2. Services layer (update data access)');
  console.log('3. Components (update UI consumption)');
  console.log('4. Pages (update page-level logic)');
  console.log('5. Tests (update test expectations)');
  
  return {
    ok: true,
    totalOccurrences: results.length,
    totalFiles: Object.keys(byFile).length,
    categories
  };
}

const result = main();
console.log(`\n${JSON.stringify(result, null, 2)}`);
