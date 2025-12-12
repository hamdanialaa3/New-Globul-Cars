#!/usr/bin/env node

/**
 * 🤖 AUTO-UPDATE DOCUMENTATION SCRIPT
 * 
 * هذا السكريبت يقوم بتحديث ملف PROJECT_DOCUMENTATION.md تلقائياً
 * مع كل تعديل يتم إجراؤه على المشروع
 * 
 * الاستخدام:
 *   node auto-update-documentation.js [options]
 * 
 * الخيارات:
 *   --analyze      تحليل شامل للمشروع
 *   --quick        تحديث سريع للإحصائيات
 *   --watch        مراقبة التغييرات المستمرة
 *   --help         عرض المساعدة
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { watch } = require('fs');

// ============================================================
// 📋 CONFIGURATION
// ============================================================

const CONFIG = {
  ROOT_DIR: path.resolve(__dirname),
  DOC_FILE: 'PROJECT_DOCUMENTATION.md',
  WATCH_INTERVAL: 5000, // 5 seconds
  IGNORE_PATTERNS: [
    'node_modules',
    '.git',
    '.firebase',
    'build',
    'dist',
    '.env',
    '__pycache__'
  ]
};

// ============================================================
// 🔍 ANALYSIS FUNCTIONS
// ============================================================

/**
 * عد الملفات في مجلد معين
 */
function countFiles(dirPath, extension = null) {
  try {
    if (!fs.existsSync(dirPath)) return 0;
    
    let count = 0;
    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    
    files.forEach(file => {
      if (CONFIG.IGNORE_PATTERNS.some(p => file.name.includes(p))) return;
      
      if (file.isDirectory()) {
        count += countFiles(path.join(dirPath, file.name), extension);
      } else if (!extension || file.name.endsWith(extension)) {
        count++;
      }
    });
    
    return count;
  } catch (error) {
    console.error(`❌ خطأ في عد الملفات: ${error.message}`);
    return 0;
  }
}

/**
 * الحصول على حجم المجلد
 */
function getFolderSize(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) return 0;
    
    let size = 0;
    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    
    files.forEach(file => {
      if (CONFIG.IGNORE_PATTERNS.some(p => file.name.includes(p))) return;
      
      const filePath = path.join(dirPath, file.name);
      
      if (file.isDirectory()) {
        size += getFolderSize(filePath);
      } else {
        try {
          const stats = fs.statSync(filePath);
          size += stats.size;
        } catch (e) {
          // Skip unreadable or invalid files
        }
      }
    });
    
    return size;
  } catch (error) {
    console.error(`❌ خطأ في حساب الحجم: ${error.message}`);
    return 0;
  }
}

/**
 * تحويل البايتات إلى وحدات قراءة سهلة
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * الحصول على معلومات Git
 */
function getGitInfo() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { 
      cwd: CONFIG.ROOT_DIR,
      encoding: 'utf8' 
    }).trim();
    
    const commits = execSync('git rev-list --count HEAD', { 
      cwd: CONFIG.ROOT_DIR,
      encoding: 'utf8' 
    }).trim();
    
    const lastCommit = execSync('git log -1 --format=%ai', { 
      cwd: CONFIG.ROOT_DIR,
      encoding: 'utf8' 
    }).trim();
    
    return { branch, commits, lastCommit };
  } catch (error) {
    console.warn('⚠️ Git info غير متاح');
    return { branch: 'unknown', commits: 0, lastCommit: 'unknown' };
  }
}

/**
 * عد التعليقات TODO
 */
function countTODOs() {
  const roots = [
    path.join(CONFIG.ROOT_DIR, 'bulgarian-car-marketplace', 'src'),
    path.join(CONFIG.ROOT_DIR, 'functions', 'src')
  ];
  const patterns = [/TODO/i, /FIXME/i, /XXX/i, /HACK/i];

  let count = 0;

  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      if (CONFIG.IGNORE_PATTERNS.some(p => e.name.includes(p))) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        walk(full);
      } else if (e.name.endsWith('.ts') || e.name.endsWith('.tsx') || e.name.endsWith('.js')) {
        try {
          const content = fs.readFileSync(full, 'utf8');
          for (const pat of patterns) {
            const matches = content.match(new RegExp(pat.source, 'gi'));
            if (matches) count += matches.length;
          }
        } catch (err) {
          // ignore unreadable files
        }
      }
    }
  };

  for (const r of roots) walk(r);
  return count;
}

/**
 * تحليل شامل للمشروع
 */
