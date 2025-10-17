const fs = require('fs');
const path = require('path');

// Function to fix translation calls in a file
function fixTranslationCalls(filename) {
  const filePath = path.join(__dirname, 'src', 'components', filename);
  if (!fs.existsSync(filePath)) {
    console.log(`File ${filename} not found, skipping...`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace all instances of t('key', 'fallback') with t('key')
  content = content.replace(/t\('([^']+)',\s*'[^']*'\)/g, "t('$1')");
  
  // Also replace template literals
  content = content.replace(/t\('([^']+)',\s*`[^`]*`\)/g, "t('$1')");
  
  fs.writeFileSync(filePath, content, 'utf8');
  
  console.log(`Fixed all translation calls in ${filename}`);
}

// Fix multiple files
const filesToFix = [
  'AdvancedFilterSystemMobile.tsx',
  'SearchResults.tsx'
];

filesToFix.forEach(fixTranslationCalls);