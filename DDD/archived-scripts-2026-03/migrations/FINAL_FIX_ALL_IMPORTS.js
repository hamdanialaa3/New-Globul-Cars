const fs = require('fs-extra');
const path = require('path');

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('🔥 FINAL FIX - حل نهائي شامل لجميع imports');
console.log('═══════════════════════════════════════════════════════════════\n');

const PAGES_DIR = path.join(__dirname, '../../src/pages');
const SRC_DIR = path.join(__dirname, '../../src');

// القوائم التي نحتاج إصلاحها
const GLOBAL_DIRS = ['hooks', 'contexts', 'services', 'firebase', 'utils', 'types', 'components', 'features', 'styles', 'assets', 'data', 'constants'];

async function fixAllImports(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    const original = content;
    
    // حساب العمق الحقيقي من src/
    const relativePath = path.relative(SRC_DIR, filePath);
    const pathParts = relativePath.split(path.sep);
    const depth = pathParts.length - 1; // -1 لأن اسم الملف لا يُحسب
    const correctPrefix = '../'.repeat(depth);
    
    // إصلاح كل مسار global
    for (const dir of GLOBAL_DIRS) {
      // استبدال جميع الأشكال المحتملة
      const patterns = [
        `from '\\.\\.\/${dir}\/`,
        `from "\\.\\.\\/${dir}\\/`,
        `from '\\.\\.\\/\\.\\.\/${dir}\/`,
        `from "\\.\\.\\/.\\.\\/\\/${dir}\\/`,
        `from '\\.\\.\\/\\.\\.\\/\\.\\.\/${dir}\/`,
        `from "\\.\\.\\/.\\.\\.\\.\\/\\/${dir}\\/`,
        `from '\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\.\/${dir}\/`,
        `from "\\.\\.\\/.\\.\\.\\.\\.\\.\\/\\/${dir}\\/`,
        `from '\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\.\/${dir}\/`,
        `from "\\.\\.\\/.\\.\\.\\.\\.\\.\\.\\.\\/\\/${dir}\\/`,
        `from '\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\.\\/\\.\\.\/${dir}\/`,
      ];
      
      for (const pattern of patterns) {
        const regex = new RegExp(pattern, 'g');
        if (content.match(regex)) {
          content = content.replace(regex, `from '${correctPrefix}${dir}/`);
        }
      }
    }
    
    if (content !== original) {
      await fs.writeFile(filePath, content, 'utf8');
      return { fixed: true, depth };
    }
    
    return { fixed: false, depth };
  } catch (error) {
    return { fixed: false, depth: 0, error: error.message };
  }
}

async function getAllFiles(dir) {
  const files = [];
  const items = await fs.readdir(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...await getAllFiles(fullPath));
    } else if (item.name.endsWith('.tsx') || item.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

async function main() {
  try {
    console.log('🔍 جاري البحث عن جميع الملفات...\n');
    const allFiles = await getAllFiles(PAGES_DIR);
    console.log(`📁 تم العثور على ${allFiles.length} ملف\n`);
    
    let fixed = 0;
    const depthMap = {};
    
    for (const file of allFiles) {
      const result = await fixAllImports(file);
      if (result.fixed) {
        const shortPath = path.relative(PAGES_DIR, file);
        const depthLabel = `[عمق ${result.depth}]`;
        console.log(`✅ ${depthLabel.padEnd(10)} ${shortPath}`);
        fixed++;
        depthMap[result.depth] = (depthMap[result.depth] || 0) + 1;
      }
    }
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(`✅ النتيجة: ${fixed}/${allFiles.length} ملف تم إصلاحه\n`);
    
    if (Object.keys(depthMap).length > 0) {
      console.log('📊 توزيع حسب العمق:');
      Object.keys(depthMap).sort().forEach(depth => {
        console.log(`   العمق ${depth}: ${depthMap[depth]} ملف`);
      });
    }
    
    console.log('═══════════════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('\n❌ خطأ:', error);
    process.exit(1);
  }
}

main();

