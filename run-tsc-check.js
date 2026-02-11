const { execSync } = require('child_process');
const fs = require('fs');

try {
  const result = execSync('npx tsc --noEmit', { 
    encoding: 'utf8', 
    maxBuffer: 50 * 1024 * 1024,
    cwd: __dirname,
    timeout: 600000,
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=8192' }
  });
  fs.writeFileSync('tsc-result.txt', 'NO ERRORS\n' + result, 'utf8');
} catch (e) {
  const output = (e.stdout || '') + '\n' + (e.stderr || '');
  fs.writeFileSync('tsc-result.txt', output, 'utf8');
}
console.log('Done - check tsc-result.txt');
