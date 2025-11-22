/**
 * check-translations-direct.ts
 * استيراد مباشر للكائن translations بدون eval لمقارنة المفاتيح بين bg و en.
 */
// استخدام require لتفادي مشاكل ESM في ts-node مع الامتدادات
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { translations } = require('../src/locales/translations');

function collectKeys(obj: any, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object') return [prefix.slice(1)];
  const keys: string[] = [];
  for (const k of Object.keys(obj)) {
    keys.push(...collectKeys(obj[k], prefix + '.' + k));
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

export {}; // اجبار TypeScript على اعتبار الملف وحدة
