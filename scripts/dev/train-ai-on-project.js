#!/usr/bin/env node
/**
 * AI Project Training Script
 * سكربت تدريب الذكاء الاصطناعي على المشروع
 * 
 * يقرأ جميع ملفات المشروع ويحللها لإنشاء قاعدة معرفة (Knowledge Base)
 * للـ AI Chatbot ليصبح خبيراً بالمشروع
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const CONFIG = {
  projectRoot: path.join(__dirname, '..', '..'),
  outputFile: path.join(__dirname, '..', '..', 'data', 'project-knowledge.json'),
  
  // ملفات للتضمين
  includeExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css'],
  
  // مجلدات للتجاهل
  ignoreDirs: ['node_modules', 'build', 'dist', '.git', 'coverage', 'lib'],
  
  // ملفات للتجاهل
  ignoreFiles: ['package-lock.json', 'yarn.lock'],
  
  // حجم أقصى للملف (1MB)
  maxFileSize: 1024 * 1024,
  
  // عدد الأسطر للسياق
  contextLines: 50
};

// إحصائيات
const stats = {
  totalFiles: 0,
  processedFiles: 0,
  skippedFiles: 0,
  totalLines: 0,
  totalChars: 0,
  errors: 0
};

/**
 * قراءة ملف بأمان
 */
function readFileSafe(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error(`❌ خطأ في قراءة ${filePath}:`, error.message);
    stats.errors++;
    return null;
  }
}

/**
 * تحليل محتوى ملف TypeScript/JavaScript
 */
function analyzeCodeFile(content, filePath) {
  const analysis = {
    type: 'code',
    functions: [],
    classes: [],
    interfaces: [],
    exports: [],
    imports: [],
    comments: []
  };

  // استخراج الدوال
  const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/g;
  let match;
  while ((match = functionRegex.exec(content)) !== null) {
    analysis.functions.push(match[1]);
  }

  // استخراج الـ Classes
  const classRegex = /(?:export\s+)?class\s+(\w+)/g;
  while ((match = classRegex.exec(content)) !== null) {
    analysis.classes.push(match[1]);
  }

  // استخراج الـ Interfaces
  const interfaceRegex = /(?:export\s+)?interface\s+(\w+)/g;
  while ((match = interfaceRegex.exec(content)) !== null) {
    analysis.interfaces.push(match[1]);
  }

  // استخراج الـ Exports
  const exportRegex = /export\s+(?:const|let|var|function|class|interface)\s+(\w+)/g;
  while ((match = exportRegex.exec(content)) !== null) {
    analysis.exports.push(match[1]);
  }

  // استخراج التعليقات المهمة
  const commentRegex = /\/\*\*[\s\S]*?\*\/|\/\/.+/g;
  const comments = content.match(commentRegex);
  if (comments) {
    analysis.comments = comments
      .filter(c => c.length > 20)
      .map(c => c.replace(/\/\*\*|\*\/|\/\/|\*/g, '').trim())
      .slice(0, 10); // أول 10 تعليقات
  }

  return analysis;
}

/**
 * تحليل محتوى ملف Markdown
 */
function analyzeMarkdownFile(content) {
  const analysis = {
    type: 'documentation',
    headers: [],
    links: [],
    codeBlocks: []
  };

  // استخراج العناوين
  const headerRegex = /^#+\s+(.+)$/gm;
  let match;
  while ((match = headerRegex.exec(content)) !== null) {
    analysis.headers.push(match[1]);
  }

  // استخراج الروابط
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  while ((match = linkRegex.exec(content)) !== null) {
    analysis.links.push({ text: match[1], url: match[2] });
  }

  // استخراج code blocks
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    analysis.codeBlocks.push({
      language: match[1] || 'unknown',
      lines: match[2].split('\n').length
    });
  }

  return analysis;
}

/**
 * إنشاء ملخص للملف
 */
