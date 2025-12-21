// Ban console.* in production build within src (except logger-service)
// يمنع استخدام console.* في الإنتاج داخل src

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.resolve(__dirname, '../src');
const EXCLUDE_FILES = new Set([
  path.join(SRC_DIR, 'services', 'logger-service.ts'),
]);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return [full];
  });
}

function isSourceFile(file) {
  return /\.(ts|tsx|js|jsx)$/.test(file) && !file.includes('__mocks__') && !file.includes('__tests__');
}

function run() {
  const env = process.env.NODE_ENV || 'development';
  if (env !== 'production') {
    console.log('[ban-console] Skipping (NODE_ENV != production)');
    return;
  }
  const files = walk(SRC_DIR).filter(isSourceFile).filter(f => !EXCLUDE_FILES.has(f));
  const offenders = [];
  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    const matches = content.match(/\bconsole\.(log|error|warn|debug|info)\b/g);
    if (matches) offenders.push({ file: f, matches: [...new Set(matches)] });
  }
  if (offenders.length) {
    console.error('[ban-console] Found console usage in production build:');
    for (const o of offenders) {
      console.error(` - ${o.file}: ${o.matches.join(', ')}`);
    }
    process.exit(1);
  } else {
    console.log('[ban-console] No console usage detected in src.');
  }
}

run();
