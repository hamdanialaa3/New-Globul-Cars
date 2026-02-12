const fs = require('fs-extra');
const path = require('path');

console.log('\n🔧 Fix ALL to 3 dots maximum\n');

const PAGES_DIR = path.join(__dirname, '../src/pages');

async function fixFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    const original = content;
    
    // Fix: ../../../../ → ../../../
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/\.\.\//g, "from '../../../");
    
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
    const allFiles = await getAllFiles(PAGES_DIR);
    let fixed = 0;
    
    for (const file of allFiles) {
      const wasFixed = await fixFile(file);
      if (wasFixed) {
        const shortPath = path.relative(PAGES_DIR, file);
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

