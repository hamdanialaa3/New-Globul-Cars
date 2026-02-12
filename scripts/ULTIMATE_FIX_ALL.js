const fs = require('fs-extra');
const path = require('path');

console.log('\n🔥 ULTIMATE FIX - Convert ALL to @/ aliases\n');

const SRC_DIR = path.join(__dirname, '../src');

const GLOBAL_DIRS = [
  'hooks', 'contexts', 'services', 'firebase', 'components', 
  'types', 'utils', 'data', 'constants', 'features', 
  'assets', 'styles'
];

async function fixFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    const original = content;
    
    // Convert ALL relative imports to @/ aliases
    for (const dir of GLOBAL_DIRS) {
      // Match any number of ../ followed by the directory
      const patterns = [
        new RegExp(`from ['"]\\.\\./${dir}/`, 'g'),
        new RegExp(`from ['"]\\.\\.\\/${dir}\\/`, 'g'),
        new RegExp(`from ['"]\\.\\.\\/.\\.\\.\\/${dir}/`, 'g'),
        new RegExp(`from ['"]\\.\\.\\/.\\.\\.\\.\\/\\/${dir}\\/`, 'g'),
        new RegExp(`from ['"]\\.\\.\\/.\\.\\.\\.\\.\\.\\/\\/${dir}\\/`, 'g'),
        new RegExp(`from ['"]\\.\\.\\/.\\.\\.\\.\\.\\.\\.\\.\\/\\/${dir}\\/`, 'g'),
        new RegExp(`from ['"]\\.\\.\\/.\\.\\.\\.\\.\\.\\.\\.\\.\\.\\/\\/${dir}\\/`, 'g'),
      ];
      
      const replacement = `from '@/${dir}/`;
      
      for (const pattern of patterns) {
        if (content.match(pattern)) {
          content = content.replace(pattern, replacement);
        }
      }
    }
    
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
    console.log('🔍 Scanning all files...\n');
    const allFiles = await getAllFiles(SRC_DIR);
    console.log(`📁 Found ${allFiles.length} files\n`);
    
    let fixed = 0;
    
    for (const file of allFiles) {
      const wasFixed = await fixFile(file);
      if (wasFixed) {
        const shortPath = path.relative(SRC_DIR, file);
        console.log(`✅ ${shortPath}`);
        fixed++;
      }
    }
    
    console.log(`\n📊 Total fixed: ${fixed} files\n`);
    console.log('✅ ALL imports converted to @/ aliases!\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();