function createFileSummary(content, filePath) {
  const lines = content.split('\n');
  const firstLines = lines.slice(0, CONFIG.contextLines).join('\n');
  
  // استخراج أول تعليق/وصف
  const firstComment = content.match(/\/\*\*[\s\S]*?\*\//);
  const description = firstComment 
    ? firstComment[0].replace(/\/\*\*|\*\/|\*/g, '').trim().slice(0, 500)
    : `ملف ${path.basename(filePath)}`;

  return {
    description,
    preview: firstLines.slice(0, 1000), // أول 1000 حرف
    lines: lines.length
  };
}

/**
 * معالجة ملف واحد
 */
function processFile(filePath, relativePath) {
  const ext = path.extname(filePath);
  
  // تحقق من الحجم
  const fileStats = fs.statSync(filePath);
  if (fileStats.size > CONFIG.maxFileSize) {
    console.log(`⚠️  ملف كبير جداً (تم تجاهله): ${relativePath}`);
    stats.skippedFiles++;
    return null;
  }

  const content = readFileSafe(filePath);
  if (!content) return null;

  const lines = content.split('\n').length;
  stats.totalLines += lines;
  stats.totalChars += content.length;

  // تحليل حسب نوع الملف
  let analysis = {};
  if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
    analysis = analyzeCodeFile(content, filePath);
  } else if (ext === '.md') {
    analysis = analyzeMarkdownFile(content);
  }

  const summary = createFileSummary(content, filePath);

  // إنشاء hash للمحتوى
  const contentHash = crypto.createHash('md5').update(content).digest('hex');

  return {
    path: relativePath,
    type: ext,
    size: fileStats.size,
    lines,
    contentHash,
    summary,
    analysis,
    lastModified: fileStats.mtime.toISOString(),
    keywords: extractKeywords(content, relativePath)
  };
}

/**
 * استخراج كلمات مفتاحية
 */
function extractKeywords(content, filePath) {
  const keywords = new Set();
  
  // من اسم الملف
  const fileName = path.basename(filePath, path.extname(filePath));
  fileName.split(/[-_.]/).forEach(word => {
    if (word.length > 3) keywords.add(word.toLowerCase());
  });

  // من المحتوى (كلمات شائعة في البرمجة)
  const codeKeywords = [
    'service', 'component', 'hook', 'context', 'api', 'auth', 'user', 
    'car', 'listing', 'search', 'firebase', 'database', 'function',
    'interface', 'type', 'class', 'export', 'import', 'const', 'async'
  ];

  codeKeywords.forEach(keyword => {
    if (content.toLowerCase().includes(keyword)) {
      keywords.add(keyword);
    }
  });

  return Array.from(keywords).slice(0, 20);
}

/**
 * مسح المجلد بشكل متكرر
 */
function scanDirectory(dirPath, baseDir = dirPath) {
  const files = [];
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(baseDir, fullPath);
      
      // تجاهل المجلدات المستبعدة
      if (entry.isDirectory()) {
        if (CONFIG.ignoreDirs.includes(entry.name)) {
          continue;
        }
        files.push(...scanDirectory(fullPath, baseDir));
      } else {
        // تجاهل الملفات المستبعدة
        if (CONFIG.ignoreFiles.includes(entry.name)) {
          continue;
        }
        
        const ext = path.extname(entry.name);
        if (CONFIG.includeExtensions.includes(ext)) {
          stats.totalFiles++;
          const fileData = processFile(fullPath, relativePath);
          if (fileData) {
            files.push(fileData);
            stats.processedFiles++;
          }
        }
      }
    }
  } catch (error) {
    console.error(`❌ خطأ في مسح ${dirPath}:`, error.message);
    stats.errors++;
  }
  
  return files;
}

/**
 * إنشاء فهرس قابل للبحث
 */
function createSearchIndex(files) {
  const index = {
    byType: {},
    byKeyword: {},
    byDirectory: {}
  };

  files.forEach((file, idx) => {
    // فهرسة حسب النوع
    if (!index.byType[file.type]) {
      index.byType[file.type] = [];
    }
    index.byType[file.type].push(idx);

    // فهرسة حسب الكلمات المفتاحية
    file.keywords.forEach(keyword => {
      if (!index.byKeyword[keyword]) {
        index.byKeyword[keyword] = [];
      }
      index.byKeyword[keyword].push(idx);
    });

    // فهرسة حسب المجلد
    const dir = path.dirname(file.path);
    const topDir = dir.split(path.sep)[0] || 'root';
    if (!index.byDirectory[topDir]) {
      index.byDirectory[topDir] = [];
    }
    index.byDirectory[topDir].push(idx);
  });

  return index;
}

/**
 * إنشاء ملخص للمشروع
 */
