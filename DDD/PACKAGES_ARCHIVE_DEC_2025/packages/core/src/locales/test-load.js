const fs = require('fs');

console.log('🔍 Finding language sections in translations.ts...\n');

const content = fs.readFileSync('translations.ts', 'utf-8');

// Test: Can we require/eval the file?
try {
  const cleaned = content
    .replace(/export const translations = /, 'const translations = ')
    .replace(/export type.*\n/g, '')
    .replace(/export default.*\n/g, '')
    .replace(/`/g, "'");  // Replace backticks with single quotes
  
  eval(cleaned);
  
  console.log('✅ Successfully loaded translations object');
  console.log('✅ BG section exists:', typeof translations.bg === 'object');
  console.log('✅ EN section exists:', typeof translations.en === 'object');
  console.log('✅ AR section exists:', typeof translations.ar === 'object');
  
  if (translations.bg) {
    const bgKeys = Object.keys(translations.bg);
    console.log(`\n📊 BG has ${bgKeys.length} top-level keys:`);
    console.log(bgKeys.slice(0, 10).join(', ') + '...');
  }
  
  if (translations.en) {
    const enKeys = Object.keys(translations.en);
    console.log(`\n📊 EN has ${enKeys.length} top-level keys:`);
    console.log(enKeys.slice(0, 10).join(', ') + '...');
  }
  
  if (translations.ar) {
    const arKeys = Object.keys(translations.ar);
    console.log(`\n📊 AR has ${arKeys.length} top-level keys:`);
    console.log(arKeys.slice(0, 10).join(', ') + '...');
  }
  
  console.log('\n✅ All language sections loaded successfully!');
  console.log('\n📝 Ready to split into modular files (BG + EN only, removing AR)');
  
} catch (e) {
  console.error('❌ Error:', e.message);
  console.error(e.stack);
}
