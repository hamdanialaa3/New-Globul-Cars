// scan-realtime-cleanup.js (JS runtime version)
const fs = require('fs');
const path = require('path');
function walk(dir, acc=[]) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, acc); else if (/\.(tsx?|js)$/.test(entry)) acc.push(full);
  }
  return acc;
}
const srcDir = path.resolve(process.cwd(), 'src');
const files = walk(srcDir);
const issues = [];
for (const file of files) {
  const code = fs.readFileSync(file, 'utf8');
  if (code.includes('socketService') && code.includes('useEffect(')) {
    const effectBlocks = code.split('useEffect(').slice(1);
    for (const block of effectBlocks) {
      const hasSocket = /socketService\./.test(block);
      const hasCleanup = /return\s*\(/.test(block) || /return\s*()=>/.test(block);
      if (hasSocket && !hasCleanup) issues.push({ file, snippet: block.substring(0,200) });
    }
  }
}
const report = { ok: issues.length===0, count: issues.length, issues, timestamp: new Date().toISOString() };
console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exit(2);
