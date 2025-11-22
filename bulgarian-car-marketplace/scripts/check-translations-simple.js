/**
 * Simple Translation Keys Extractor
 * Direct comparison of bg and en keys
 */
const fs = require('fs');
const path = require('path');

// Read translations file
const translationsPath = path.join(__dirname, '..', 'src', 'locales', 'translations.ts');
const content = fs.readFileSync(translationsPath, 'utf8');

// Simple regex approach: extract all keys recursively
function getAllKeys(obj, prefix = '') {
  const keys = new Set();
  
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Recurse into nested object
      const nested = getAllKeys(value, fullKey);
      nested.forEach(k => keys.add(k));
    } else {
      // Leaf node
      keys.add(fullKey);
    }
  }
  
  return keys;
}

try {
  // Use dynamic import approach with module conversion
  const Module = require('module');
  const _require = Module.prototype.require;
  
  // Strip TypeScript, keep only object literal
  let cleaned = content
    .replace(/\/\/.*$/gm, '') // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//gm, '') // Remove multi-line comments
    .replace(/^export /gm, '') // Remove export
    .replace(/^import .*$/gm, ''); // Remove imports
  
  // Find the translations object
  const match = cleaned.match(/const translations = (\{[\s\S]*\});?\s*$/m);
  if (!match) {
    console.log(JSON.stringify({ ok: false, error: 'Could not find translations object' }));
    process.exit(1);
  }
  
  // Evaluate just the object
  const translationsObj = eval(`(${match[1]})`);
  
  const bgKeys = getAllKeys(translationsObj.bg);
  const enKeys = getAllKeys(translationsObj.en);
  
  const missingInBg = [...enKeys].filter(k => !bgKeys.has(k));
  const missingInEn = [...bgKeys].filter(k => !enKeys.has(k));
  
  console.log(JSON.stringify({
    ok: missingInBg.length === 0 && missingInEn.length === 0,
    timestamp: new Date().toISOString(),
    bgCount: bgKeys.size,
    enCount: enKeys.size,
    missingInBg: missingInBg.slice(0, 30),
    missingInEn: missingInEn.slice(0, 30),
    totalMissingInBg: missingInBg.length,
    totalMissingInEn: missingInEn.length
  }, null, 2));
  
} catch (error) {
  console.log(JSON.stringify({ ok: false, error: error.message, stack: error.stack }));
}
