const fs = require('fs-extra');
const path = require('path');

console.log('\n🔧 Fix ALL Page-Level Imports\n');

const PAGES_DIR = path.join(__dirname, '../src/pages');
const SRC_DIR = path.join(__dirname, '../src');

async function fixAllImports(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    const original = content;
    
    // حساب العمق من src/
    const relativePath = path.relative(SRC_DIR, filePath);
    const depth = relativePath.split(path.sep).length - 1;
    const correctPrefix = '../'.repeat(depth);
    
    // Fix: ../components/ → correct depth
    content = content.replace(/from ['"]\.\.\/components\//g, `from '${correctPrefix}components/`);
    content = content.replace(/from ['"]\.\.\/\.\.\/components\//g, `from '${correctPrefix}components/`);
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/components\//g, `from '${correctPrefix}components/`);
    
    // Fix: ../pages/ references
    content = content.replace(/from ['"]\.\.\/pages\//g, `from '${correctPrefix}pages/`);
    
    // Fix: ../features/ references  
    content = content.replace(/from ['"]\.\.\/features\//g, `from '${correctPrefix}features/`);
    content = content.replace(/from ['"]\.\.\/\.\.\/features\//g, `from '${correctPrefix}features/`);
    
    // Fix: ../styles/ references
    content = content.replace(/from ['"]\.\.\/styles\//g, `from '${correctPrefix}styles/`);
    content = content.replace(/from ['"]\.\.\/\.\.\/styles\//g, `from '${correctPrefix}styles/`);
    
    // Fix: ../assets/ references
    content = content.replace(/from ['"]\.\.\/assets\//g, `from '${correctPrefix}assets/`);
    content = content.replace(/from ['"]\.\.\/\.\.\/assets\//g, `from '${correctPrefix}assets/`);
    
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
      const wasFixed = await fixAllImports(file);
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

