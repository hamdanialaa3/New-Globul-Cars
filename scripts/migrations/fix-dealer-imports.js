const fs = require('fs-extra');
const path = require('path');

console.log('\n🔧 Fix Dealer Company Imports\n');

const files = [
  'src/pages/09_dealer-company/DealerRegistrationPage.tsx',
  'src/pages/09_dealer-company/DealerDashboardPage.tsx',
  'src/pages/09_dealer-company/DealerPublicPage/index.tsx',
  'src/pages/09_dealer-company/DealerPublicPage/ContactForm.tsx',
];

async function fixFile(relPath) {
  try {
    const filePath = path.join(__dirname, '..', relPath);
    if (!await fs.pathExists(filePath)) {
      console.log(`⏭️  ${relPath} (not found)`);
      return false;
    }
    
    let content = await fs.readFile(filePath, 'utf8');
    const original = content;
    
    // Fix: ../hooks/ → ../../../hooks/
    content = content.replace(/from ['"]\.\.\/hooks\//g, "from '../../../hooks/");
    // Fix: ../contexts/ → ../../../contexts/
    content = content.replace(/from ['"]\.\.\/contexts\//g, "from '../../../contexts/");
    // Fix: ../services/ → ../../../services/
    content = content.replace(/from ['"]\.\.\/services\//g, "from '../../../services/");
    // Fix: ../firebase/ → ../../../firebase/
    content = content.replace(/from ['"]\.\.\/firebase\//g, "from '../../../firebase/");
    // Fix: ../components/ → ../../../components/
    content = content.replace(/from ['"]\.\.\/components\//g, "from '../../../components/");
    // Fix: ../types/ → ../../../types/
    content = content.replace(/from ['"]\.\.\/types\//g, "from '../../../types/");
    
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
    
    for (const file of files) {
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

