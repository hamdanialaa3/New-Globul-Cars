/**
 * scan-legacy-location-fields.ts
 * يبحث عن استخدام الحقول القديمة location / city / region خارج النموذج الموحد locationData.
 */
import * as fs from 'fs';
import * as path from 'path';

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, acc); else if (/\.(tsx?|js)$/.test(entry)) acc.push(full);
  }
  return acc;
}

const srcDir = path.resolve(process.cwd(), 'src');
const files = walk(srcDir);
const matches: { file: string; lines: number[]; field: string }[] = [];
const legacy = ['location:', 'city:', 'region:'];

for (const file of files) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, idx) => {
    for (const f of legacy) {
      if (line.includes(f) && !line.includes('locationData')) {
        matches.push({ file, lines: [idx + 1], field: f });
      }
    }
  });
}

const report = { ok: matches.length === 0, count: matches.length, matches, timestamp: new Date().toISOString() };
console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exitCode = 2;
