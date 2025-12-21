const fs = require('fs-extra');
const path = require('path');

console.log('\n🔧 Fix ALL Remaining Sections\n');

const PAGES_DIR = path.join(__dirname, '../src/pages');

// جميع الأقسام التي نريد إصلاحها
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
    
    // Fix all possible import patterns to correct depth
    // Files in section root (e.g., 08_payment-billing/CheckoutPage.tsx) need ../../
    const fixes = [
      { pattern: /from ['"]\.\.\/hooks\//g, replacement: "from '../../hooks/" },
      { pattern: /from ['"]\.\.\/contexts\//g, replacement: "from '../../contexts/" },
      { pattern: /from ['"]\.\.\/services\//g, replacement: "from '../../services/" },
      { pattern: /from ['"]\.\.\/firebase\//g, replacement: "from '../../firebase/" },
      { pattern: /from ['"]\.\.\/components\//g, replacement: "from '../../components/" },
      { pattern: /from ['"]\.\.\/types\//g, replacement: "from '../../types/" },
      { pattern: /from ['"]\.\.\/utils\//g, replacement: "from '../../utils/" },
      { pattern: /from ['"]\.\.\/constants\//g, replacement: "from '../../constants/" },
      { pattern: /from ['"]\.\.\/data\//g, replacement: "from '../../data/" },
      { pattern: /from ['"]\.\.\/features\//g, replacement: "from '../../features/" },
      { pattern: /from ['"]\.\.\/styles\//g, replacement: "from '../../styles/" },
      { pattern: /from ['"]\.\.\/repositories\//g, replacement: "from '../../repositories/" },
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

