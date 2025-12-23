// Complete Translation System Test
const fs = require('fs');
const path = require('path');

console.log('═══════════════════════════════════════════════════════════');
console.log('      COMPLETE TRANSLATION SYSTEM DIAGNOSTIC');
console.log('═══════════════════════════════════════════════════════════\n');

// 1. Check translations file
console.log('📄 STEP 1: Checking translations.ts file...\n');
const translationsPath = path.join(__dirname, 'src', 'locales', 'translations.ts');
const translationsContent = fs.readFileSync(translationsPath, 'utf8');

console.log('   ✓ File size:', translationsContent.length, 'characters');
console.log('   ✓ Lines:', translationsContent.split('\n').length);

// Check export structure
const hasExportConst = translationsContent.includes('export const translations');
const hasAsConst = translationsContent.includes('as const');
console.log('   ✓ Export structure:', hasExportConst ? 'CORRECT' : 'WRONG');
console.log('   ✓ Type safety (as const):', hasAsConst ? 'YES' : 'NO');

// 2. Check LanguageContext
console.log('\n📄 STEP 2: Checking LanguageContext.tsx...\n');
const contextPath = path.join(__dirname, 'src', 'contexts', 'LanguageContext.tsx');
const contextContent = fs.readFileSync(contextPath, 'utf8');

const hasImportTranslations = contextContent.includes("import { translations } from '../locales/translations'");
const hasGetNestedTranslation = contextContent.includes('function getNestedTranslation');
const hasUseCallback = contextContent.includes('useCallback');
const hasConsoleWarn = contextContent.includes('console.warn');

console.log('   ✓ Import statement:', hasImportTranslations ? 'CORRECT' : 'WRONG');
console.log('   ✓ Helper function:', hasGetNestedTranslation ? 'EXISTS' : 'MISSING');
console.log('   ✓ Performance optimization:', hasUseCallback ? 'YES' : 'NO');
console.log('   ✓ Debug logging:', hasConsoleWarn ? 'ENABLED' : 'DISABLED');

// 3. Test actual translation loading
console.log('\n📄 STEP 3: Testing translation loading in Node.js...\n');

try {
  // This won't work perfectly in Node because of TypeScript, but let's try
  const translationsModule = require('./src/locales/translations.ts');
  const trans = translationsModule.translations || translationsModule.default || translationsModule;
  
  if (trans && trans.bg && trans.bg.home) {
    console.log('   ✓ Translations object loaded:', 'SUCCESS');
    console.log('   ✓ BG section exists:', trans.bg ? 'YES' : 'NO');
    console.log('   ✓ EN section exists:', trans.en ? 'YES' : 'NO');
    
    // Test specific keys
    const testKeys = [
      { key: 'home.aiAnalytics.title', expected: 'AI Пазарен Анализ' },
      { key: 'home.smartSell.title', expected: 'Продайте автомобила си бързо' },
      { key: 'home.dealerSpotlight.title', expected: 'Акцентирани дилъри' }
    ];
    
    console.log('\n   Testing specific keys in BG:');
    testKeys.forEach(({ key, expected }) => {
      const parts = key.split('.');
      let value = trans.bg;
      for (const part of parts) {
        value = value?.[part];
      }
      const match = value === expected;
      console.log(`      ${match ? '✓' : '✗'} ${key}: ${match ? 'MATCH' : 'MISMATCH'}`);
      if (!match && value) {
        console.log(`         Got: "${value}"`);
        console.log(`         Expected: "${expected}"`);
      }
    });
  } else {
    console.log('   ✗ Failed to load translations object properly');
  }
} catch (error) {
  console.log('   ⚠ Cannot test in Node.js (TypeScript module):', error.message);
  console.log('   → This is normal - test in browser instead');
}

// 4. Check components using translations
console.log('\n📄 STEP 4: Checking components that use translations...\n');

const componentsToCheck = [
  'src/pages/01_main-pages/home/HomePage/AIAnalyticsTeaser.tsx',
  'src/pages/01_main-pages/home/HomePage/SmartSellStrip.tsx',
  'src/pages/01_main-pages/home/HomePage/DealerSpotlight.tsx'
];

componentsToCheck.forEach(compPath => {
  const fullPath = path.join(__dirname, compPath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const hasUseLanguage = content.includes('useLanguage');
    const hasTFunction = content.includes('t(');
    const name = path.basename(compPath);
    console.log(`   ${hasUseLanguage && hasTFunction ? '✓' : '✗'} ${name}: ${hasUseLanguage && hasTFunction ? 'OK' : 'ISSUE'}`);
  } else {
    console.log(`   ✗ ${path.basename(compPath)}: NOT FOUND`);
  }
});

// 5. Check App.tsx for LanguageProvider
console.log('\n📄 STEP 5: Checking App.tsx provider setup...\n');

const appPath = path.join(__dirname, 'src', 'App.tsx');
const appContent = fs.readFileSync(appPath, 'utf8');

const hasLanguageProviderImport = appContent.includes("import { LanguageProvider }");
const hasLanguageProvider = appContent.includes('<LanguageProvider>');
const hasTranslationDebug = appContent.includes('<TranslationDebug');

console.log('   ✓ LanguageProvider imported:', hasLanguageProviderImport ? 'YES' : 'NO');
console.log('   ✓ LanguageProvider in tree:', hasLanguageProvider ? 'YES' : 'NO');
console.log('   ✓ Debug component added:', hasTranslationDebug ? 'YES' : 'NO');

// 6. Final summary
console.log('\n═══════════════════════════════════════════════════════════');
console.log('                    SUMMARY');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('✅ Next Steps:');
console.log('   1. Open http://localhost:3000 in your browser');
console.log('   2. Look at bottom-right corner for Debug Panel');
console.log('   3. Check if translations show in GREEN (working)');
console.log('   4. If RED (not working), check browser console for warnings');
console.log('   5. Use browser DevTools to inspect LanguageContext state');
console.log('\n');
console.log('🔍 Debugging Tips:');
console.log('   - Press F12 to open DevTools');
console.log('   - Check Console tab for [Translation] warnings');
console.log('   - Run: localStorage.clear(); location.reload();');
console.log('   - Check React DevTools for LanguageProvider state');
console.log('\n');

console.log('═══════════════════════════════════════════════════════════\n');
