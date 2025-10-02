// scripts/verify-translation-coverage.cjs
// Verify all components use translation system properly

const fs = require('fs');
const path = require('path');

let results = {
  totalFiles: 0,
  filesUsingT: 0,
  filesWithHardcoded: 0,
  hardcodedTexts: []
};

function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    results.totalFiles++;
    
    // Check if file uses t() or useLanguage
    const usesTranslation = content.includes('t(') || content.includes('useLanguage');
    
    if (usesTranslation) {
      results.filesUsingT++;
    }
    
    // Check for hardcoded English text in JSX (simple regex)
    const hardcodedMatches = content.match(/>([A-Z][a-z]{3,}.*?)</g);
    
    if (hardcodedMatches && hardcodedMatches.length > 0 && !usesTranslation) {
      results.filesWithHardcoded++;
      results.hardcodedTexts.push({
        file: path.basename(filePath),
        count: hardcodedMatches.length
      });
    }
    
  } catch (error) {
    console.error(`Error checking ${filePath}:`, error.message);
  }
}

function scanDirectory(dir, extensions = ['.tsx']) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !['node_modules', 'build', 'dist'].includes(file)) {
      scanDirectory(fullPath, extensions);
    } else if (extensions.some(ext => file.endsWith(ext))) {
      checkFile(fullPath);
    }
  });
}

// Main execution
const componentsDir = path.join(__dirname, '../bulgarian-car-marketplace/src/components');
const pagesDir = path.join(__dirname, '../bulgarian-car-marketplace/src/pages');

console.log('🔍 Verifying Translation Coverage...\n');

console.log('📁 Scanning Components...');
scanDirectory(componentsDir);

console.log('📁 Scanning Pages...');
scanDirectory(pagesDir);

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 Translation Coverage Report:');
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`Total files scanned: ${results.totalFiles}`);
console.log(`Files using t(): ${results.filesUsingT} (${Math.round(results.filesUsingT/results.totalFiles*100)}%)`);
console.log(`Files with hardcoded text: ${results.filesWithHardcoded}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (results.hardcodedTexts.length > 0) {
  console.log('⚠️  Files needing attention:');
  results.hardcodedTexts.slice(0, 10).forEach(item => {
    console.log(`   - ${item.file} (${item.count} hardcoded texts)`);
  });
  if (results.hardcodedTexts.length > 10) {
    console.log(`   ... and ${results.hardcodedTexts.length - 10} more files\n`);
  }
}

console.log('✅ Verification complete!\n');
