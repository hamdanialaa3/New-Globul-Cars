const fs = require('fs-extra');
const path = require('path');

console.log('\n🔧 Fix Sell Folder Imports\n');

const SELL_DIR = path.join(__dirname, '../src/pages/04_car-selling/sell');

async function fixFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    const original = content;
    
    // الملفات في: src/pages/04_car-selling/sell/SomeFile.tsx
    // العمق من src: pages -> 04_car-selling -> sell -> file (عمق 3)
    // لكن يجب أن تكون المسارات: ../../../ للوصول إلى src
    
    // لكن خطأ يقول "outside of src"، إذن المسار الحالي خطأ
    // دعني أصلح: ../../contexts/ → ../../../contexts/
    
    // في الواقع، لا! إذا كان الخطأ يقول "outside"، فالمسار الحالي أكثر من اللازم
    // src/pages/04_car-selling/sell/file.tsx
    // ../ → sell folder up → 04_car-selling
    // ../../ → 04_car-selling up → pages  
    // ../../../ → pages up → src ✅
    
    // يبدو أن هذا صحيح! لكن الخطأ يقول ../../contexts/AuthProvider
    // دعني أصلح ../../ → ../../../
    
    const fixes = [
      { pattern: /from ['"]\.\.\/\.\.\/contexts\//g, replacement: "from '../../../contexts/" },
      { pattern: /from ['"]\.\.\/\.\.\/hooks\//g, replacement: "from '../../../hooks/" },
      { pattern: /from ['"]\.\.\/\.\.\/services\//g, replacement: "from '../../../services/" },
      { pattern: /from ['"]\.\.\/\.\.\/firebase\//g, replacement: "from '../../../firebase/" },
      { pattern: /from ['"]\.\.\/\.\.\/components\//g, replacement: "from '../../../components/" },
      { pattern: /from ['"]\.\.\/\.\.\/types\//g, replacement: "from '../../../types/" },
      { pattern: /from ['"]\.\.\/\.\.\/utils\//g, replacement: "from '../../../utils/" },
      { pattern: /from ['"]\.\.\/\.\.\/constants\//g, replacement: "from '../../../constants/" },
      { pattern: /from ['"]\.\.\/\.\.\/data\//g, replacement: "from '../../../data/" },
    ];
    
    for (const { pattern, replacement } of fixes) {
      if (content.match(pattern)) {
        content = content.replace(pattern, replacement);
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
  
  if (!await fs.pathExists(dir)) {
    return files;
  }
  
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
    
    console.log(`📁 Found ${files.length} files in sell folder\n`);
    
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

