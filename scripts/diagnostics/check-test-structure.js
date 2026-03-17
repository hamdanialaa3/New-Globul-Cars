#!/usr/bin/env node

/**
 * Test Structure Checker - كاشف مشاكل Jest
 * 
 * يفحص ملفات الاختبار للكشف عن:
 * 1. jest.mock() بعد الاستيرادات (خطأ هوست Jest)
 * 2. استخدام jest.spyOn(console) بدون تنظيف
 * 3. استيراد الوحدات قبل المشاهد
 * 4. مشاهد بدون import jest
 * 5. استخدام @jest/globals بشكل خاطئ
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const ERRORS = [];
const WARNINGS = [];
const INFO = [];

/**
 * فحص ملف اختبار واحد
 */
function checkTestFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const fileName = path.relative(process.cwd(), filePath);

  // 1. التحقق من jest.mock() بعد الاستيرادات
  const mockRegex = /jest\.mock\(/g;
  const importRegex = /^import /m;
  
  let lastImportLine = 0;
  let firstMockLine = 0;
  let hasMock = false;

  lines.forEach((line, idx) => {
    if (importRegex.test(line) && !line.includes('jest')) {
      lastImportLine = idx;
    }
    if (mockRegex.test(line) && !hasMock) {
      firstMockLine = idx;
      hasMock = true;
    }
  });

  if (hasMock && firstMockLine > lastImportLine && lastImportLine > 0) {
    ERRORS.push({
      file: fileName,
      line: firstMockLine + 1,
      issue: 'jest.mock() يجب أن يكون قبل الاستيرادات الأخرى',
      severity: 'CRITICAL',
      fix: 'انقل jest.mock() قبل جميع import statements'
    });
  }

  // 2. التحقق من jest.spyOn(console) بدون تنظيف
  if (content.includes('jest.spyOn(console')) {
    if (!content.includes('jest.restoreAllMocks()') && !content.includes('jest.clearAllMocks()')) {
      WARNINGS.push({
        file: fileName,
        issue: 'استخدام jest.spyOn(console) بدون تنظيف (cleanup)',
        severity: 'MEDIUM',
        fix: 'أضف afterEach(() => jest.restoreAllMocks())'
      });
    }
  }

  // 3. التحقق من استخدام @jest/globals
  if (content.includes('jest.fn()') && !content.includes('import { describe, it, expect')) {
    WARNINGS.push({
      file: fileName,
      issue: 'استخدام jest.fn() لكن بدون استيراد صحيح من @jest/globals',
      severity: 'MEDIUM',
      fix: 'أضف: import { describe, it, expect, jest } from "@jest/globals"'
    });
  }

  // 4. التحقق من الاستيرادات بعد jest.mock() مباشرة
  const mockLines = lines.filter((_, idx) => {
    return /jest\.mock\(/.test(lines[idx]);
  }).length;

  const importAfterMock = lines.findIndex((line, idx) => {
    return idx > firstMockLine && /^import /.test(line) && !line.includes('jest');
  });

  if (importAfterMock > -1 && firstMockLine > 0) {
    ERRORS.push({
      file: fileName,
      line: importAfterMock + 1,
      issue: 'استيراد الوحدات بعد jest.mock() سيسبب أخطاء',
      severity: 'CRITICAL',
      fix: 'انقل جميع الاستيرادات قبل jest.mock()'
    });
  }

  // 5. التحقق من missing jest import في ملفات تستخدم jest
  if (content.includes('jest.fn()') || content.includes('jest.mock()')) {
    if (!content.match(/import.*jest.*from\s+['"]@jest\/globals['"]/) && 
        !content.includes('const jest =')) {
      WARNINGS.push({
        file: fileName,
        issue: 'استخدام jest بدون استيراده من @jest/globals',
        severity: 'HIGH',
        fix: 'أضف: import { describe, it, expect, jest } from "@jest/globals"'
      });
    }
  }

  // 6. التحقق من global.console mocks
  if (content.includes('global.console')) {
    if (!content.includes('jest.restoreAllMocks()')) {
      WARNINGS.push({
        file: fileName,
        issue: 'استخدام global.console mock بدون restore',
        severity: 'MEDIUM',
        fix: 'أضف afterEach(() => jest.restoreAllMocks())'
      });
    }
  }

  // 7. التحقق من describe/it بدون jest import
  if ((content.includes('describe(') || content.includes('it(')) && 
      !content.includes("import { describe, it")) {
    // Check if they're using jest.globals
    if (!content.includes('@jest/globals')) {
      WARNINGS.push({
        file: fileName,
        issue: 'استخدام describe/it بدون استيراد من @jest/globals',
        severity: 'HIGH',
        fix: 'أضف: import { describe, it, expect, jest } from "@jest/globals"'
      });
    }
  }
}

/**
 * الاستخراج والبحث عن ملفات الاختبارات
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
      // Ignore glob errors
    }
  });

  return files;
}

/**
 * طباعة النتائج
 */
function printResults() {
  console.log('\n' + chalk.bold.cyan('═══════════════════════════════════════════════════════════'));
  console.log(chalk.bold.cyan('   Test Structure Checker - فاحص بنية الاختبارات'));
  console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════════\n'));

  if (ERRORS.length > 0) {
    console.log(chalk.bold.red(`\n❌ ERRORS (${ERRORS.length}):\n`));
    ERRORS.forEach((err, idx) => {
      console.log(chalk.red(`  ${idx + 1}. ${err.file}:${err.line}`));
      console.log(chalk.red(`     Issue: ${err.issue}`));
      console.log(chalk.yellow(`     Fix: ${err.fix}`));
      console.log('');
    });
  }

  if (WARNINGS.length > 0) {
    console.log(chalk.bold.yellow(`\n⚠️  WARNINGS (${WARNINGS.length}):\n`));
    WARNINGS.forEach((warn, idx) => {
      console.log(chalk.yellow(`  ${idx + 1}. ${warn.file}`));
      console.log(chalk.yellow(`     Issue: ${warn.issue}`));
      console.log(chalk.cyan(`     Fix: ${warn.fix}`));
      console.log('');
    });
  }

  if (INFO.length > 0) {
    console.log(chalk.bold.blue(`\nℹ️  INFO (${INFO.length}):\n`));
    INFO.forEach((info, idx) => {
      console.log(chalk.blue(`  ${idx + 1}. ${info}`));
    });
    console.log('');
  }

  console.log(chalk.bold.cyan('═══════════════════════════════════════════════════════════'));
  console.log(chalk.bold(`Summary: ${ERRORS.length} errors, ${WARNINGS.length} warnings, ${INFO.length} info\n`));

  if (ERRORS.length > 0) {
    process.exit(1);
  }
}

// Main execution
try {
  const testFiles = findTestFiles();
  
  if (testFiles.length === 0) {
    console.log(chalk.yellow('⚠️  لم يتم العثور على ملفات اختبارات'));
    process.exit(0);
  }

  console.log(chalk.cyan(`\nفحص ${testFiles.length} ملف اختبار...\n`));

  testFiles.forEach(file => {
    checkTestFile(file);
  });

  printResults();
} catch (error) {
  console.error(chalk.red('❌ Error:', error.message));
  process.exit(1);
}
