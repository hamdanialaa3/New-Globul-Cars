// Quick test for English translations after duplicate removal
const fs = require('fs');

const content = fs.readFileSync('src/locales/translations.ts', 'utf8');
const translationsMatch = content.match(/export const translations = ({[\s\S]*?}) as const/);

if (!translationsMatch) {
  console.log('❌ ERROR: Could not parse translations');
  process.exit(1);
}

const translationsCode = translationsMatch[1];
const translations = eval('(' + translationsCode + ')');

console.log('═══════════════════════════════════════════════════════════');
console.log('           ENGLISH TRANSLATIONS TEST');
console.log('═══════════════════════════════════════════════════════════\n');

// Test key translations
const testKeys = [
  { path: 'home.hero.title', expected: 'The Best Place to Buy and Sell Cars in Bulgaria' },
  { path: 'home.aiAnalytics.title', expected: 'AI Market Analysis' },
  { path: 'home.smartSell.title', expected: 'Sell Your Car Fast' },
  { path: 'home.dealerSpotlight.title', expected: 'Dealer Spotlight' },
  { path: 'sell.hero.title', expected: 'Sell Your Car Fast & Easy' },
  { path: 'nav.home', expected: 'Home' },
  { path: 'nav.sell', expected: 'Sell' },
  { path: 'common.retry', expected: 'Retry' }
];

let passed = 0;
let failed = 0;

testKeys.forEach(({ path, expected }) => {
  const keys = path.split('.');
  let value = translations.en;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      value = undefined;
      break;
    }
  }
  
  if (value === expected) {
    console.log(`✓ ${path}: PASS`);
    passed++;
  } else {
    console.log(`✗ ${path}: FAIL`);
    console.log(`  Expected: "${expected}"`);
    console.log(`  Got: "${value}"`);
    failed++;
  }
});

console.log('\n═══════════════════════════════════════════════════════════');
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log('═══════════════════════════════════════════════════════════');

if (failed === 0) {
  console.log('\n✅ All English translations working correctly!');
} else {
  console.log('\n❌ Some translations are missing or incorrect');
  process.exit(1);
}
