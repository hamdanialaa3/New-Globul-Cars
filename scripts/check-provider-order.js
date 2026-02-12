// check-provider-order.js (JS runtime version)
const fs = require('fs');
const path = require('path');
const appPath = path.resolve(process.cwd(), 'src', 'App.tsx');
const src = fs.readFileSync(appPath, 'utf8');
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
const positions = {}; targets.forEach(t => positions[t] = src.indexOf(t));
const ordered = targets.every((t,i) => i===0 || positions[targets[i-1]] <= positions[t]);
const report = { ok: ordered, positions, timestamp: new Date().toISOString() };
console.log(JSON.stringify(report, null, 2));
if (!ordered) process.exit(2);
