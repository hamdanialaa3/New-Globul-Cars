const fs = require('fs');

console.log('🚀 Smart Translation Split - Professional Approach');

// Read file
const content = fs.readFileSync('translations.ts', 'utf-8');
const lines = content.split('\n');
console.log(`✅ Loaded ${lines.length} lines`);

// Find section boundaries by looking for main language sections
let bgStart = -1, bgEnd = -1, enStart = -1, enEnd = -1, arStart = -1, arEnd = -1;
let braceDepth = 0;
let inBg = false, inEn = false, inAr = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();
  
  // Count braces
  const openBraces = (line.match(/\{/g) || []).length;
  const closeBraces = (line.match(/\}/g) || []).length;
  
  // Find "  bg: {" at the ROOT level (exactly 2 spaces)
  if (line.startsWith('  bg: {')) {
    bgStart = i;
    inBg = true;
    braceDepth = 0; // Will be incremented to 1 by the { in this line
    console.log(`✅ Found BG start at line ${i + 1}`);
    // Don't continue - let this line's braces be counted below
  }
  
  // Track depth when in BG section
  if (inBg && !line.startsWith('  bg: {')) {  // Don't process the start line again
    braceDepth += openBraces - closeBraces;
    if (i >= 1456 && i <= 1465) {
      console.log(`Line ${i + 1} (depth=${braceDepth}, open=${openBraces}, close=${closeBraces}): ${line.substring(0, 40)}`);
    }
    // BG section ends when we encounter "  }," at ROOT level and depth becomes 0
    if (braceDepth === 0 && line.match(/^\s{2}\},?\s*$/)) {
      bgEnd = i;
      inBg = false;
      console.log(`✅ BG ends at line ${i + 1}`);
    }
  }
  
  // Find "  en: {" at ROOT level
  if (line.startsWith('  en: {') && bgEnd !== -1 && enStart === -1) {
    enStart = i;
    inEn = true;
    braceDepth = 0;
    console.log(`✅ Found EN start at line ${i + 1}`);
    // Don't continue
  }
  
  // Track depth when in EN section
  if (inEn) {
    braceDepth += openBraces - closeBraces;
    if (braceDepth === 0 && closeBraces > 0) {
      enEnd = i;
      inEn = false;
      console.log(`✅ EN ends at line ${i + 1}`);
    }
  }
  
  // Find "  ar: {" at ROOT level
  if (line.startsWith('  ar: {') && enEnd !== -1 && arStart === -1) {
    arStart = i;
    inAr = true;
    braceDepth = 0;
    console.log(`✅ Found AR start at line ${i + 1}`);
    // Don't continue
  }
  
  // Track depth when in AR section
  if (inAr) {
    braceDepth += openBraces - closeBraces;
    if (braceDepth === 0 && closeBraces > 0) {
      arEnd = i;
      inAr = false;
      console.log(`✅ AR ends at line ${i + 1}`);
      break; // Found everything
    }
  }
}

if (bgStart === -1 || enStart === -1) {
  console.error('❌ Failed to find all sections');
  console.error(`BG: ${bgStart}, EN: ${enStart}, AR: ${arStart}`);
  process.exit(1);
}

console.log('\n📊 Section Summary:');
console.log(`BG: Lines ${bgStart + 1} to ${bgEnd + 1} (${bgEnd - bgStart + 1} lines)`);
console.log(`EN: Lines ${enStart + 1} to ${enEnd + 1} (${enEnd - enStart + 1} lines)`);
if (arStart !== -1) {
  console.log(`AR: Lines ${arStart + 1} to ${arEnd + 1} (${arEnd - arStart + 1} lines)`);
}

// Extract BG content
const bgContent = lines.slice(bgStart + 1, bgEnd).join('\n');
console.log(`\n✅ Extracted BG content: ${bgContent.split('\n').length} lines`);

// Extract EN content
const enContent = lines.slice(enStart + 1, enEnd).join('\n');
console.log(`✅ Extracted EN content: ${enContent.split('\n').length} lines`);

console.log('\n✅ Extraction successful! Ready for section parsing...');
