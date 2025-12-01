/**
 * Professional Translation Splitter
 * Splits translations.ts into modular BG/EN structure (removes AR)
 */

import { translations } from './translations';
import * as fs from 'fs';
import * as path from 'path';

console.log('🚀 Professional Translation Split - Direct Import Method\n');

// Verify structure
console.log('✅ Loaded translations object');
console.log(`✅ BG sections: ${Object.keys(translations.bg).length}`);
console.log(`✅ EN sections: ${Object.keys(translations.en).length}`);
console.log(`✅ AR sections: ${translations.ar ? Object.keys(translations.ar).length : 0} (will be removed)\n`);

// Get all section names from BG (master)
const sections = Object.keys(translations.bg);
console.log(`📊 Found ${sections.length} sections to split:\n${sections.join(', ')}\n`);

// Create directories
const bgDir = path.join(__dirname, 'bg');
const enDir = path.join(__dirname, 'en');

if (!fs.existsSync(bgDir)) fs.mkdirSync(bgDir);
if (!fs.existsSync(enDir)) fs.mkdirSync(enDir);

console.log('📁 Created bg/ and en/ directories\n');

// Split each section into separate files
let successCount = 0;
for (const section of sections) {
  const bgContent = translations.bg[section];
  const enContent = translations.en[section];
  
  if (!bgContent || !enContent) {
    console.warn(`⚠️  Skipping ${section} - missing in one language`);
    continue;
  }
  
  // Write BG file
  const bgFile = path.join(bgDir, `${section}.ts`);
  const bgCode = `export const ${section} = ${JSON.stringify(bgContent, null, 2)} as const;\n`;
  fs.writeFileSync(bgFile, bgCode);
  
  // Write EN file
  const enFile = path.join(enDir, `${section}.ts`);
  const enCode = `export const ${section} = ${JSON.stringify(enContent, null, 2)} as const;\n`;
  fs.writeFileSync(enFile, enCode);
  
  successCount++;
  console.log(`✅ ${section}.ts (${Object.keys(bgContent).length} keys)`);
}

console.log(`\n✅ Successfully split ${successCount} sections`);

// Create index files
console.log('\n📝 Creating index files...');

// BG index
const bgIndex = `${sections.map(s => `export { ${s} } from './${s}';`).join('\n')}\n`;
fs.writeFileSync(path.join(bgDir, 'index.ts'), bgIndex);

// EN index
const enIndex = `${sections.map(s => `export { ${s} } from './${s}';`).join('\n')}\n`;
fs.writeFileSync(path.join(enDir, 'index.ts'), enIndex);

console.log('✅ Created bg/index.ts and en/index.ts');

// Create main index
console.log('\n📝 Creating main locales/index.ts...');
const mainIndex = `import * as bg from './bg';
import * as en from './en';

export const translations = {
  bg,
  en
} as const;

export type Language = 'bg' | 'en';

export default translations;
`;
fs.writeFileSync(path.join(__dirname, 'index.ts'), mainIndex);
console.log('✅ Created locales/index.ts');

console.log('\n🎉 Translation split complete!');
console.log(`📊 Summary:`);
console.log(`   - ${successCount} sections extracted`);
console.log(`   - BG files: bg/*.ts`);
console.log(`   - EN files: en/*.ts`);
console.log(`   - AR section removed`);
console.log(`   - Main export: locales/index.ts`);
