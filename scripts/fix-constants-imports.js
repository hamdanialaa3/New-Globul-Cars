const fs = require('fs-extra');
const path = require('path');

console.log('\n🔧 Fix Constants Imports Manually\n');

const PAGES_DIR = path.join(__dirname, '../src/pages');

const filesToFix = [
  '01_main-pages/home/HomePage/CityCarsSection/BulgariaMap.tsx',
  '01_main-pages/home/HomePage/CityCarsSection/CityGrid.tsx',
  '01_main-pages/home/HomePage/CityCarsSection/GoogleMapSection.tsx',
  '01_main-pages/home/HomePage/CityCarsSection/InteractiveBulgariaMap.tsx',
  '01_main-pages/home/HomePage/CityCarsSection/index.tsx',
];

async function fixFile(relPath) {
  try {
    const filePath = path.join(PAGES_DIR, relPath);
    if (!await fs.pathExists(filePath)) {
      console.log(`⏭️  ${relPath} (not found)`);
      return false;
    }
    
    let content = await fs.readFile(filePath, 'utf8');
    const original = content;
    
    // Replace: ../../../constants/ → ../../../../../constants/
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/constants\//g, "from '../../../../../constants/");
    
    if (content !== original) {
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`✅ ${relPath}`);
      return true;
    }
    
    console.log(`⏭️  ${relPath} (no change needed)`);
    return false;
  } catch (error) {
    console.error(`❌ ${relPath}: ${error.message}`);
    return false;
  }
}

async function main() {
  try {
    let fixed = 0;
    
    for (const file of filesToFix) {
      const wasFixed = await fixFile(file);
      if (wasFixed) fixed++;
    }
    
    console.log(`\n📊 Total fixed: ${fixed} files\n`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();

