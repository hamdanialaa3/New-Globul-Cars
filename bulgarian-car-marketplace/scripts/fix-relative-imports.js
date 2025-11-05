const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * سكريبت إصلاح Relative Imports تلقائياً
 * Fix Relative Imports Script
 * 
 * المشكلة: بعد نقل الملفات، relative imports أصبحت خاطئة
 * الحل: تحويل relative imports إلى المسارات الصحيحة
 */

const PAGES_DIR = path.join(__dirname, '../src/pages');

// الاستبدالات الشائعة
const COMMON_REPLACEMENTS = {
  // في src/pages/02_authentication/*/*/
  "from '../hooks/useTranslation'": "from '../../../../hooks/useTranslation'",
  "from '../../hooks/useTranslation'": "from '../../../../hooks/useTranslation'",
  "from '../../../hooks/useTranslation'": "from '../../../../hooks/useTranslation'",
  
  "from '../contexts/AuthContext'": "from '../../../../contexts/AuthContext'",
  "from '../../contexts/AuthContext'": "from '../../../../contexts/AuthContext'",
  "from '../../../contexts/AuthContext'": "from '../../../../contexts/AuthContext'",
  
  "from '../hooks/useAuth'": "from '../../../../hooks/useAuth'",
  "from '../../hooks/useAuth'": "from '../../../../hooks/useAuth'",
  "from '../../../hooks/useAuth'": "from '../../../../hooks/useAuth'",
};

async function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let changesCount = 0;
    
    // تطبيق جميع الاستبدالات
    Object.entries(COMMON_REPLACEMENTS).forEach(([old, newPath]) => {
      if (content.includes(old)) {
        content = content.replace(new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newPath);
        changesCount++;
      }
    });
    
    // حفظ الملف إذا تغير
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      return changesCount;
    }
    
    return 0;
  } catch (error) {
    console.error(`❌ خطأ في ${filePath}:`, error.message);
    return 0;
  }
}

async function fixAllImports() {
  console.log('🔧 بدء إصلاح relative imports...\n');
  
  // البحث عن جميع ملفات TypeScript/TSX في الأقسام المنقولة
  const patterns = [
    'src/pages/10_legal/**/*.{ts,tsx}',
    'src/pages/02_authentication/**/*.{ts,tsx}',
  ];
  
  let totalFiles = 0;
  let totalChanges = 0;
  
  patterns.forEach(pattern => {
    const files = glob.sync(pattern, { cwd: path.join(__dirname, '..') });
    
    files.forEach(file => {
      const filePath = path.join(__dirname, '..', file);
      const changes = fixImportsInFile(filePath);
      
      if (changes > 0) {
        console.log(`✅ ${file}: ${changes} تغييرات`);
        totalFiles++;
        totalChanges += changes;
      }
    });
  });
  
  console.log(`\n📊 النتائج:`);
  console.log(`   ملفات محدثة: ${totalFiles}`);
  console.log(`   إجمالي التغييرات: ${totalChanges}`);
  
  if (totalChanges > 0) {
    console.log(`\n✅ تم إصلاح relative imports بنجاح!`);
  } else {
    console.log(`\nℹ️  لا توجد تغييرات مطلوبة`);
  }
}

if (require.main === module) {
  fixAllImports().catch(error => {
    console.error('❌ خطأ فادح:', error);
    process.exit(1);
  });
}

module.exports = { fixAllImports, fixImportsInFile };

