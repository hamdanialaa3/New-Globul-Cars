/**
 * Analyze Large Files - Find files that need splitting
 * تحليل الملفات الكبيرة - البحث عن الملفات التي تحتاج للتقسيم
 */

const fs = require('fs');
const path = require('path');

const THRESHOLDS = {
  WARNING: 500,   // تحذير: ملف كبير
  CRITICAL: 1000, // حرج: يجب التقسيم
  HUGE: 2000      // ضخم جداً: أولوية عالية
};

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').length;
    const size = fs.statSync(filePath).size;
    const sizeKB = (size / 1024).toFixed(2);
    
    // Count imports
    const imports = (content.match(/^import\s+/gm) || []).length;
    
    // Count exports
    const exports = (content.match(/^export\s+/gm) || []).length;
    
    // Count functions/components
    const functions = (content.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g) || []).length;
    
    // Count React components
    const components = (content.match(/const\s+\w+:\s*React\.FC|function\s+\w+\s*\(/g) || []).length;
    
    return {
      path: filePath,
      lines,
      sizeKB,
      imports,
      exports,
      functions,
      components,
      complexity: calculateComplexity(lines, imports, functions)
    };
  } catch (error) {
    return null;
  }
}

function calculateComplexity(lines, imports, functions) {
  // Simple complexity score
  const score = (lines / 100) + (imports / 10) + (functions / 5);
  
  if (score > 50) return 'CRITICAL';
  if (score > 30) return 'HIGH';
  if (score > 15) return 'MEDIUM';
  return 'LOW';
}

function scanDirectory(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const results = [];
  
  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip certain directories
        if (!['node_modules', 'build', 'dist', '.git', 'coverage'].includes(item)) {
          scan(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          const analysis = analyzeFile(fullPath);
          if (analysis && analysis.lines > THRESHOLDS.WARNING) {
            results.push(analysis);
          }
        }
      }
    });
  }
  
  scan(dir);
  return results;
}

function generateReport(results) {
  // Sort by lines (descending)
  results.sort((a, b) => b.lines - a.lines);
  
  const huge = results.filter(r => r.lines >= THRESHOLDS.HUGE);
  const critical = results.filter(r => r.lines >= THRESHOLDS.CRITICAL && r.lines < THRESHOLDS.HUGE);
  const warning = results.filter(r => r.lines >= THRESHOLDS.WARNING && r.lines < THRESHOLDS.CRITICAL);
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 تحليل الملفات الكبيرة - Large Files Analysis');
  console.log('='.repeat(80) + '\n');
  
  console.log(`📁 إجمالي الملفات الكبيرة: ${results.length}`);
  console.log(`🔴 ضخمة جداً (>${THRESHOLDS.HUGE} سطر): ${huge.length}`);
  console.log(`🟠 حرجة (>${THRESHOLDS.CRITICAL} سطر): ${critical.length}`);
  console.log(`🟡 تحذير (>${THRESHOLDS.WARNING} سطر): ${warning.length}\n`);
  
  if (huge.length > 0) {
    console.log('🔴 ملفات ضخمة جداً - أولوية عالية للتقسيم:');
    console.log('-'.repeat(80));
    huge.forEach((file, index) => {
      const relativePath = path.relative(process.cwd(), file.path);
      console.log(`\n${index + 1}. ${relativePath}`);
      console.log(`   📏 الأسطر: ${file.lines.toLocaleString()}`);
      console.log(`   💾 الحجم: ${file.sizeKB} KB`);
      console.log(`   📦 Imports: ${file.imports}`);
      console.log(`   🔧 Functions: ${file.functions}`);
      console.log(`   ⚡ التعقيد: ${file.complexity}`);
    });
    console.log('\n');
  }
  
  if (critical.length > 0) {
    console.log('🟠 ملفات حرجة - يُنصح بالتقسيم:');
    console.log('-'.repeat(80));
    critical.slice(0, 10).forEach((file, index) => {
      const relativePath = path.relative(process.cwd(), file.path);
      console.log(`${index + 1}. ${relativePath} (${file.lines} سطر, ${file.sizeKB} KB)`);
    });
    if (critical.length > 10) {
      console.log(`   ... و ${critical.length - 10} ملف آخر\n`);
    }
  }
  
  // Generate recommendations
  console.log('\n' + '='.repeat(80));
  console.log('💡 التوصيات - Recommendations');
  console.log('='.repeat(80) + '\n');
  
  if (huge.length > 0) {
    console.log('🎯 أولوية عالية:');
    huge.forEach((file, index) => {
      const relativePath = path.relative(process.cwd(), file.path);
      const fileName = path.basename(file.path);
      console.log(`\n${index + 1}. ${fileName}`);
      console.log(`   📂 المسار: ${relativePath}`);
      console.log(`   📋 خطة التقسيم المقترحة:`);
      
      if (file.components > 5) {
        console.log(`      - تقسيم إلى ${Math.ceil(file.components / 3)} مكونات منفصلة`);
      }
      if (file.functions > 10) {
        console.log(`      - نقل ${Math.floor(file.functions / 2)} دالة إلى ملفات مساعدة`);
      }
      if (file.imports > 20) {
        console.log(`      - تنظيم الاستيرادات وإزالة غير المستخدم`);
      }
      console.log(`      - إنشاء مجلد: ${fileName.replace(/\.(tsx?|jsx?)$/, '')}/`);
      console.log(`      - تقسيم إلى: index, types, utils, components`);
    });
  }
  
  // Statistics
  console.log('\n' + '='.repeat(80));
  console.log('📈 الإحصائيات - Statistics');
  console.log('='.repeat(80) + '\n');
  
  const totalLines = results.reduce((sum, r) => sum + r.lines, 0);
  const avgLines = Math.round(totalLines / results.length);
  const totalSize = results.reduce((sum, r) => sum + parseFloat(r.sizeKB), 0);
  
  console.log(`📊 إجمالي الأسطر: ${totalLines.toLocaleString()}`);
  console.log(`📊 متوسط الأسطر: ${avgLines.toLocaleString()}`);
  console.log(`💾 إجمالي الحجم: ${totalSize.toFixed(2)} KB`);
  console.log(`📁 أكبر ملف: ${results[0].lines.toLocaleString()} سطر`);
  
  // Save report to file
  const reportPath = path.join(process.cwd(), 'LARGE_FILES_REPORT.md');
  const markdown = generateMarkdownReport(results, huge, critical, warning);
  fs.writeFileSync(reportPath, markdown, 'utf8');
  console.log(`\n✅ تم حفظ التقرير في: ${reportPath}`);
}

