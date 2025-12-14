#!/usr/bin/env node
/**
 * Automatic Location Fields Fixer
 * Converts legacy .location.city to .locationData.cityName
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const SRC_DIR = path.join(__dirname, '../bulgarian-car-marketplace/src');

// Replacement patterns
const REPLACEMENTS = [
  // car.location.city → car.locationData.cityName
  {
    from: /(\w+)\.location\.city/g,
    to: '$1.locationData?.cityName'
  },
  // car.location.region → car.locationData.regionName (or derive from cityId)
  {
    from: /(\w+)\.location\.region/g,
    to: '$1.locationData?.regionName'
  },
  // location.coordinates → locationData.coordinates
  {
    from: /(\w+)\.location\.coordinates/g,
    to: '$1.locationData?.coordinates'
  },
  // Direct city field → locationData.cityName
  {
    from: /(\w+)\.city(?!\w)/g,
    to: '$1.locationData?.cityName'
  },
  // Direct region field → locationData.regionName
  {
    from: /(\w+)\.region(?!\w)/g,
    to: '$1.locationData?.regionName'
  }
];

let totalFixed = 0;
let filesModified = 0;

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fixCount = 0;
    
    // Skip migration files
    if (filePath.includes('migrate-location')) {
      return;
    }
    
    // Apply all replacements
    REPLACEMENTS.forEach(replacement => {
      const matches = content.match(replacement.from);
      if (matches && matches.length > 0) {
        // Don't replace if it's already locationData
        if (!content.includes('locationData')) {
          content = content.replace(replacement.from, replacement.to);
          fixCount += matches.length;
          modified = true;
        }
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      filesModified++;
      totalFixed += fixCount;
      console.log(`✅ Fixed ${fixCount} location fields in: ${path.relative(SRC_DIR, filePath)}`);
    }
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🔧 Starting automatic location fields fixes...\n');
  
  // Find all TS/TSX files
  const files = glob.sync('**/*.{ts,tsx}', {
    cwd: SRC_DIR,
    absolute: true,
    ignore: ['**/*.test.ts', '**/*.test.tsx', '**/node_modules/**']
  });
  
  console.log(`📁 Found ${files.length} files to scan\n`);
  
  files.forEach(fixFile);
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ COMPLETE!`);
  console.log(`📊 Files modified: ${filesModified}`);
  console.log(`🔧 Total fixes: ${totalFixed}`);
  console.log('='.repeat(50));
}

main();
