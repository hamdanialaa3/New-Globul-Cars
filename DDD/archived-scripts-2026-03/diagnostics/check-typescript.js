/**
 * TypeScript Type Check Script
 * فحص أخطاء TypeScript بعد تحديث Types
 */
const { execSync } = require('child_process');
const path = require('path');

console.log('🔍 Checking TypeScript compilation...\n');

const appDir = path.join(__dirname, '..');

try {
  // Run TypeScript compiler in no-emit mode
  const output = execSync('npx tsc --noEmit --pretty', {
    cwd: appDir,
    encoding: 'utf8',
    stdio: 'pipe'
  });
  
  console.log('✅ TypeScript compilation successful!');
  console.log('No type errors found.\n');
  
  console.log(JSON.stringify({
    ok: true,
    timestamp: new Date().toISOString(),
    errors: 0,
    message: 'All types are valid'
  }, null, 2));
  
} catch (error) {
  const output = error.stdout || error.stderr || error.message;
  
  // Parse errors
  const errorLines = output.split('\n').filter(line => 
    line.includes('error TS') || 
    line.includes('.ts(') ||
    line.includes('.tsx(')
  );
  
  console.log('❌ TypeScript compilation failed!\n');
  console.log(output);
  
  // Count unique files with errors
  const filesWithErrors = new Set();
  errorLines.forEach(line => {
    const match = line.match(/([^(]+)\(/);
    if (match) {
      filesWithErrors.add(match[1]);
    }
  });
  
  console.log('\n📊 Summary:');
  console.log(`Total errors: ${errorLines.filter(l => l.includes('error TS')).length}`);
  console.log(`Files with errors: ${filesWithErrors.size}`);
  
  console.log('\n' + JSON.stringify({
    ok: false,
    timestamp: new Date().toISOString(),
    errors: errorLines.filter(l => l.includes('error TS')).length,
    filesWithErrors: filesWithErrors.size,
    files: Array.from(filesWithErrors)
  }, null, 2));
  
  process.exit(1);
}
