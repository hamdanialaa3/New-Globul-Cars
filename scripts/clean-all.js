/**
 * Clean All Script
 * تنظيف شامل للكاشات والمنافذ والخوادم
 * 
 * Usage: node scripts/clean-all.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 بدء عملية التنظيف الشاملة...\n');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, description) {
  try {
    log(`  ⚙️  ${description}...`, 'cyan');
    execSync(command, { stdio: 'inherit', shell: true });
    log(`  ✅ ${description} - تم`, 'green');
  } catch (error) {
    log(`  ⚠️  ${description} - فشل (قد يكون طبيعي إذا لم يكن هناك شيء للتنظيف)`, 'yellow');
  }
}

// 1. إيقاف عمليات Node.js
log('\n📦 الخطوة 1: إيقاف عمليات Node.js', 'blue');
try {
  if (process.platform === 'win32') {
    // Windows
    execCommand('taskkill /F /IM node.exe 2>nul', 'إيقاف عمليات Node.js');
  } else {
    // Linux/Mac
    execCommand('pkill -f node || true', 'إيقاف عمليات Node.js');
  }
} catch (error) {
  log('  ℹ️  لا توجد عمليات Node.js قيد التشغيل', 'yellow');
}

// 2. تنظيف كاشات npm
log('\n📦 الخطوة 2: تنظيف كاشات npm', 'blue');
execCommand('npm cache clean --force', 'تنظيف npm cache');

// 3. تنظيف build folders
log('\n📦 الخطوة 3: تنظيف مجلدات البناء', 'blue');
const buildDirs = ['build', 'dist', '.next', 'out'];
buildDirs.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      log(`  ✅ حذف ${dir}`, 'green');
    } catch (error) {
      log(`  ⚠️  فشل حذف ${dir}`, 'yellow');
    }
  }
});

// 4. تنظيف كاشات TypeScript
log('\n📦 الخطوة 4: تنظيف كاشات TypeScript', 'blue');
const tsCacheDirs = ['.tsbuildinfo', 'tsconfig.tsbuildinfo'];
tsCacheDirs.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      log(`  ✅ حذف ${file}`, 'green');
    } catch (error) {
      log(`  ⚠️  فشل حذف ${file}`, 'yellow');
    }
  }
});

// 5. تنظيف كاشات React/CRA
log('\n📦 الخطوة 5: تنظيف كاشات React', 'blue');
const reactCacheDirs = ['.cache', 'node_modules/.cache'];
reactCacheDirs.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      log(`  ✅ حذف ${dir}`, 'green');
    } catch (error) {
      log(`  ⚠️  فشل حذف ${dir}`, 'yellow');
    }
  }
});

// 6. تنظيف كاشات Vite (إذا كان مستخدماً)
log('\n📦 الخطوة 6: تنظيف كاشات Vite', 'blue');
const viteCacheDir = path.join(process.cwd(), 'node_modules/.vite');
if (fs.existsSync(viteCacheDir)) {
  try {
    fs.rmSync(viteCacheDir, { recursive: true, force: true });
    log('  ✅ حذف Vite cache', 'green');
  } catch (error) {
    log('  ⚠️  فشل حذف Vite cache', 'yellow');
  }
}

// 7. تنظيف ملفات .env.local و .env.development.local
log('\n📦 الخطوة 7: تنظيف ملفات البيئة المحلية', 'blue');
const envFiles = ['.env.local', '.env.development.local', '.env.test.local'];
envFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    log(`  ℹ️  وجد ${file} (لم يتم حذفه - قد يحتوي على إعدادات مهمة)`, 'yellow');
  }
});

// 8. تنظيف ملفات log
log('\n📦 الخطوة 8: تنظيف ملفات السجلات', 'blue');
const logFiles = ['npm-debug.log', 'yarn-debug.log', 'yarn-error.log', 'lerna-debug.log'];
logFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      log(`  ✅ حذف ${file}`, 'green');
    } catch (error) {
      log(`  ⚠️  فشل حذف ${file}`, 'yellow');
    }
  }
});

// 9. تنظيف Coverage reports
log('\n📦 الخطوة 9: تنظيف تقارير التغطية', 'blue');
const coverageDir = path.join(process.cwd(), 'coverage');
if (fs.existsSync(coverageDir)) {
  try {
    fs.rmSync(coverageDir, { recursive: true, force: true });
    log('  ✅ حذف coverage', 'green');
  } catch (error) {
    log('  ⚠️  فشل حذف coverage', 'yellow');
  }
}

// 10. تنظيف .DS_Store (Mac)
log('\n📦 الخطوة 10: تنظيف ملفات النظام', 'blue');
if (process.platform === 'darwin') {
  execCommand('find . -name ".DS_Store" -type f -delete 2>/dev/null || true', 'حذف ملفات .DS_Store');
}

// 11. تنظيف المنافذ (Ports)
log('\n📦 الخطوة 11: تنظيف المنافذ', 'blue');
const ports = [3000, 3001, 5173, 8080, 5000, 5001];
ports.forEach(port => {
  try {
    if (process.platform === 'win32') {
      execSync(`netstat -ano | findstr :${port}`, { stdio: 'ignore' });
      // Note: Killing ports on Windows requires admin rights
      log(`  ℹ️  المنفذ ${port} - يرجى إغلاقه يدوياً إذا كان مستخدماً`, 'yellow');
    } else {
      const pid = execSync(`lsof -ti:${port} 2>/dev/null || true`, { encoding: 'utf8' }).trim();
      if (pid) {
        execSync(`kill -9 ${pid} 2>/dev/null || true`);
        log(`  ✅ إغلاق المنفذ ${port}`, 'green');
      }
    }
  } catch (error) {
    // Port not in use
  }
});

// Summary
log('\n✨ تم الانتهاء من عملية التنظيف!', 'green');
log('\n📋 ملخص:', 'blue');
log('  ✅ تم تنظيف كاشات npm', 'green');
log('  ✅ تم حذف مجلدات البناء', 'green');
log('  ✅ تم تنظيف كاشات TypeScript و React', 'green');
log('  ✅ تم تنظيف ملفات السجلات', 'green');
log('\n💡 نصيحة: قم بتشغيل npm install لإعادة تثبيت الحزم إذا لزم الأمر', 'yellow');
log('💡 نصيحة: قم بتشغيل npm start لإعادة تشغيل الخادم', 'yellow');

