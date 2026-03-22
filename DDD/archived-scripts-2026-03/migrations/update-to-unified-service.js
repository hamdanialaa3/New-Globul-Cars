/**
 * Script to update all imports to use UnifiedCarService
 * سكريبت لتحديث جميع الاستيرادات لاستخدام الخدمة الموحدة
 */

const fs = require('fs');
const path = require('path');

// Old service imports to replace
const OLD_IMPORTS = [
  {
    old: /import\s+.*?\s+from\s+['"]@\/services\/carDataService['"]/g,
    new: "import { unifiedCarService } from '@/services/car'"
  },
  {
    old: /import\s+.*?\s+from\s+['"]@\/services\/carListingService['"]/g,
    new: "import { unifiedCarService } from '@/services/car'"
  },
  {
    old: /import\s+.*?\s+from\s+['"]@\/firebase\/car-service['"]/g,
    new: "import { unifiedCarService } from '@/services/car'"
  }
];

// Method name mappings
const METHOD_MAPPINGS = {
  'carDataService.getCars': 'unifiedCarService.searchCars',
  'carDataService.getCarById': 'unifiedCarService.getCarById',
  'carDataService.getUserCars': 'unifiedCarService.getUserCars',
  'carListingService.createListing': 'unifiedCarService.createCar',
  'carListingService.updateListing': 'unifiedCarService.updateCar',
  'carListingService.deleteListing': 'unifiedCarService.deleteCar',
  'carListingService.getUserListings': 'unifiedCarService.getUserCars'
};

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Replace imports
    OLD_IMPORTS.forEach(({ old, new: newImport }) => {
      if (old.test(content)) {
        content = content.replace(old, newImport);
        modified = true;
      }
    });

    // Replace method calls
    Object.entries(METHOD_MAPPINGS).forEach(([oldMethod, newMethod]) => {
      const regex = new RegExp(oldMethod.replace('.', '\\.'), 'g');
      if (regex.test(content)) {
        content = content.replace(regex, newMethod);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

function scanDirectory(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = [];
  
  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and build directories
        if (!['node_modules', 'build', 'dist', '.git'].includes(item)) {
          scan(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    });
  }
  
  scan(dir);
  return files;
}

// Main execution
console.log('🚀 Starting UnifiedCarService migration...\n');

const srcDir = path.join(__dirname, '..', 'src');
const files = scanDirectory(srcDir);

console.log(`📁 Found ${files.length} files to check\n`);

let updatedCount = 0;
files.forEach(file => {
  if (updateFile(file)) {
    updatedCount++;
  }
});

console.log(`\n✨ Migration complete!`);
console.log(`📊 Updated ${updatedCount} files`);
console.log(`\n⚠️  Next steps:`);
console.log(`1. Review the changes: git diff`);
console.log(`2. Test the application: npm start`);
console.log(`3. Run tests: npm test`);
console.log(`4. If everything works, delete old services`);
