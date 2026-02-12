/**
 * Clean Port 3000 Script
 * تنظيف شامل للمنفذ 3000 والكاش
 * 
 * Usage: npm run clean:3000
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 تنظيف شامل للمنفذ 3000 والكاش...\n');

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

function execCommand(command, description, ignoreErrors = false) {
  try {
    log(`  ⚙️  ${description}...`, 'cyan');
    execSync(command, { stdio: 'inherit', shell: true });
    log(`  ✅ ${description} - تم`, 'green');
  } catch (error) {
    if (!ignoreErrors) {
      log(`  ⚠️  ${description} - فشل`, 'yellow');
    }
  }
}

// 1. إيقاف عمليات Node.js
log('\n📦 الخطوة 1: إيقاف عمليات Node.js', 'blue');
try {
  if (process.platform === 'win32') {
    execCommand('taskkill /F /IM node.exe 2>nul', 'إيقاف عمليات Node.js', true);
  } else {
    execCommand('pkill -f node || true', 'إيقاف عمليات Node.js', true);
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

// 6. تنظيف ملفات log
log('\n📦 الخطوة 6: تنظيف ملفات السجلات', 'blue');
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

// 7. تنظيف المنفذ 3000
log('\n📦 الخطوة 7: تنظيف المنفذ 3000', 'blue');
const port = 3000;
try {
  if (process.platform === 'win32') {
    // Windows: البحث عن العمليات على المنفذ وإغلاقها
    try {
      const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: 'pipe' });
      const lines = result.split('\n').filter(line => line.trim());
      if (lines.length > 0) {
        const pids = new Set();
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && !isNaN(pid)) {
            pids.add(pid);
          }
        });
        
        pids.forEach(pid => {
          try {
            execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
            log(`  ✅ إغلاق المنفذ ${port} (PID: ${pid})`, 'green');
          } catch (killError) {
            log(`  ⚠️  فشل إغلاق المنفذ ${port} (PID: ${pid}) - قد يتطلب صلاحيات إدارية`, 'yellow');
          }
        });
      } else {
        log(`  ℹ️  المنفذ ${port} غير مستخدم`, 'cyan');
      }
    } catch (error) {
      // Port not in use - this is fine
      log(`  ℹ️  المنفذ ${port} غير مستخدم`, 'cyan');
    }
  } else {
    // Linux/Mac
    const pid = execSync(`lsof -ti:${port} 2>/dev/null || true`, { encoding: 'utf8' }).trim();
    if (pid) {
      execSync(`kill -9 ${pid} 2>/dev/null || true`);
      log(`  ✅ إغلاق المنفذ ${port} (PID: ${pid})`, 'green');
    } else {
      log(`  ℹ️  المنفذ ${port} غير مستخدم`, 'cyan');
    }
  }
} catch (error) {
  log(`  ℹ️  المنفذ ${port} غير مستخدم`, 'cyan');
}

// Summary
log('\n✨ تم الانتهاء من عملية التنظيف!', 'green');
log('\n📋 ملخص:', 'blue');
log('  ✅ تم تنظيف كاشات npm', 'green');
log('  ✅ تم حذف مجلدات البناء', 'green');
log('  ✅ تم تنظيف كاشات TypeScript و React', 'green');
log('  ✅ تم تنظيف ملفات السجلات', 'green');
log('  ✅ تم تنظيف المنفذ 3000', 'green');
log('\n💡 نصيحة: قم بتشغيل npm start لإعادة تشغيل الخادم', 'yellow');
log('💡 نصيحة: اضغط Ctrl+Shift+R في المتصفح لإعادة تحميل الصفحة بدون كاش', 'yellow');

