// scripts/clean-arabic-comments.cjs
// Automated Script to Clean Arabic Comments from Codebase

const fs = require('fs');
const path = require('path');

const arabicRegex = /[\u0600-\u06FF]/g;

function cleanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Replace Arabic comments with English placeholders
    const lines = content.split('\n');
    const cleanedLines = lines.map(line => {
      if (arabicRegex.test(line)) {
        // If it's a comment line
        if (line.trim().startsWith('//')) {
          modified = true;
          return line.replace(arabicRegex, '?').replace(/\/\/\s*\?+.*/, '// (Comment removed - was in Arabic)');
        }
        // If it's a JSDoc comment
        if (line.includes('/**') || line.includes('*') || line.includes('*/')) {
          modified = true;
          return line.replace(arabicRegex, '?').replace(/\*\s*\?+.*/, '* (Comment removed - was in Arabic)');
        }
      }
      return line;
    });
    
    if (modified) {
      fs.writeFileSync(filePath, cleanedLines.join('\n'), 'utf8');
      console.log(`✅ Cleaned: ${path.basename(filePath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error cleaning ${filePath}:`, error.message);
    return false;
  }
}

function scanDirectory(dir) {
  let filesProcessed = 0;
  let filesModified = 0;
  
  function scan(currentDir) {
    const files = fs.readdirSync(currentDir);
    
    files.forEach(file => {
      const fullPath = path.join(currentDir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!['node_modules', 'build', 'dist', '.git'].includes(file)) {
          scan(fullPath);
        }
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        filesProcessed++;
        if (cleanFile(fullPath)) {
          filesModified++;
        }
      }
    });
  }
  
  scan(dir);
  return { filesProcessed, filesModified };
}

// Main execution
const srcDir = path.join(__dirname, '../bulgarian-car-marketplace/src');

console.log('🧹 Starting Arabic comment cleanup...\n');
console.log(`📁 Scanning: ${srcDir}\n`);

const { filesProcessed, filesModified } = scanDirectory(srcDir);

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`✅ Cleanup complete!`);
console.log(`📊 Files processed: ${filesProcessed}`);
console.log(`🔧 Files modified: ${filesModified}`);
console.log(`✨ Files unchanged: ${filesProcessed - filesModified}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (filesModified > 0) {
  console.log('⚠️  Please review the changes and update comments with proper English descriptions.');
  console.log('📝 Next step: Manually review and improve placeholder comments.');
}
