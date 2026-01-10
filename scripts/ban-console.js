// Ban console.* in production build within src (except logger-service)
// يمنع استخدام console.* في الإنتاج داخل src

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.resolve(__dirname, '../src');
const EXCLUDE_FILES = new Set([
  path.join(SRC_DIR, 'services', 'logger-service.ts'),
  path.join(SRC_DIR, 'scripts', 'migrate-legacy-cars.ts'), // CLI script - console output acceptable
  path.join(SRC_DIR, 'services', 'stories', 'test-story-flow.ts'), // Test script - console output acceptable
]);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return [full];
  });
}

function isSourceFile(file) {
  return /\.(ts|tsx|js|jsx)$/.test(file) 
    && !file.includes('__mocks__') 
    && !file.includes('__tests__')
    && !file.endsWith('.md') // Exclude markdown files
    && !file.endsWith('.mdx'); // Exclude mdx files
}

function run() {
  const env = process.env.NODE_ENV || 'development';
  if (env !== 'production') {
    console.log('[ban-console] Skipping (NODE_ENV != production)');
    return;
  }
  const files = walk(SRC_DIR).filter(isSourceFile).filter(f => !EXCLUDE_FILES.has(f));
  const offenders = [];
  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    const lines = content.split('\n');
    const codeMatches = [];
    let inMultiLineComment = false;
    let inString = false;
    let stringChar = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Skip empty lines
      if (!trimmed) continue;
      
      // Track multi-line comments
      if (trimmed.includes('/*')) {
        inMultiLineComment = true;
      }
      if (trimmed.includes('*/')) {
        inMultiLineComment = false;
        continue; // Skip the closing line itself
      }
      
      // Skip if we're inside a multi-line comment
      if (inMultiLineComment) continue;
      
      // Skip JSDoc comments (lines starting with /** or *)
      if (trimmed.startsWith('/**') || trimmed.startsWith('*')) continue;
      
      // Skip single-line comments
      if (trimmed.startsWith('//')) continue;
      
      // Skip markdown code blocks
      if (trimmed.includes('```')) continue;
      
      // Check for console.* in actual code
      const consoleMatch = line.match(/\bconsole\.(log|error|warn|debug|info)\b/);
      if (consoleMatch) {
        const consoleIndex = consoleMatch.index;
        
        // Check if console.* is after a // comment on the same line
        const commentIndex = line.indexOf('//');
        if (commentIndex !== -1 && commentIndex < consoleIndex) {
          continue; // It's in a comment
        }
        
        // Check if console.* is in a string (simple check)
        const beforeConsole = line.substring(0, consoleIndex);
        const singleQuotes = (beforeConsole.match(/'/g) || []).length;
        const doubleQuotes = (beforeConsole.match(/"/g) || []).length;
        const backticks = (beforeConsole.match(/`/g) || []).length;
        
        // If odd number of quotes before console, we're likely in a string
        if (singleQuotes % 2 !== 0 || doubleQuotes % 2 !== 0 || backticks % 2 !== 0) {
          continue; // Likely in a string
        }
        
        // This is actual code - flag it
        const match = line.match(/\bconsole\.(log|error|warn|debug|info)\b/g);
        if (match) codeMatches.push(...match);
      }
    }
    
    if (codeMatches.length > 0) {
      offenders.push({ file: f, matches: [...new Set(codeMatches)] });
    }
  }
  if (offenders.length) {
    console.error('[ban-console] Found console usage in production build:');
    for (const o of offenders) {
      console.error(` - ${o.file}: ${o.matches.join(', ')}`);
    }
    process.exit(1);
  } else {
    console.log('[ban-console] No console usage detected in src.');
  }
}

run();