function analyzeProject() {
  console.log('\n📊 جاري تحليل المشروع...\n');
  
  const stats = {
    timestamp: new Date().toISOString(),
    rootDir: CONFIG.ROOT_DIR,
    
    // Sizes
    sizes: {
      total: formatBytes(getFolderSize(CONFIG.ROOT_DIR)),
      app: formatBytes(getFolderSize(path.join(CONFIG.ROOT_DIR, 'bulgarian-car-marketplace'))),
      functions: formatBytes(getFolderSize(path.join(CONFIG.ROOT_DIR, 'functions'))),
      assets: formatBytes(getFolderSize(path.join(CONFIG.ROOT_DIR, 'assets')))
    },
    
    // File counts
    files: {
      total: countFiles(CONFIG.ROOT_DIR),
      tsx: countFiles(path.join(CONFIG.ROOT_DIR, 'bulgarian-car-marketplace/src'), '.tsx'),
      ts: countFiles(path.join(CONFIG.ROOT_DIR, 'bulgarian-car-marketplace/src'), '.ts'),
      components: countFiles(path.join(CONFIG.ROOT_DIR, 'bulgarian-car-marketplace/src/components'), '.tsx'),
      pages: countFiles(path.join(CONFIG.ROOT_DIR, 'bulgarian-car-marketplace/src/pages'), '.tsx'),
      services: countFiles(path.join(CONFIG.ROOT_DIR, 'bulgarian-car-marketplace/src/services'), '.ts'),
      functionsSrc: countFiles(path.join(CONFIG.ROOT_DIR, 'functions/src'), '.ts')
    },
    
    // Git info
    git: getGitInfo(),
    
    // TODO count
    todos: countTODOs()
  };
  
  return stats;
}

/**
 * تحديث قسم الإحصائيات في المستند
 */
function updateStatistics(docContent, stats) {
  const statsSection = `## 📊 ملخص إحصائيات المشروع

\`\`\`
حجم المشروع الإجمالي:
├─ الحجم: ${stats.sizes.total}
├─ تطبيق React: ${stats.sizes.app}
├─ Firebase Functions: ${stats.sizes.functions}
├─ الوسائط: ${stats.sizes.assets}
├─ عدد الملفات: ${stats.files.total.toLocaleString()} ملف
└─ المشروع منظم بكفاءة عالية

إحصائيات الكود:
├─ ملفات React (.tsx): ${stats.files.tsx} ملف
├─ ملفات TypeScript (.ts): ${stats.files.ts} ملف
├─ المكونات: ${stats.files.components} مكون
├─ الصفحات: ${stats.files.pages} صفحة
├─ الخدمات (Frontend): ${stats.files.services} خدمة
├─ Cloud Functions: ${stats.files.functionsSrc} دالة
└─ تعليقات TODO: ${stats.todos} عنصر متبقي
\`\`\``;

  // إزالة القسم القديم وإضافة القسم الجديد
  const regex = /## 📊 ملخص إحصائيات المشروع[\s\S]*?(?=\n---\n|\n##)/;
  return docContent.replace(regex, statsSection + '\n\n---');
}

/**
 * تحديث معلومات Git
 */
