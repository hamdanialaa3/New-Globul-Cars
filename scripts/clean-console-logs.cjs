// scripts/clean-console-logs.cjs
// Professional Console Cleanup for Production Services

const fs = require('fs');
const path = require('path');

let stats = {
  filesProcessed: 0,
  filesModified: 0,
  consoleLogsRemoved: 0,
  consoleErrorsConverted: 0
};

function cleanServiceFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    const originalContent = content;
    
    // Remove console.log statements (except production errors)
    content = content.replace(/\s*console\.log\([^)]*\);?\s*/g, (match) => {
      if (!match.includes('error') && !match.includes('warn')) {
        stats.consoleLogsRemoved++;
        modified = true;
        return '\n';
      }
      return match;
    });
    
    // Convert console.error to proper logging format
    content = content.replace(/console\.error\('([^']*)'([^)]*)\);/g, (match, msg, rest) => {
      stats.consoleErrorsConverted++;
      modified = true;
      // Remove Arabic/Bulgarian text, keep only English
      const cleanMsg = msg.replace(/[^\x00-\x7F]/g, '').trim() || 'Error occurred';
      return `console.error('[SERVICE] ${cleanMsg}'${rest});`;
    });
    
    // Clean up multiple empty lines
    content = content.replace(/\n\n\n+/g, '\n\n');
    
    if (modified && content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      stats.filesModified++;
      console.log(`✅ Cleaned: ${path.basename(filePath)}`);
      return true;
    }
    
    stats.filesProcessed++;
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function scanServicesDirectory(servicesDir) {
  const files = fs.readdirSync(servicesDir);
  
  files.forEach(file => {
    const fullPath = path.join(servicesDir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
      cleanServiceFile(fullPath);
    }
  });
}

// Main execution
const servicesDir = path.join(__dirname, '../bulgarian-car-marketplace/src/services');

console.log('🧹 Cleaning Services Files...\n');
console.log(`📁 Target: ${servicesDir}\n`);

scanServicesDirectory(servicesDir);

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ Services Cleanup Complete!');
console.log(`📊 Files processed: ${stats.filesProcessed + stats.filesModified}`);
console.log(`🔧 Files modified: ${stats.filesModified}`);
console.log(`🗑️  console.log removed: ${stats.consoleLogsRemoved}`);
console.log(`🔄 console.error converted: ${stats.consoleErrorsConverted}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('✨ Services are now production-ready!');