function createProjectSummary(files) {
  const summary = {
    totalFiles: files.length,
    totalLines: stats.totalLines,
    totalSize: stats.totalChars,
    fileTypes: {},
    topDirectories: {},
    mostCommonKeywords: {},
    codeStats: {
      totalFunctions: 0,
      totalClasses: 0,
      totalInterfaces: 0
    }
  };

  files.forEach(file => {
    // إحصاء حسب النوع
    summary.fileTypes[file.type] = (summary.fileTypes[file.type] || 0) + 1;

    // إحصاء حسب المجلد
    const topDir = file.path.split(path.sep)[0] || 'root';
    summary.topDirectories[topDir] = (summary.topDirectories[topDir] || 0) + 1;

    // إحصاء الكلمات المفتاحية
    file.keywords.forEach(keyword => {
      summary.mostCommonKeywords[keyword] = (summary.mostCommonKeywords[keyword] || 0) + 1;
    });

    // إحصاء الكود
    if (file.analysis.functions) {
      summary.codeStats.totalFunctions += file.analysis.functions.length;
    }
    if (file.analysis.classes) {
      summary.codeStats.totalClasses += file.analysis.classes.length;
    }
    if (file.analysis.interfaces) {
      summary.codeStats.totalInterfaces += file.analysis.interfaces.length;
    }
  });

  // ترتيب الكلمات المفتاحية
  summary.topKeywords = Object.entries(summary.mostCommonKeywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([keyword, count]) => ({ keyword, count }));

  return summary;
}

/**
 * الدالة الرئيسية
 */
async function main() {
  console.log('🚀 بدء تدريب الذكاء الاصطناعي على المشروع...\n');
  console.log('📁 المسار:', CONFIG.projectRoot);
  console.log('📝 أنواع الملفات:', CONFIG.includeExtensions.join(', '));
  console.log('');

  const startTime = Date.now();

  // مسح المشروع
  console.log('🔍 جاري مسح الملفات...');
  const files = scanDirectory(CONFIG.projectRoot);
  
  // إنشاء الفهرس
  console.log('📊 جاري إنشاء الفهرس...');
  const searchIndex = createSearchIndex(files);
  
  // إنشاء الملخص
  console.log('📈 جاري إنشاء ملخص المشروع...');
  const projectSummary = createProjectSummary(files);

  // بناء قاعدة المعرفة
  const knowledgeBase = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    project: {
      name: 'Koli One',
      description: 'منصة بلغارية لبيع وشراء السيارات',
      path: CONFIG.projectRoot
    },
    summary: projectSummary,
    files,
    searchIndex,
    stats: {
      ...stats,
      processingTimeMs: Date.now() - startTime
    }
  };

  // حفظ قاعدة المعرفة
  console.log('💾 جاري حفظ قاعدة المعرفة...');
  const dataDir = path.dirname(CONFIG.outputFile);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  fs.writeFileSync(
    CONFIG.outputFile, 
    JSON.stringify(knowledgeBase, null, 2),
    'utf8'
  );

  // طباعة الإحصائيات
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log('\n✅ اكتمل التدريب بنجاح!\n');
  console.log('📊 الإحصائيات النهائية:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📁 إجمالي الملفات: ${stats.totalFiles}`);
  console.log(`✅ ملفات معالجة: ${stats.processedFiles}`);
  console.log(`⏭️  ملفات متجاهلة: ${stats.skippedFiles}`);
  console.log(`📝 إجمالي الأسطر: ${stats.totalLines.toLocaleString()}`);
  console.log(`💾 حجم البيانات: ${(stats.totalChars / 1024 / 1024).toFixed(2)} MB`);
  console.log(`⚙️  دوال: ${projectSummary.codeStats.totalFunctions}`);
  console.log(`🏛️  Classes: ${projectSummary.codeStats.totalClasses}`);
  console.log(`📋 Interfaces: ${projectSummary.codeStats.totalInterfaces}`);
  console.log(`❌ أخطاء: ${stats.errors}`);
  console.log(`⏱️  الوقت: ${duration}s`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n💾 تم الحفظ في: ${CONFIG.outputFile}`);
  console.log(`📦 حجم الملف: ${(fs.statSync(CONFIG.outputFile).size / 1024 / 1024).toFixed(2)} MB`);
  
  console.log('\n🎓 الـ AI الآن خبير بـ:');
  console.log(`   • ${files.length} ملف`);
  console.log(`   • ${projectSummary.codeStats.totalFunctions} دالة`);
  console.log(`   • ${Object.keys(projectSummary.topDirectories).length} مجلد رئيسي`);
  console.log(`   • ${projectSummary.topKeywords.slice(0, 5).map(k => k.keyword).join(', ')} و المزيد!`);
  
  console.log('\n🚀 الخطوة التالية: استخدم project-knowledge.service.ts للبحث في المعرفة');
}

// تشغيل
main().catch(error => {
  console.error('💥 خطأ فادح:', error);
  process.exit(1);
});
