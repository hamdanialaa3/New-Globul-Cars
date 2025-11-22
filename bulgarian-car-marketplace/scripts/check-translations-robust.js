/**
 * Translation Parity Checker (Robust Version)
 * Validates bg/en key parity without eval - pure AST parsing approach
 */
const fs = require('fs');
const path = require('path');

function extractKeysFromObject(content, startIdx, prefix = '') {
  const keys = [];
  let depth = 0;
  let currentKey = '';
  let inString = false;
  let stringChar = '';
  let i = startIdx;
  
  while (i < content.length) {
    const char = content[i];
    const nextChar = content[i + 1];
    
    // Handle strings
    if ((char === '"' || char === "'" || char === '`') && content[i - 1] !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = '';
      }
      i++;
      continue;
    }
    
    if (inString) {
      i++;
      continue;
    }
    
    // Track braces
    if (char === '{') {
      depth++;
      if (depth === 1 && currentKey) {
        // Found nested object, recurse
        const nestedKeys = extractKeysFromObject(content, i + 1, prefix ? `${prefix}.${currentKey}` : currentKey);
        keys.push(...nestedKeys);
        // Skip to closing brace
        let braceCount = 1;
        i++;
        while (i < content.length && braceCount > 0) {
          if (content[i] === '{' && !isInString(content, i)) braceCount++;
          if (content[i] === '}' && !isInString(content, i)) braceCount--;
          i++;
        }
        currentKey = '';
        continue;
      }
      i++;
      continue;
    }
    
    if (char === '}') {
      depth--;
      if (depth < 0) break;
      i++;
      continue;
    }
    
    // Extract key name
    if (depth === 0) {
      const keyMatch = content.substring(i).match(/^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/);
      if (keyMatch) {
        currentKey = keyMatch[1];
        const fullKey = prefix ? `${prefix}.${currentKey}` : currentKey;
        
        // Check if it's a primitive value (not nested object)
        const afterColon = content.substring(i + keyMatch[0].length).trim();
        if (afterColon[0] !== '{') {
          keys.push(fullKey);
        }
        
        i += keyMatch[0].length;
        continue;
      }
    }
    
    i++;
  }
  
  return keys;
}

function isInString(content, index) {
  let inStr = false;
  let strChar = '';
  for (let i = 0; i < index; i++) {
    const char = content[i];
    if ((char === '"' || char === "'" || char === '`') && content[i - 1] !== '\\') {
      if (!inStr) {
        inStr = true;
        strChar = char;
      } else if (char === strChar) {
        inStr = false;
      }
    }
  }
  return inStr;
}

function extractLanguageKeys(content, lang) {
  // Find the language object start - must be at root level
  // Look for pattern like "  bg: {" or "  en: {" (two spaces indent)
  const langPattern = new RegExp(`^\\s{2}${lang}\\s*:\\s*\\{`, 'gm');
  const match = langPattern.exec(content);
  
  if (!match) return [];
  
  const startIdx = match.index + match[0].length;
  
  // Extract keys without language prefix
  const keys = extractKeysFromObject(content, startIdx);
  
  // Don't add lang prefix to avoid duplication like "home.en.home"
  return keys;
}

function main() {
  const translationsPath = path.join(__dirname, '..', 'src', 'locales', 'translations.ts');
  
  if (!fs.existsSync(translationsPath)) {
    console.log(JSON.stringify({ ok: false, error: 'translations.ts not found' }));
    return;
  }
  
  const content = fs.readFileSync(translationsPath, 'utf8');
  
  // Extract keys for both languages
  const bgKeys = extractLanguageKeys(content, 'bg');
  const enKeys = extractLanguageKeys(content, 'en');
  
  // Find mismatches
  const bgSet = new Set(bgKeys);
  const enSet = new Set(enKeys);
  
  const missingInBg = enKeys.filter(k => !bgSet.has(k));
  const missingInEn = bgKeys.filter(k => !enSet.has(k));
  
  const result = {
    ok: missingInBg.length === 0 && missingInEn.length === 0,
    timestamp: new Date().toISOString(),
    bgCount: bgKeys.length,
    enCount: enKeys.length,
    missingInBg: missingInBg.slice(0, 20), // Limit output
    missingInEn: missingInEn.slice(0, 20),
    totalMissingInBg: missingInBg.length,
    totalMissingInEn: missingInEn.length
  };
  
  console.log(JSON.stringify(result, null, 2));
}

main();
