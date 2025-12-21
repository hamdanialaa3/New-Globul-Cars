// check-translations.js (JS runtime version)
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const filePath = path.resolve(process.cwd(), 'src', 'locales', 'translations.ts');
const raw = fs.readFileSync(filePath, 'utf8');
let sandboxSrc = raw
  .replace(/export\s+const\s+translations\s*=\s*/, 'globalThis.__TX__ = ')
  .replace(/import[^;]+;/g, '');
// إزالة تعريفات type و interface لتجنب أخطاء eval في Node بدون TypeScript
sandboxSrc = sandboxSrc
  .split(/\r?\n/)
  .filter(line => !/^\s*(type|interface)\s+/.test(line))
  .join('\n');
const ctx = { globalThis };
vm.createContext(ctx);
try { vm.runInContext(sandboxSrc, ctx); } catch (e) {
  console.error(JSON.stringify({ ok:false, error:'eval failed', detail: e.message }, null, 2)); process.exit(1);
}
const translations = globalThis.__TX__;
if (!translations || !translations.bg || !translations.en) {
  console.error(JSON.stringify({ ok:false, error:'translations structure invalid' }, null, 2)); process.exit(1);
}
function collectKeys(obj, prefix='') {
  if (obj === null || typeof obj !== 'object') return [prefix.slice(1)];
  const keys = [];
  for (const k of Object.keys(obj)) keys.push(...collectKeys(obj[k], prefix + '.' + k));
  return keys;
}
const bgKeys = new Set(collectKeys(translations.bg));
const enKeys = new Set(collectKeys(translations.en));
const missingInBg = [...enKeys].filter(k => !bgKeys.has(k));
const missingInEn = [...bgKeys].filter(k => !enKeys.has(k));
const report = { ok: missingInBg.length===0 && missingInEn.length===0, missingInBg, missingInEn, bgCount: bgKeys.size, enCount: enKeys.size, timestamp: new Date().toISOString() };
console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exit(2);
