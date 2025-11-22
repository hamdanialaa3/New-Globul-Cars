// audit-env.js (JS runtime version)
const fs = require('fs');
const path = require('path');
const REQUIRED_KEYS = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID',
  'REACT_APP_RECAPTCHA_SITE_KEY',
  'REACT_APP_GOOGLE_MAPS_API_KEY'
];
const envPath = path.resolve(process.cwd(), '.env');
let content = '';
try { content = fs.readFileSync(envPath, 'utf8'); } catch (e) {
  console.error(JSON.stringify({ ok:false, error:'.env file not found', path: envPath }, null, 2));
  process.exit(1);
}
const lines = content.split(/\r?\n/).filter(l => l.trim() && !l.trim().startsWith('#'));
const kv = {};
for (const line of lines) {
  const idx = line.indexOf('=');
  if (idx === -1) continue;
  const key = line.slice(0, idx).trim();
  const value = line.slice(idx + 1).trim();
  kv[key] = value;
}
const missing = []; const empty = [];
for (const key of REQUIRED_KEYS) { if (!(key in kv)) missing.push(key); else if (!kv[key]) empty.push(key); }
const report = { ok: missing.length===0 && empty.length===0, required: REQUIRED_KEYS.length, present: Object.keys(kv).length, missing, empty, timestamp: new Date().toISOString() };
console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exit(2);
