/**
 * Bundle Size Analyzer
 * تحليل حجم الحزم والتبعيات
 */
const fs = require('fs');
const path = require('path');

console.log('📦 Analyzing bundle composition...\n');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const buildDir = path.join(__dirname, '..', 'build');

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Analyze dependencies
const dependencies = packageJson.dependencies || {};
const devDependencies = packageJson.devDependencies || {};

console.log('📊 Dependency Analysis\n');
console.log('=' .repeat(60));

console.log(`\n📦 Production Dependencies: ${Object.keys(dependencies).length}`);
console.log('Top dependencies:');
const sortedDeps = Object.entries(dependencies)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .slice(0, 20);

sortedDeps.forEach(([name, version]) => {
  console.log(`  - ${name}@${version}`);
});

if (Object.keys(dependencies).length > 20) {
  console.log(`  ... and ${Object.keys(dependencies).length - 20} more`);
}

console.log(`\n🛠️  Dev Dependencies: ${Object.keys(devDependencies).length}`);

// Check for heavy libraries
const heavyLibs = {
  'firebase': 'Large (consider tree-shaking)',
  '@firebase/firestore': 'Heavy (check if all features used)',
  'react-google-maps': 'Heavy (consider Leaflet fallback)',
  'socket.io-client': 'Medium',
  'styled-components': 'Medium',
  '@mui/material': 'Heavy',
  'chart.js': 'Medium',
  'react-chartjs-2': 'Medium'
};

console.log('\n⚠️  Heavy Dependencies Detected:');
Object.keys(dependencies).forEach(dep => {
  if (heavyLibs[dep]) {
    console.log(`  - ${dep}: ${heavyLibs[dep]}`);
  }
});

// Check build directory if exists
let buildStats = null;
if (fs.existsSync(buildDir)) {
  console.log('\n📁 Build Directory Analysis:');
  
  function getDirectorySize(dir) {
    let size = 0;
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        size += getDirectorySize(filePath);
      } else {
        size += stat.size;
      }
    });
    
    return size;
  }
  
  const totalSize = getDirectorySize(buildDir);
  const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
  
  console.log(`  Total build size: ${sizeInMB} MB`);
  
  // Analyze JS files
  const staticDir = path.join(buildDir, 'static', 'js');
  if (fs.existsSync(staticDir)) {
    const jsFiles = fs.readdirSync(staticDir)
      .filter(f => f.endsWith('.js'))
      .map(f => {
        const stat = fs.statSync(path.join(staticDir, f));
        return {
          name: f,
          size: stat.size,
          sizeMB: (stat.size / (1024 * 1024)).toFixed(2)
        };
      })
      .sort((a, b) => b.size - a.size);
    
    console.log('\n  Top JS bundles:');
    jsFiles.slice(0, 10).forEach(file => {
      console.log(`    ${file.name}: ${file.sizeMB} MB`);
    });
    
    buildStats = {
      totalSizeMB: sizeInMB,
      jsFiles: jsFiles.length,
      topBundles: jsFiles.slice(0, 5)
    };
  }
} else {
  console.log('\n⚠️  Build directory not found. Run "npm run build" first.');
}

// Recommendations
console.log('\n💡 Optimization Recommendations:');
console.log('  1. Lazy load heavy components (Maps, Charts, Admin panels)');
console.log('  2. Use dynamic imports for Firebase modules');
console.log('  3. Consider code splitting by route');
console.log('  4. Review if all Firebase features are needed');
console.log('  5. Use production builds of React (already configured)');
console.log('  6. Enable gzip compression on server');
console.log('  7. Consider using React.lazy for large components');

console.log('\n' + '='.repeat(60));

// Save report
const reportPath = path.join(__dirname, '..', 'BUNDLE_SIZE_REPORT.json');
fs.writeFileSync(reportPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  dependencies: {
    production: Object.keys(dependencies).length,
    development: Object.keys(devDependencies).length,
    heavy: Object.keys(dependencies).filter(d => heavyLibs[d]).map(d => ({
      name: d,
      note: heavyLibs[d]
    }))
  },
  buildStats,
  recommendations: [
    'Lazy load heavy components',
    'Dynamic imports for Firebase',
    'Code splitting by route',
    'Review Firebase feature usage',
    'Enable server compression'
  ]
}, null, 2));

console.log(`💾 Detailed report saved to: BUNDLE_SIZE_REPORT.json`);

console.log(`\n${JSON.stringify({
  ok: true,
  productionDeps: Object.keys(dependencies).length,
  heavyDeps: Object.keys(dependencies).filter(d => heavyLibs[d]).length,
  buildSizeMB: buildStats?.totalSizeMB || 'N/A',
  timestamp: new Date().toISOString()
}, null, 2)}`);
