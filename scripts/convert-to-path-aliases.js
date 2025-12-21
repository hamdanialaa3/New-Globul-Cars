const fs = require('fs-extra');
const path = require('path');

console.log('\n🔧 Convert to Path Aliases (@/)\n');

const PAGES_DIR = path.join(__dirname, '../src/pages');

async function fixFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    const original = content;
    
    // Convert: ../../../../contexts/ → @/contexts/
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/contexts\//g, "from '@/contexts/");
    // Convert: ../../../../hooks/ → @/hooks/
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/hooks\//g, "from '@/hooks/");
    // Convert: ../../../../services/ → @/services/
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/services\//g, "from '@/services/");
    // Convert: ../../../../firebase/ → @/firebase/
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/firebase\//g, "from '@/firebase/");
    // Convert: ../../../../components/ → @/components/
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/components\//g, "from '@/components/");
    // Convert: ../../../../types/ → @/types/
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/types\//g, "from '@/types/");
    // Convert: ../../../../utils/ → @/utils/
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/utils\//g, "from '@/utils/");
    
    // Also convert ../../../ to @/ for some cases
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/contexts\//g, "from '@/contexts/");
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/hooks\//g, "from '@/hooks/");
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/services\//g, "from '@/services/");
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/firebase\//g, "from '@/firebase/");
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/components\//g, "from '@/components/");
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/types\//g, "from '@/types/");
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/data\//g, "from '@/data/");
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/constants\//g, "from '@/constants/");
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/utils\//g, "from '@/utils/");
    
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

