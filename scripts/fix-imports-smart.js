const fs = require('fs-extra');
const path = require('path');

console.log('\n🔧 Smart Import Fixer - Calculate actual depth\n');

const PAGES_DIR = path.join(__dirname, '../src/pages');
const SRC_DIR = path.join(__dirname, '../src');

async function fixFileImports(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    let changed = false;
    
    // حساب العمق الفعلي من src/ إلى الملف
    const relativePath = path.relative(SRC_DIR, filePath);
    const depth = relativePath.split(path.sep).length - 1; // -1 لأن الملف نفسه لا يُحسب
    
    // المسار الصحيح حسب العمق
    const correctPrefix = '../'.repeat(depth);
    
    // إصلاح imports للـ hooks, contexts, services, utils, firebase
    const patterns = [
      { target: 'hooks/', wrongPatterns: [/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\./g, /from ['"]\.\.\/\.\.\/\.\.\/\.\./g, /from ['"]\.\.\/\.\./g, /from ['"]\.\./g] },
      { target: 'contexts/', wrongPatterns: [/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\./g, /from ['"]\.\.\/\.\.\/\.\.\/\.\./g, /from ['"]\.\.\/\.\./g, /from ['"]\.\./g] },
      { target: 'services/', wrongPatterns: [/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\./g, /from ['"]\.\.\/\.\.\/\.\.\/\.\./g, /from ['"]\.\.\/\.\./g, /from ['"]\.\./g] },
      { target: 'utils/', wrongPatterns: [/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\./g, /from ['"]\.\.\/\.\.\/\.\.\/\.\./g, /from ['"]\.\.\/\.\./g, /from ['"]\.\./g] },
      { target: 'firebase/', wrongPatterns: [/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\./g, /from ['"]\.\.\/\.\.\/\.\.\/\.\./g, /from ['"]\.\.\/\.\./g, /from ['"]\.\./g] },
    ];
    
    for (const { target, wrongPatterns } of patterns) {
      for (const pattern of wrongPatterns) {
        const matches = content.match(new RegExp(`${pattern.source}${target}`, 'g'));
        if (matches) {
          const correctImport = `from '${correctPrefix}${target}`;
          content = content.replace(new RegExp(`${pattern.source}${target}`, 'g'), correctImport);
          changed = true;
        }
      }
    }
    
    if (changed) {
      await fs.writeFile(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

async function main() {
  try {
    const sections = [
      '01_main-pages',
      '02_authentication',
      '03_user-pages',
      '05_search-browse',
      '06_admin',
      '10_legal'
    ];
    
    let fixed = 0;
    let total = 0;
    
    for (const section of sections) {
      const sectionPath = path.join(PAGES_DIR, section);
      if (!await fs.pathExists(sectionPath)) continue;
      
      const files = await getAllFiles(sectionPath);
      
      for (const file of files) {
        if (file.endsWith('.tsx') || file.endsWith('.ts')) {
          total++;
          const wasFixed = await fixFileImports(file);
          if (wasFixed) {
            const shortPath = path.relative(PAGES_DIR, file);
            console.log(`✅ ${shortPath}`);
            fixed++;
          }
        }
      }
    }
    
    console.log(`\n📊 Results: ${fixed}/${total} files fixed\n`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

async function getAllFiles(dir) {
  const files = [];
  const items = await fs.readdir(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...await getAllFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  
  return files;
}

main();

