/**
 * Singleton Pattern Audit Script
 * مراجعة نمط Singleton في جميع الخدمات
 */
const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, '..', 'src', 'services');

console.log('🔍 Auditing Singleton pattern in services...\n');

function scanServices(dir, results = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      scanServices(filePath, results);
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const analysis = analyzeSingletonPattern(content, filePath);
      
      if (analysis.hasSingleton) {
        results.push(analysis);
      }
    }
  });
  
  return results;
}

function analyzeSingletonPattern(content, filePath) {
  const analysis = {
    file: filePath.replace(/\\/g, '/').split('src/')[1],
    hasSingleton: false,
    hasPrivateConstructor: false,
    hasGetInstance: false,
    hasStaticInstance: false,
    isProperSingleton: false,
    issues: []
  };
  
  // Check for class definition
  const classMatch = content.match(/class\s+(\w+)/);
  if (!classMatch) return analysis;
  
  const className = classMatch[1];
  
  // Check for singleton patterns
  const hasPrivateConstructor = /private\s+constructor/.test(content);
  const hasStaticInstance = new RegExp(`private\\s+static\\s+instance\\s*:\\s*${className}`).test(content);
  const hasGetInstance = /static\s+getInstance\s*\(/.test(content) || 
                        /public\s+static\s+getInstance\s*\(/.test(content);
  
  analysis.hasSingleton = hasPrivateConstructor || hasStaticInstance || hasGetInstance;
  analysis.hasPrivateConstructor = hasPrivateConstructor;
  analysis.hasGetInstance = hasGetInstance;
  analysis.hasStaticInstance = hasStaticInstance;
  
  // Determine if properly implemented
  if (analysis.hasSingleton) {
    if (!hasPrivateConstructor) {
      analysis.issues.push('Missing private constructor - can be instantiated directly');
    }
    if (!hasGetInstance) {
      analysis.issues.push('Missing getInstance() method');
    }
    if (!hasStaticInstance) {
      analysis.issues.push('Missing static instance property');
    }
    
    // Check for proper getInstance implementation
    if (hasGetInstance) {
      const getInstanceMatch = content.match(/static\s+getInstance\s*\([^)]*\)\s*[:{][^}]*}/s);
      if (getInstanceMatch) {
        const method = getInstanceMatch[0];
        if (!method.includes('this.instance')) {
          analysis.issues.push('getInstance() does not check/set instance property');
        }
        if (!method.includes('new ')) {
          analysis.issues.push('getInstance() does not create new instance');
        }
      }
    }
    
    analysis.isProperSingleton = analysis.issues.length === 0;
  }
  
  return analysis;
}

// Run analysis
const results = scanServices(servicesDir);

// Categorize results
const proper = results.filter(r => r.isProperSingleton);
const improper = results.filter(r => !r.isProperSingleton);

console.log('📊 Singleton Pattern Analysis\n');
console.log('=' .repeat(60));

console.log(`\n✅ Properly Implemented (${proper.length}):`);
proper.slice(0, 10).forEach(r => {
  console.log(`  - ${r.file}`);
});
if (proper.length > 10) {
  console.log(`  ... and ${proper.length - 10} more`);
}

console.log(`\n⚠️  Needs Review (${improper.length}):`);
improper.forEach(r => {
  console.log(`\n  - ${r.file}`);
  r.issues.forEach(issue => {
    console.log(`    ❌ ${issue}`);
  });
});

console.log('\n' + '='.repeat(60));
console.log(`\n📈 Summary: ${proper.length}/${results.length} services properly implement Singleton pattern`);

// Save detailed report
const reportPath = path.join(__dirname, '..', 'SINGLETON_AUDIT_REPORT.json');
fs.writeFileSync(reportPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  totalServices: results.length,
  properSingletons: proper.length,
  improperSingletons: improper.length,
  proper,
  improper
}, null, 2));

console.log(`\n💾 Detailed report saved to: SINGLETON_AUDIT_REPORT.json`);

console.log(`\n${JSON.stringify({
  ok: improper.length === 0,
  totalServices: results.length,
  properSingletons: proper.length,
  improperSingletons: improper.length,
  timestamp: new Date().toISOString()
}, null, 2)}`);
