/**
 * check-provider-order.ts
 * يتحقق من ترتيب المزودين الحرج داخل App.tsx.
 * التسلسل المطلوب: ThemeProvider > GlobalStyles > LanguageProvider > CustomThemeProvider > AuthProvider > ProfileTypeProvider > ToastProvider > GoogleReCaptchaProvider > Router
 */
import * as fs from 'fs';
import * as path from 'path';

const appPath = path.resolve(process.cwd(), 'src', 'App.tsx');
const src = fs.readFileSync(appPath, 'utf8');

// ابحث عن أول ظهور لكل عنصر بترتيبه داخل الملف.
const targets = [
  '<ThemeProvider',
  '<GlobalStyles',
  '<LanguageProvider>',
  '<CustomThemeProvider>',
  '<AuthProvider>',
  '<ProfileTypeProvider>',
  '<ToastProvider>',
  '<GoogleReCaptchaProvider',
  '<Router>'
];

const positions: Record<string, number> = {};
for (const t of targets) {
  positions[t] = src.indexOf(t);
}

const ordered = targets.every((t, i) => i === 0 || positions[targets[i - 1]] <= positions[t]);
const report = { ok: ordered, positions, timestamp: new Date().toISOString() };
console.log(JSON.stringify(report, null, 2));
if (!ordered) process.exit(2);
