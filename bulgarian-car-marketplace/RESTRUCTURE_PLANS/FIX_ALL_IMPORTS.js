/**
 * Fix All Imports After Restructure
 * Updates relative imports from '../' to '../../' for all relocated files
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

const PAGES_DIR = path.join(__dirname, '../src/pages');

// Folders that need import fixes (files moved from root to subfolders)
const FOLDERS_TO_FIX = [
  '01_main-pages',
  '04_car-selling',
  '06_admin',
  '07_advanced-features',
  '08_payment-billing',
  '09_dealer-company',
  '11_testing-dev'
];

async function fixImportsInFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    let changed = false;
    
    // Pattern 1: from '../services' → from '../../services'
    // Pattern 2: from '../contexts' → from '../../contexts'
    // Pattern 3: from '../components' → from '../../components'
    // Pattern 4: from '../utils' → from '../../utils'
    // Pattern 5: from '../types' → from '../../types'
    // Pattern 6: from '../hooks' → from '../../hooks'
    // Pattern 7: from '../data' → from '../../data'
    // Pattern 8: from '../firebase' → from '../../firebase'
    // Pattern 9: from '../constants' → from '../../constants'
    
    const patterns = [
      { old: /from ['"]\.\.\/services/g, new: "from '../../services" },
      { old: /from ['"]\.\.\/contexts/g, new: "from '../../contexts" },
      { old: /from ['"]\.\.\/components/g, new: "from '../../components" },
      { old: /from ['"]\.\.\/utils/g, new: "from '../../utils" },
      { old: /from ['"]\.\.\/types/g, new: "from '../../types" },
      { old: /from ['"]\.\.\/hooks/g, new: "from '../../hooks" },
      { old: /from ['"]\.\.\/data/g, new: "from '../../data" },
      { old: /from ['"]\.\.\/firebase/g, new: "from '../../firebase" },
      { old: /from ['"]\.\.\/constants/g, new: "from '../../constants" },
      { old: /from ['"]\.\.\/repositories/g, new: "from '../../repositories" },
    ];
    
    patterns.forEach(({ old, new: newPattern }) => {
      if (old.test(content)) {
        content = content.replace(old, newPattern);
        changed = true;
      }
    });
    
    if (changed) {
      await fs.writeFile(filePath, content, 'utf8');
      return { file: filePath, fixed: true };
    }
    
    return { file: filePath, fixed: false };
  } catch (error) {
    return { file: filePath, error: error.message };
  }
}

async function fixAllImports() {
  console.log('🔧 Fixing imports in relocated files...\n');
  
  let totalFixed = 0;
  let totalErrors = 0;
  
  for (const folder of FOLDERS_TO_FIX) {
    const folderPath = path.join(PAGES_DIR, folder);
    
    if (!await fs.pathExists(folderPath)) {
      console.log(`⏭️  SKIP: ${folder} (doesn't exist)`);
      continue;
    }
    
    console.log(`📁 Processing: ${folder}/`);
    
    // Find all .tsx and .ts files (excluding .test.ts files)
    const pattern = path.join(folderPath, '**/*.{ts,tsx}');
    const files = glob.sync(pattern, { 
      ignore: ['**/*.test.ts', '**/*.test.tsx', '**/node_modules/**'] 
    });
    
    let folderFixed = 0;
    for (const file of files) {
      const result = await fixImportsInFile(file);
      
      if (result.error) {
        console.log(`   ❌ ERROR: ${path.relative(PAGES_DIR, file)} - ${result.error}`);
        totalErrors++;
      } else if (result.fixed) {
        console.log(`   ✅ FIXED: ${path.relative(PAGES_DIR, file)}`);
        folderFixed++;
        totalFixed++;
      }
    }
    
    if (folderFixed === 0) {
      console.log(`   ℹ️  No imports needed fixing`);
    }
    console.log('');
  }
  
  console.log('='.repeat(60));
  console.log('📊 IMPORT FIX SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Files fixed: ${totalFixed}`);
  console.log(`❌ Errors: ${totalErrors}`);
  console.log('\n✨ Import fixes complete!');
}

// Execute
fixAllImports()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