function updateGitInfo(docContent, gitInfo) {
  const gitSection = `
Repository: hamdanialaa3/New-Globul-Cars
URL: https://github.com/hamdanialaa3/new-globul-cars
Current Branch: ${gitInfo.branch}
Default Branch: main
License: MIT
Author: GitHub Copilot
Total Commits: ${gitInfo.commits}
Last Commit: ${gitInfo.lastCommit}
Last Updated: ${new Date().toLocaleString('ar-EG')}`;

  const regex = /Repository:.*?Last Updated:.*?(?=```)/s;
  return docContent.replace(regex, gitSection.trim() + '\n```');
}

/**
 * تحديث الطابع الزمني
 */
function updateTimestamp(docContent) {
  const now = new Date().toLocaleDateString('ar-EG', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  return docContent.replace(
    /> \*\*آخر تحديث\*\*:.*?$/m,
    `> **آخر تحديث**: ${now}`
  );
}

/**
 * تحديث ملف الوثائق الرئيسي
 */
function updateDocumentation(fullAnalysis = true) {
  try {
    const docPath = path.join(CONFIG.ROOT_DIR, CONFIG.DOC_FILE);
    
    if (!fs.existsSync(docPath)) {
      console.error(`❌ ملف الوثائق غير موجود: ${docPath}`);
      return false;
    }
    
    let docContent = fs.readFileSync(docPath, 'utf8');
    
    if (fullAnalysis) {
      console.log('📈 جاري التحليل الشامل...');
      const stats = analyzeProject();
      docContent = updateStatistics(docContent, stats);
      docContent = updateGitInfo(docContent, stats.git);
    }
    
    // تحديث الطابع الزمني دائماً
    docContent = updateTimestamp(docContent);
    
    fs.writeFileSync(docPath, docContent, 'utf8');
    
    console.log(`✅ تم تحديث الوثائق بنجاح!`);
    console.log(`📄 الملف: ${CONFIG.DOC_FILE}`);
    console.log(`🕐 الوقت: ${new Date().toLocaleTimeString('ar-EG')}`);
    
    return true;
  } catch (error) {
    console.error(`❌ خطأ في تحديث الوثائق: ${error.message}`);
    return false;
  }
}

/**
 * مراقبة التغييرات المستمرة
 */
function watchForChanges() {
  console.log('\n👁️ جاري مراقبة التغييرات في المشروع...\n');
  console.log('اضغط Ctrl+C للإيقاف\n');
  
  const watchers = [];
  let updateScheduled = false;
  
  const scheduleUpdate = () => {
    if (updateScheduled) return;
    
    updateScheduled = true;
    setTimeout(() => {
      updateDocumentation(true);
      updateScheduled = false;
    }, CONFIG.WATCH_INTERVAL);
  };
  
  // مراقبة المجلدات الرئيسية
  const watchDirs = [
    'bulgarian-car-marketplace/src',
    'functions/src',
    'assets'
  ];
  
  watchDirs.forEach(dir => {
    const fullPath = path.join(CONFIG.ROOT_DIR, dir);
    
    if (fs.existsSync(fullPath)) {
      try {
        const watcher = watch(fullPath, { recursive: true }, (eventType, filename) => {
          if (filename && !CONFIG.IGNORE_PATTERNS.some(p => filename.includes(p))) {
            console.log(`📝 تم اكتشاف تغيير: ${dir}/${filename}`);
            scheduleUpdate();
          }
        });
        
        watchers.push(watcher);
        console.log(`✅ مراقبة: ${dir}`);
      } catch (error) {
        console.warn(`⚠️ لا يمكن مراقبة: ${dir}`);
      }
    }
  });
  
  // معالجة الإغلاق
  process.on('SIGINT', () => {
    console.log('\n\n👋 جاري إيقاف المراقبة...\n');
    watchers.forEach(w => w.close());
    process.exit(0);
  });
}

// ============================================================
// 📞 CLI INTERFACE
// ============================================================

/**
 * عرض المساعدة
 */
function showHelp() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║      🤖 AUTO-UPDATE DOCUMENTATION SCRIPT                   ║
║      تحديث تلقائي لملف الوثائق مع تعديلات المشروع          ║
╚════════════════════════════════════════════════════════════╝

الاستخدام:
  node auto-update-documentation.js [options]

الخيارات:
  --analyze          تحليل شامل للمشروع وتحديث الوثائق
  --quick            تحديث سريع (فقط الطابع الزمني)
  --watch            مراقبة التغييرات المستمرة وتحديث تلقائي
  --help             عرض هذه الرسالة

أمثلة:
  # تحليل شامل وتحديث
  node auto-update-documentation.js --analyze
  
  # تحديث سريع (أسرع)
  node auto-update-documentation.js --quick
  
  # مراقبة مستمرة
  node auto-update-documentation.js --watch
  
  # المساعدة
  node auto-update-documentation.js --help

ملاحظات:
  - يتم حفظ التحديثات في: PROJECT_DOCUMENTATION.md
  - التحليل الشامل قد يستغرق بعض الوقت
  - في وضع المراقبة، سيتم التحديث تلقائياً عند اكتشاف تغيير
  `);
}

/**
 * الدالة الرئيسية
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    showHelp();
    return;
  }
  
  if (args.includes('--analyze')) {
    updateDocumentation(true);
  } else if (args.includes('--quick')) {
    updateDocumentation(false);
  } else if (args.includes('--watch')) {
    watchForChanges();
  } else {
    console.error('❌ خيار غير معروف. استخدم --help للمساعدة');
    process.exit(1);
  }
}

// ============================================================
// 🚀 ENTRY POINT
// ============================================================

if (require.main === module) {
  main();
}

module.exports = { 
  analyzeProject, 
  updateDocumentation, 
  watchForChanges,
  countFiles,
  getFolderSize,
  formatBytes
};
