const fs = require('fs-extra');
const path = require('path');

console.log('\n🔧 Fix Section Root Files - Correct Depth\n');

const PAGES_DIR = path.join(__dirname, '../src/pages');

// الأقسام التي ملفاتها في الجذر (ليس في مجلدات فرعية)
const sections = [
  '07_advanced-features',
  '08_payment-billing',
  '09_dealer-company',
  '11_testing-dev'
];

async function fixFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    const original = content;
    
    // هذه الملفات في عمق 2 من src/ (pages/section/file.tsx)
    // لذا يحتاجون ../../ وليس ../../../
    
    // Fix: ../../../hooks/ → ../../hooks/
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/hooks\//g, "from '../../hooks/");
    // Fix: ../../../contexts/ → ../../contexts/
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/contexts\//g, "from '../../contexts/");
    // Fix: ../../../services/ → ../../services/
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/services\//g, "from '../../services/");
    // Fix: ../../../firebase/ → ../../firebase/
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/firebase\//g, "from '../../firebase/");
    // Fix: ../../../components/ → ../../components/
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/components\//g, "from '../../components/");
    // Fix: ../../../types/ → ../../types/
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/types\//g, "from '../../types/");
    // Fix: ../../../utils/ → ../../utils/
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/utils\//g, "from '../../utils/");
    // Fix: ../../../constants/ → ../../constants/
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/constants\//g, "from '../../constants/");
    // Fix: ../../../data/ → ../../data/
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/data\//g, "from '../../data/");
    // Fix: ../../../features/ → ../../features/
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/features\//g, "from '../../features/");
    // Fix: ../../../styles/ → ../../styles/
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/styles\//g, "from '../../styles/");
    // Fix: ../../../repositories/ → ../../repositories/
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/repositories\//g, "from '../../repositories/");
    
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
    let totalFixed = 0;
    
    for (const section of sections) {
      const sectionPath = path.join(PAGES_DIR, section);
      console.log(`\n📂 Section: ${section}`);
      
      const files = await getAllFiles(sectionPath);
      let sectionFixed = 0;
      
      for (const file of files) {
        const wasFixed = await fixFile(file);
        if (wasFixed) {
          const shortPath = path.relative(PAGES_DIR, file);
          console.log(`   ✅ ${shortPath}`);
          sectionFixed++;
          totalFixed++;
        }
      }
      
      if (sectionFixed === 0) {
        console.log(`   ⏭️  No files needed fixing`);
      }
    }
    
    console.log(`\n📊 Total fixed: ${totalFixed} files\n`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();

