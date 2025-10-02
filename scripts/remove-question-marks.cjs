// scripts/remove-question-marks.cjs
// Remove lines with only question marks (converted Arabic text)

const fs = require('fs');
const path = require('path');

function cleanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    const lines = content.split('\n');
    const cleanedLines = lines.map(line => {
      // Remove comment lines that are only question marks
      if (line.trim().match(/^\/\/\s*\?+\s*$/)) {
        modified = true;
        return '';
      }
      
      // Fix console.log with question marks
      if (line.includes('console.log') && line.includes('???')) {
        modified = true;
        return line.replace(/console\.log\('.*\?+.*'\)/, "console.log('[LOG] Message removed - was in Arabic')");
      }
      
      // Fix console.error with question marks
      if (line.includes('console.error') && line.includes('???')) {
        modified = true;
        return line.replace(/console\.error\('.*\?+.*'.*\)/, "console.error('[ERROR] Message removed - was in Arabic')");
      }
      
      return line;
    });
    
    if (modified) {
      // Remove consecutive empty lines
      const finalLines = cleanedLines.filter((line, index, arr) => {
        if (line.trim() === '') {
          return index === 0 || arr[index - 1].trim() !== '';
        }
        return true;
      });
      
      fs.writeFileSync(filePath, finalLines.join('\n'), 'utf8');
      console.log(`✅ Cleaned: ${path.basename(filePath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error: ${path.basename(filePath)}`, error.message);
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

console.log('🧹 Removing converted Arabic text (???)...\n');

const { filesProcessed, filesModified } = scanDirectory(srcDir);

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`✅ Complete!`);
console.log(`📊 Processed: ${filesProcessed}`);
console.log(`🔧 Modified: ${filesModified}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
