/**
 * Fix Imports in 04_car-selling/sell/ folder
 * Changes ../../ to ../../../ for shared resources
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

const SELL_DIR = path.join(__dirname, '../src/pages/04_car-selling/sell');

async function fixImportsInFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    let changed = false;
    
    // Pattern: from '../../services' → from '../../../services'
    const patterns = [
      { old: /from ['"]\.\.\/\.\.\/services/g, new: "from '../../../services" },
      { old: /from ['"]\.\.\/\.\.\/contexts/g, new: "from '../../../contexts" },
      { old: /from ['"]\.\.\/\.\.\/components/g, new: "from '../../../components" },
      { old: /from ['"]\.\.\/\.\.\/utils/g, new: "from '../../../utils" },
      { old: /from ['"]\.\.\/\.\.\/types/g, new: "from '../../../types" },
      { old: /from ['"]\.\.\/\.\.\/hooks/g, new: "from '../../../hooks" },
      { old: /from ['"]\.\.\/\.\.\/data/g, new: "from '../../../data" },
      { old: /from ['"]\.\.\/\.\.\/firebase/g, new: "from '../../../firebase" },
      { old: /from ['"]\.\.\/\.\.\/constants/g, new: "from '../../../constants" },
    ];
    
    patterns.forEach(({ old, new: newPattern }) => {
      if (old.test(content)) {
        content = content.replace(old, newPattern);
        changed = true;
      }
    });
    
    if (changed) {
      await fs.writeFile(filePath, content, 'utf8');
      return { file: path.basename(filePath), fixed: true };
    }
    
    return { file: path.basename(filePath), fixed: false };
  } catch (error) {
    return { file: path.basename(filePath), error: error.message };
  }
}

async function fixAllSellImports() {
  console.log('🔧 Fixing imports in 04_car-selling/sell/...\n');
  
  const pattern = path.join(SELL_DIR, '**/*.{ts,tsx}');
  const files = glob.sync(pattern, { 
    ignore: ['**/*.test.ts', '**/*.test.tsx', '**/node_modules/**'] 
  });
  
  console.log(`Found ${files.length} files to process\n`);
  
  let totalFixed = 0;
  let totalErrors = 0;
  
  for (const file of files) {
    const result = await fixImportsInFile(file);
    
    if (result.error) {
      console.log(`❌ ERROR: ${result.file} - ${result.error}`);
      totalErrors++;
    } else if (result.fixed) {
      console.log(`✅ FIXED: ${result.file}`);
      totalFixed++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Files fixed: ${totalFixed}`);
  console.log(`❌ Errors: ${totalErrors}`);
  console.log('\n✨ Complete!');
}

// Execute
fixAllSellImports()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