function generateMarkdownReport(results, huge, critical, warning) {
  let md = `# 📊 تقرير الملفات الكبيرة - Large Files Report\n\n`;
  md += `**تاريخ التحليل:** ${new Date().toLocaleString('ar-EG')}\n\n`;
  md += `## 📈 الملخص\n\n`;
  md += `- 🔴 ملفات ضخمة جداً: ${huge.length}\n`;
  md += `- 🟠 ملفات حرجة: ${critical.length}\n`;
  md += `- 🟡 ملفات تحذير: ${warning.length}\n`;
  md += `- 📁 إجمالي: ${results.length}\n\n`;
  
  if (huge.length > 0) {
    md += `## 🔴 ملفات ضخمة جداً (>${THRESHOLDS.HUGE} سطر)\n\n`;
    md += `| # | الملف | الأسطر | الحجم | التعقيد |\n`;
    md += `|---|-------|--------|-------|--------|\n`;
    huge.forEach((file, index) => {
      const relativePath = path.relative(process.cwd(), file.path);
      md += `| ${index + 1} | \`${relativePath}\` | ${file.lines.toLocaleString()} | ${file.sizeKB} KB | ${file.complexity} |\n`;
    });
    md += `\n`;
  }
  
  if (critical.length > 0) {
    md += `## 🟠 ملفات حرجة (${THRESHOLDS.CRITICAL}-${THRESHOLDS.HUGE} سطر)\n\n`;
    md += `| # | الملف | الأسطر | الحجم |\n`;
    md += `|---|-------|--------|-------|\n`;
    critical.slice(0, 20).forEach((file, index) => {
      const relativePath = path.relative(process.cwd(), file.path);
      md += `| ${index + 1} | \`${relativePath}\` | ${file.lines.toLocaleString()} | ${file.sizeKB} KB |\n`;
    });
    md += `\n`;
  }
  
  md += `## 💡 التوصيات\n\n`;
  md += `### خطة التقسيم المقترحة\n\n`;
  
  huge.forEach((file, index) => {
    const fileName = path.basename(file.path);
    const folderName = fileName.replace(/\.(tsx?|jsx?)$/, '');
    md += `#### ${index + 1}. ${fileName}\n\n`;
    md += `**البنية المقترحة:**\n\`\`\`\n`;
    md += `${folderName}/\n`;
    md += `├── index.${path.extname(fileName).slice(1)}\n`;
    md += `├── types.ts\n`;
    md += `├── utils.ts\n`;
    md += `├── components/\n`;
    md += `│   ├── Component1.tsx\n`;
    md += `│   └── Component2.tsx\n`;
    md += `└── styles.ts\n\`\`\`\n\n`;
  });
  
  return md;
}

// Main execution
console.log('🔍 بدء تحليل الملفات الكبيرة...\n');

const srcDir = path.join(__dirname, '..', 'src');
const results = scanDirectory(srcDir);

if (results.length === 0) {
  console.log('✅ رائع! لا توجد ملفات كبيرة تحتاج للتقسيم.');
} else {
  generateReport(results);
}

console.log('\n✨ اكتمل التحليل!\n');
