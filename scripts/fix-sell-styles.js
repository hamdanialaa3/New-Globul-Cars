const fs = require('fs-extra');
const path = require('path');

console.log('\n🔧 Fix Sell Folder Styles\n');

const SELL_DIR = path.join(__dirname, '../src/pages/04_car-selling/sell');

async function fixFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    const original = content;
    
    // Fix: ../../styles/ → @/styles/
    content = content.replace(/from ['"]\.\.\/\.\.\/styles\//g, "from '@/styles/");
    // Fix: ../../assets/ → @/assets/
    content = content.replace(/from ['"]\.\.\/\.\.\/assets\//g, "from '@/assets/");
    
    if (content !== original) {
      await fs.writeFile(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    return false;
  }
}

async function getAllFiles(dir) {
  const files = [];
  const items = await fs.readdir(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...await getAllFiles(fullPath));
    } else if (item.name.endsWith('.tsx') || item.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

async function main() {
  try {
    const files = await getAllFiles(SELL_DIR);
    let fixed = 0;
    
    for (const file of files) {
      const wasFixed = await fixFile(file);
      if (wasFixed) {
        const shortPath = path.relative(SELL_DIR, file);
        console.log(`✅ ${shortPath}`);
        fixed++;
      }
    }
    
    console.log(`\n📊 Total fixed: ${fixed} files\n`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();

