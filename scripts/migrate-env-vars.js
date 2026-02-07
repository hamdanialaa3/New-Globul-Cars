/**
 * CRA → Vite Environment Variable Migration Script
 * Converts process.env.REACT_APP_* → import.meta.env.VITE_*
 * 
 * Usage: node scripts/migrate-env-vars.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript/JavaScript files in src/
const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', {
  cwd: path.resolve(__dirname, '..'),
  absolute: true,
  ignore: ['**/node_modules/**', '**/build/**', '**/*.test.ts', '**/*.test.tsx']
});

console.log(`Found ${files.length} files to process...\n`);

let totalReplacements = 0;
let filesModified = 0;

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let fileReplacements = 0;

  // Pattern 1: process.env.REACT_APP_XXX → import.meta.env.VITE_XXX
  const regex1 = /process\.env\.REACT_APP_([A-Z_0-9]+)/g;
  const matches1 = content.match(regex1);
  
  if (matches1) {
    content = content.replace(regex1, (match, varName) => {
      fileReplacements++;
      return `import.meta.env.VITE_${varName}`;
    });
    modified = true;
  }

  // Pattern 2: !!process.env.REACT_APP_XXX → !!import.meta.env.VITE_XXX
  const regex2 = /!!process\.env\.REACT_APP_([A-Z_0-9]+)/g;
  const matches2 = content.match(regex2);
  
  if (matches2) {
    content = content.replace(regex2, (match, varName) => {
      fileReplacements++;
      return `!!import.meta.env.VITE_${varName}`;
    });
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesModified++;
    totalReplacements += fileReplacements;
    console.log(`✅ ${path.relative(process.cwd(), filePath)} (${fileReplacements} replacements)`);
  }
});

console.log(`\n📊 Migration Summary:`);
console.log(`   Files modified: ${filesModified}`);
console.log(`   Total replacements: ${totalReplacements}`);
console.log(`\n✅ Environment variable migration complete!`);
console.log(`\n⚠️  Next steps:`);
console.log(`   1. Update .env files (REACT_APP_ → VITE_)`);
console.log(`   2. Update .env.local (REACT_APP_ → VITE_)`);
console.log(`   3. Update .env.example (REACT_APP_ → VITE_)`);
console.log(`   4. Test with: npm start`);
console.log(`   5. Build with: npm run build`);
