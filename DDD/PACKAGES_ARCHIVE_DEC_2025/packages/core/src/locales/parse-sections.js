const fs = require('fs');

console.log('🚀 Professional Translation Split v2');

const content = fs.readFileSync('translations.ts', 'utf-8');
const lines = content.split('\n');
console.log(`✅ Loaded ${lines.length} lines\n`);

// Strategy: Count braces starting from INSIDE each language section
// When we see "  bg: {", the NEXT line starts the content (depth=1 for the opening {)

let bgStart = -1, bgEnd = -1, enStart = -1, enEnd = -1, arStart = -1, arEnd = -1;

// Find BG section
for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('  bg: {')) {
    bgStart = i;
    console.log(`DEBUG: Found BG start at line ${i + 1}`);
    
    // Now count braces from the NEXT line until we return to depth 0
    let depth = 1; // The { in "bg: {" counts as 1
    for (let j = i + 1; j < lines.length; j++) {
      const open = (lines[j].match(/\{/g) || []).length;
      const close = (lines[j].match(/\}/g) || []).length;
      depth += open - close;
      
      if (j < i + 10) {
        console.log(`  Line ${j + 1}: depth=${depth} (open=${open}, close=${close})`);
      }
      
      if (depth === 0) {
        bgEnd = j - 1; // The line BEFORE the closing },
        console.log(`✅ BG section: lines ${bgStart + 1} to ${bgEnd + 1} (${bgEnd - bgStart + 1} lines)`);
        break;
      }
    }
    break;
  }
}

// Find EN section
for (let i = bgEnd + 1; i < lines.length; i++) {
  if (lines[i].startsWith('  en: {')) {
    enStart = i;
    
    let depth = 1;
    for (let j = i + 1; j < lines.length; j++) {
      const open = (lines[j].match(/\{/g) || []).length;
      const close = (lines[j].match(/\}/g) || []).length;
      depth += open - close;
      
      if (depth === 0) {
        enEnd = j - 1;
        console.log(`✅ EN section: lines ${enStart + 1} to ${enEnd + 1} (${enEnd - enStart + 1} lines)`);
        break;
      }
    }
    break;
  }
}

// Find AR section
for (let i = enEnd + 1; i < lines.length; i++) {
  if (lines[i].startsWith('  ar: {')) {
    arStart = i;
    
    let depth = 1;
    for (let j = i + 1; j < lines.length; j++) {
      const open = (lines[j].match(/\{/g) || []).length;
      const close = (lines[j].match(/\}/g) || []).length;
      depth += open - close;
      
      if (depth === 0) {
        arEnd = j - 1;
        console.log(`✅ AR section: lines ${arStart + 1} to ${arEnd + 1} (${arEnd - enStart + 1} lines)`);
        break;
      }
    }
    break;
  }
}

if (bgStart === -1 || enStart === -1) {
  console.error('\n❌ Failed to find all sections');
  process.exit(1);
}

console.log('\n📊 Summary:');
console.log(`BG: ${bgEnd - bgStart + 1} lines`);
console.log(`EN: ${enEnd - enStart + 1} lines`);
if (arStart !== -1) {
  console.log(`AR: ${arEnd - arStart + 1} lines (will be removed)`);
}

console.log('\n✅ Section boundaries found successfully!');
