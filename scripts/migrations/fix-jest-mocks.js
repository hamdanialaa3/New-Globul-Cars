#!/usr/bin/env node

/**
 * Jest Mock Fixer - أداة إصلاح تلقائية لمشاكل jest.mock()
 * 
 * تقوم بـ:
 * 1. نقل جميع jest.mock() قبل الاستيرادات
 * 2. إضافة jest import من @jest/globals إذا لم يكن موجوداً
 * 3. تنظيف وتنسيق ملفات الاختبارات
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const FIXED = [];
const SKIPPED = [];
const ERRORS = [];

/**
 * إصلاح ملف اختبار واحد
 */
function fixTestFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.relative(process.cwd(), filePath);

    // 1. استخراج جميع jest.mock() statements
    const mockRegex = /jest\.mock\([^)]+\)(?:\s*;)?(\s*)/g;
    const mocks = [];
    let mockMatch;

    // جمع جميع jest.mock() مع الحفاظ على الترتيب
    while ((mockMatch = mockRegex.exec(content)) !== null) {
      mocks.push(mockMatch[0]);
    }

    // إزالة jest.mock() من المحتوى
    content = content.replace(mockRegex, '');

    // 2. استخراج الاستيرادات
    const importRegex = /^import\s+.*from\s+['"](.*?)['"]\s*;\s*\n/gm;
    const imports = [];
    let importMatch;

    while ((importMatch = importRegex.exec(content)) !== null) {
      imports.push(importMatch[0]);
    }

    // 3. إزالة الاستيرادات من المحتوى
    content = content.replace(importRegex, '');

    // 4. إعادة بناء الملف بالترتيب الصحيح
    let newContent = '';

    // أضف jest import أولاً إذا لم يكن موجوداً
    if (mocks.length > 0) {
      const hasJestImport = imports.some(imp => imp.includes('@jest/globals'));
      
      if (!hasJestImport) {
        // البحث عن describe/it/expect في الاستيرادات
        const describeImport = imports.find(imp => imp.includes('describe'));
        
        if (describeImport) {
          // استخرج الرموز من الاستيراد الموجود
          const match = describeImport.match(/import\s*\{([^}]+)\}/);
          if (match) {
            const symbols = match[1].split(',').map(s => s.trim());
            if (!symbols.includes('jest')) {
              symbols.push('jest');
            }
            const jestImport = `import { ${symbols.join(', ')} } from '@jest/globals';\n`;
            newContent += jestImport;
            imports.splice(imports.indexOf(describeImport), 1);
          }
        } else {
          newContent += "import { describe, it, expect, jest } from '@jest/globals';\n";
        }
      }
    }

    // أضف jest.mock() statements
    if (mocks.length > 0) {
      newContent += '\n// Mock dependencies - MUST be before imports\n';
      mocks.forEach(mock => {
        newContent += mock;
        if (!mock.trim().endsWith(';')) {
          newContent += ';';
        }
        newContent += '\n';
      });
      newContent += '\n';
    }

    // أضف باقي الاستيرادات
    imports.forEach(imp => {
      newContent += imp;
    });

    // أضف باقي المحتوى
    newContent += content;

    // تنظيف الفراغات الزائدة
    newContent = newContent.replace(/\n\n\n+/g, '\n\n');

    // كتابة الملف
    fs.writeFileSync(filePath, newContent, 'utf8');
    FIXED.push(fileName);
    return true;

  } catch (error) {
    ERRORS.push({
      file: path.relative(process.cwd(), filePath),
      error: error.message
    });
    return false;
  }
}

/**
 * البحث عن ملفات الاختبارات
 */
function findTestFiles() {
  const testDirs = [
    './src/**/__tests__/*.test.ts',
    './src/**/__tests__/*.test.tsx',
  ];

  const glob = require('glob');
  let files = [];

  testDirs.forEach(pattern => {
    try {
      const found = glob.sync(pattern);
      files = [...files, ...found];
    } catch (e) {
      // تجاهل أخطاء glob
    }
  });

  return [...new Set(files)]; // إزالة التكرارات
}

/**
 * طباعة النتائج
 */
function printResults() {
  console.log('\n' + chalk.bold.cyan('═══════════════════════════════════════════════════════════'));
  console.log(chalk.bold.cyan('   Jest Mock Fixer - أداة إصلاح jest.mock()'));
  console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════════\n'));

  if (FIXED.length > 0) {
    console.log(chalk.bold.green(`✅ FIXED (${FIXED.length}):\n`));
    FIXED.forEach((file, idx) => {
      console.log(chalk.green(`  ${idx + 1}. ${file}`));
    });
    console.log('');
  }

  if (ERRORS.length > 0) {
    console.log(chalk.bold.red(`\n❌ ERRORS (${ERRORS.length}):\n`));
    ERRORS.forEach((err, idx) => {
      console.log(chalk.red(`  ${idx + 1}. ${err.file}`));
      console.log(chalk.red(`     Error: ${err.error}`));
    });
    console.log('');
  }

  console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════════'));
  console.log(chalk.bold(`Summary: ${FIXED.length} files fixed, ${ERRORS.length} errors\n`));
}

// Main execution
try {
  const testFiles = findTestFiles();
  
  if (testFiles.length === 0) {
    console.log(chalk.yellow('⚠️  لم يتم العثور على ملفات اختبارات'));
    process.exit(0);
  }

  console.log(chalk.cyan(`\nإصلاح ${testFiles.length} ملف اختبار...\n`));

  testFiles.forEach(file => {
    fixTestFile(file);
  });

  printResults();

  if (FIXED.length > 0) {
    console.log(chalk.green('تم إصلاح الملفات بنجاح! شغل الاختبارات:'));
    console.log(chalk.cyan('  npm run test:ci\n'));
  }

} catch (error) {
  console.error(chalk.red('❌ Error:', error.message));
  process.exit(1);
}
