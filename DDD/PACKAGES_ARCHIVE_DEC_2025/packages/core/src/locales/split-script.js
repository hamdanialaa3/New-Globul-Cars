// Professional Translation Splitter - Node.js
// Splits translations.ts into modular BG/EN structure

const fs = require('fs');
const path = require('path');

console.log('🚀 Professional Translation Split - Starting...\n');

// Read original file
const originalPath = './translations.ts';
const content = fs.readFileSync(originalPath, 'utf8');

console.log('✅ Loaded translations.ts\n');

// Extract BG section - uses 2-space indentation
const bgPattern = /bg: \{([\s\S]*?)\n  \},\n  en: \{/;
const bgMatch = content.match(bgPattern);

if (!bgMatch) {
  console.error('❌ Failed to extract BG section');
  console.error('Trying to find markers...');
  console.log('bg: { found at:', content.indexOf('bg: {'));
  console.log('en: { found at:', content.indexOf('en: {'));
  process.exit(1);
}

const bgContent = bgMatch[1];

// Extract EN section  
const enPattern = /en: \{([\s\S]*?)(?:\n  \},\n  ar: \{|\n\} as const;)/;
const enMatch = content.match(enPattern);

if (!enMatch) {
  console.error('❌ Failed to extract EN section');
  process.exit(1);
}

const enContent = enMatch[1];

console.log('✅ Extracted BG and EN sections\n');

// Define sections to extract
const sections = [
  'home', 'cars', 'sell', 'nav', 'profileTypes', 'profile',
  'languages', 'topBrands', 'footer', 'contact', 'carSearch',
  'searchResults', 'advancedSearch', 'messaging', 'dashboard',
  'notifications', 'social', 'fullThemeDemo', 'ratingSystem',
  'auth', 'errors', 'common', 'emailVerification', 'search',
  'header', 'settings', 'feed', 'help', 'bodyTypes'
];

// Function to extract a top-level section
function extractSection(content, sectionName) {
  const regex = new RegExp(`^\\s{4}${sectionName}:\\s*\\{([\\s\\S]*?)^\\s{4}\\},?$`, 'm');
  const match = content.match(regex);
  
  if (!match) {
    // Try alternative pattern for nested sections
    const lines = content.split('\n');
    let inSection = false;
    let braceCount = 0;
    let sectionLines = [];
    
    for (const line of lines) {
      if (line.match(new RegExp(`^\\s{4}${sectionName}:\\s*\\{`))) {
        inSection = true;
        braceCount = 0;
        continue; // Skip the opening line
      }
      
      if (inSection) {
        // Count braces
        const openBraces = (line.match(/\{/g) || []).length;
        const closeBraces = (line.match(/\}/g) || []).length;
        braceCount += openBraces - closeBraces;
        
        // Check if we've closed the section
        if (braceCount === -1 && line.match(/^\s{4}\},?$/)) {
          break;
        }
        
        sectionLines.push(line);
      }
    }
    
    return sectionLines.length > 0 ? sectionLines.join('\n') : null;
  }
  
  return match[1];
}

// Create directories
['bg', 'en'].forEach(lang => {
  const dir = path.join(__dirname, lang);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

console.log('✅ Created bg/ and en/ directories\n');
console.log('📦 Extracting sections...\n');

let successCount = 0;
let failedSections = [];

sections.forEach((section, index) => {
  const percent = Math.round(((index + 1) / sections.length) * 100);
  process.stdout.write(`[${index + 1}/${sections.length}] Processing '${section}'... (${percent}%) `);
  
  try {
    const bgSection = extractSection(bgContent, section);
    const enSection = extractSection(enContent, section);
    
    if (!bgSection || !enSection) {
      console.log('⚠️  SKIPPED (not found)');
      failedSections.push(section);
      return;
    }
    
    // Create BG file
    const bgFile = `// Bulgarian translations for ${section}\nexport const ${section} = {\n${bgSection}\n} as const;\n`;
    fs.writeFileSync(path.join(__dirname, 'bg', `${section}.ts`), bgFile, 'utf8');
    
    // Create EN file
    const enFile = `// English translations for ${section}\nexport const ${section} = {\n${enSection}\n} as const;\n`;
    fs.writeFileSync(path.join(__dirname, 'en', `${section}.ts`), enFile, 'utf8');
    
    console.log('✅');
    successCount++;
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    failedSections.push(section);
  }
});

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
console.log(`✅ Successfully extracted ${successCount}/${sections.length} sections`);

if (failedSections.length > 0) {
  console.log(`⚠️  Failed sections (${failedSections.length}): ${failedSections.join(', ')}`);
}

console.log('\n🎉 Section extraction complete!');
console.log('\nNext steps:');
console.log('  1. Create bg/index.ts and en/index.ts');
console.log('  2. Create locales/index.ts');
console.log('  3. Update LanguageContext.tsx');
