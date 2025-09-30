#!/usr/bin/env node

/**
 * سكريبت تحليل الملفات الكبيرة - التحليل الآمن قبل الإصلاح
 */

const fs = require('fs');
const path = require('path');

class FileAnalyzer {
  constructor() {
    this.maxLines = 300;
    this.results = {
      totalFiles: 0,
      largeFiles: [],
      summary: {}
    };
  }

  async analyzeProject(rootDir = 'src') {
    console.log('🔍 بدء تحليل الملفات الكبيرة...\n');

    const files = this.getAllFiles(rootDir);
    this.results.totalFiles = files.length;

    for (const file of files) {
      await this.analyzeFile(file);
    }

    this.printResults();
    return this.results;
  }

  getAllFiles(dir, files = []) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !this.shouldSkipDirectory(item)) {
        this.getAllFiles(fullPath, files);
      } else if (stat.isFile() && this.isCodeFile(item)) {
        files.push(fullPath);
      }
    }

    return files;
  }

  shouldSkipDirectory(dirName) {
    const skipDirs = ['node_modules', '.git', 'dist', 'build', '__tests__', 'coverage'];
    return skipDirs.includes(dirName);
  }

  isCodeFile(fileName) {
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    return extensions.some(ext => fileName.endsWith(ext));
  }

  async analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').length;

      if (lines > this.maxLines) {
        const analysis = this.analyzeFileContent(content, filePath);

        this.results.largeFiles.push({
          path: filePath,
          lines,
          type: this.getFileType(filePath),
          complexity: analysis.complexity,
          functions: analysis.functions,
          imports: analysis.imports,
          risk: this.calculateRisk(lines, analysis)
        });
      }
    } catch (error) {
      console.warn(`⚠️ خطأ في تحليل ${filePath}: ${error.message}`);
    }
  }

  analyzeFileContent(content, filePath) {
    // عد الدوال
    const functionRegex = /(?:function\s+\w+|const\s+\w+\s*=\s*\(|export\s+(?:const|function)\s+\w+)/g;
    const functions = (content.match(functionRegex) || []).length;

    // عد الاستيرادات
    const importRegex = /^import\s+.*from\s+['"']/gm;
    const imports = (content.match(importRegex) || []).length;

    // تقدير التعقيد
    const complexity = this.estimateComplexity(content);

    return { functions, imports, complexity };
  }

  estimateComplexity(content) {
    let score = 0;

    // زيادة التعقيد بناءً على عوامل مختلفة
    score += (content.match(/\bif\s*\(/g) || []).length * 2;
    score += (content.match(/\bfor\s*\(/g) || []).length * 3;
    score += (content.match(/\bwhile\s*\(/g) || []).length * 3;
    score += (content.match(/\btry\s*\{/g) || []).length * 2;
    score += (content.match(/\bcatch\s*\(/g) || []).length * 1;
    score += (content.match(/\bswitch\s*\(/g) || []).length * 2;

    return Math.min(score, 50); // حد أقصى 50
  }

  getFileType(filePath) {
    const fileName = path.basename(filePath);

    if (fileName.includes('Page') || fileName.includes('page')) return 'صفحة';
    if (fileName.includes('Component') || fileName.includes('component')) return 'مكون';
    if (fileName.includes('Service') || fileName.includes('service')) return 'خدمة';
    if (fileName.includes('Hook') || fileName.includes('hook')) return 'Hook';
    if (fileName.includes('Data') || fileName.includes('data')) return 'بيانات';

    return 'أخرى';
  }

  calculateRisk(lines, analysis) {
    let risk = 0;

    // المخاطر بناءً على الحجم
    if (lines > 1000) risk += 40;
    else if (lines > 500) risk += 20;
    else if (lines > 300) risk += 10;

    // المخاطر بناءً على التعقيد
    if (analysis.complexity > 30) risk += 20;
    else if (analysis.complexity > 15) risk += 10;

    // المخاطر بناءً على عدد الدوال
    if (analysis.functions > 20) risk += 15;
    else if (analysis.functions > 10) risk += 5;

    return Math.min(risk, 100);
  }

  printResults() {
    console.log('📊 تقرير تحليل الملفات الكبيرة\n');
    console.log(`📁 إجمالي الملفات المحللة: ${this.results.totalFiles}`);
    console.log(`🚨 عدد الملفات الكبيرة (>300 سطر): ${this.results.largeFiles.length}\n`);

    if (this.results.largeFiles.length > 0) {
      console.log('📋 الملفات الكبيرة مرتبة حسب المخاطر:\n');

      this.results.largeFiles
        .sort((a, b) => b.risk - a.risk)
        .forEach((file, index) => {
          console.log(`${index + 1}. ${file.path}`);
          console.log(`   📏 ${file.lines} سطر | 🔄 ${file.functions} دالة | 🎯 تعقيد: ${file.complexity}`);
          console.log(`   📂 نوع: ${file.type} | ⚠️  مخاطر: ${file.risk}%`);
          console.log('');
        });
    }

    // ملخص إحصائي
    const summary = this.generateSummary();
    console.log('📈 ملخص إحصائي:');
    console.log(`   • ملفات البيانات: ${summary.dataFiles} (${summary.dataLines} سطر إجمالي)`);
    console.log(`   • الصفحات: ${summary.pages} (${summary.pageLines} سطر إجمالي)`);
    console.log(`   • المكونات: ${summary.components} (${summary.componentLines} سطر إجمالي)`);
    console.log(`   • الخدمات: ${summary.services} (${summary.serviceLines} سطر إجمالي)`);
  }

  generateSummary() {
    const summary = {
      dataFiles: 0, pages: 0, components: 0, services: 0,
      dataLines: 0, pageLines: 0, componentLines: 0, serviceLines: 0
    };

    this.results.largeFiles.forEach(file => {
      switch (file.type) {
        case 'بيانات':
          summary.dataFiles++;
          summary.dataLines += file.lines;
          break;
        case 'صفحة':
          summary.pages++;
          summary.pageLines += file.lines;
          break;
        case 'مكون':
          summary.components++;
          summary.componentLines += file.lines;
          break;
        case 'خدمة':
          summary.services++;
          summary.serviceLines += file.lines;
          break;
        default:
          // ملفات أخرى
          break;
      }
    });

    return summary;
  }
}

// تشغيل التحليل
if (require.main === module) {
  const analyzer = new FileAnalyzer();
  analyzer.analyzeProject().catch(console.error);
}

module.exports = FileAnalyzer;