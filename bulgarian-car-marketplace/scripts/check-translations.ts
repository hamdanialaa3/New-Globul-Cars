/**
 * check-translations.ts
 * يتحقق من تطابق البنية بين bg و en داخل translations.ts ويطبع تقرير بالفوارق.
 * تشغيل: npx ts-node scripts/check-translations.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import * as vm from 'vm';

const filePath = path.resolve(process.cwd(), 'src', 'locales', 'translations.ts');
const raw = fs.readFileSync(filePath, 'utf8');

// استخراج كائن translations بطريقة سريعة (ليست تقييم كامل لـ TypeScript) عبر eval داخل sandbox.
// لتقليل المخاطر نحذف أي export default أو import.
let sandboxSrc = raw
  .replace(/export\s+const\s+translations\s*=\s*/, 'globalThis.__TX__ = ') // وضع في متغير عالمي
  .replace(/import[^;]+;/g, '');
// إزالة تعريفات type و interface (مع export) لتجنب أخطاء التنفيذ
sandboxSrc = sandboxSrc
  .split(/\r?\n/)
  .filter(line => !/^\s*(export\s+)?(type|interface)\s+/.test(line))
  .filter(line => !/^\s*export\s+default\s+translations/.test(line))
  .join('\n');

const ctx: any = { globalThis };
vm.createContext(ctx);
vm.runInContext(sandboxSrc, ctx);
const translations = (globalThis as any).__TX__;

if (!translations || !translations.bg || !translations.en) {
  console.error(JSON.stringify({ ok: false, error: 'translations structure invalid' }, null, 2));
  process.exit(1);
}

function collectKeys(obj: any, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object') return [prefix.slice(1)];
  const keys: string[] = [];
  for (const k of Object.keys(obj)) {
    const next = prefix + '.' + k;
    keys.push(...collectKeys(obj[k], next));
  }
  return keys;
}

const bgKeys = new Set(collectKeys(translations.bg));
const enKeys = new Set(collectKeys(translations.en));

const missingInBg = [...enKeys].filter(k => !bgKeys.has(k));
const missingInEn = [...bgKeys].filter(k => !enKeys.has(k));

const report = {
  ok: missingInBg.length === 0 && missingInEn.length === 0,
  missingInBg,
  missingInEn,
  bgCount: bgKeys.size,
  enCount: enKeys.size,
  timestamp: new Date().toISOString()
};

console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exit(2);
