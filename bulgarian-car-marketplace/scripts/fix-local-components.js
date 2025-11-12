const fs = require('fs-extra');
const path = require('path');

console.log('\n🔧 Fix Local Components Imports\n');

const PAGES_DIR = path.join(__dirname, '../src/pages');

// Files that need fixing: 02_authentication/login/LoginPage and register/RegisterPage
const filesToFix = [
  '02_authentication/login/LoginPage/LoginPageGlassFixed.tsx',
  '02_authentication/login/LoginPage/index.tsx',
  '02_authentication/register/RegisterPage/RegisterPageGlassFixed.tsx',
  '02_authentication/register/RegisterPage/RegisterPageGlass.tsx',
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
    
    // Fix: ../../components/ → ../../../../components/
    // Because file is now in pages/02_authentication/login/LoginPage/
    // instead of pages/LoginPage/
    content = content.replace(/from ['"]\.\.\/\.\.\/components\//g, "from '../../../../components/");
    
    if (content !== original) {
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`✅ ${relPath}`);
      return true;
    }
    
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

