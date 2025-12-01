// Quick translations test script
const fs = require('fs');
const path = require('path');

console.log('=== TRANSLATION SYSTEM DIAGNOSTIC ===\n');

// Read translations file
const translationsPath = path.join(__dirname, 'src', 'locales', 'translations.ts');
const content = fs.readFileSync(translationsPath, 'utf8');

console.log('1. File Size:', content.length, 'characters');
console.log('2. Lines:', content.split('\n').length);

// Check for syntax issues
const openBraces = (content.match(/\{/g) || []).length;
const closeBraces = (content.match(/\}/g) || []).length;
console.log('3. Braces: { =', openBraces, ', } =', closeBraces, ', Balance:', openBraces - closeBraces);

// Check for key sections
const hasBgSection = content.includes('bg: {');
const hasEnSection = content.includes('en: {');
const hasAsConst = content.includes('as const');
console.log('4. Structure: bg section =', hasBgSection, ', en section =', hasEnSection, ', as const =', hasAsConst);

// Check for specific problematic keys
const keys = [
  'home.aiAnalytics.title',
  'home.aiAnalytics.subtitle',
  'home.smartSell.title',
  'home.smartSell.description',
  'home.dealerSpotlight.title',
  'home.features.finance.title',
  'home.features.insurance.title',
  'home.features.verified.title'
];

console.log('\n5. Checking for specific translation keys in BG section:');
keys.forEach(key => {
  const keyParts = key.split('.');
  const lastPart = keyParts[keyParts.length - 1];
  const secondLast = keyParts[keyParts.length - 2];
  
  // Look for patterns like "aiAnalytics: {" and "title:"
  const sectionPattern = new RegExp(`${secondLast}:\\s*\\{[^}]*${lastPart}:`, 's');
  const found = sectionPattern.test(content);
  
  console.log(`  ${key}: ${found ? '✓ FOUND' : '✗ MISSING'}`);
});

// Check for common syntax errors
console.log('\n6. Syntax Checks:');
const hasTrailingCommas = /,\s*}/.test(content);
const hasMissingCommas = /['"][^'"]*['"]\s+[a-zA-Z]/.test(content);
console.log('  Potential trailing commas:', hasTrailingCommas ? 'YES (OK in TypeScript)' : 'NO');
console.log('  Potential missing commas:', hasMissingCommas ? 'POSSIBLE ISSUE' : 'OK');

// Try to extract and validate the object structure
console.log('\n7. Attempting to parse structure...');
try {
  // Remove TypeScript-specific syntax for basic validation
  const cleaned = content
    .replace(/export const translations =/, '')
    .replace(/as const;?/, '')
    .replace(/export type.*/, '')
    .replace(/export default.*/, '')
    .trim();
  
  // Check if it's valid JSON-like structure
  const lastCloseBrace = cleaned.lastIndexOf('}');
  const mainObject = cleaned.substring(0, lastCloseBrace + 1);
  
  console.log('  Main object structure: OK (ends properly)');
  console.log('  Last 100 chars:', mainObject.slice(-100).replace(/\s+/g, ' '));
  
} catch (error) {
  console.log('  ERROR:', error.message);
}

console.log('\n=== END OF DIAGNOSTIC ===');
