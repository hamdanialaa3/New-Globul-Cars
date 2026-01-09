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
    // ✅ FIX: Only match console.* that are NOT in comments or strings
    // Match console.* that are actual code (not in // comments, /* */ comments, or strings)
    const lines = content.split('\n');
    const codeMatches = [];
    let inMultiLineComment = false;
    let inString = false;
    let stringChar = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let inLineString = false;
      let inLineStringChar = null;
      
      // Simple check: if line contains console.* and it's not clearly in a comment
      // This is a simplified check - for production, consider using a proper parser
      if (line.match(/\bconsole\.(log|error|warn|debug|info)\b/)) {
        // Check if it's in a comment (// or /* */)
        const commentIndex = line.indexOf('//');
        const multiLineStart = line.indexOf('/*');
        const multiLineEnd = line.indexOf('*/');
        
        // Check if console.* appears before any // comment
        const consoleMatch = line.match(/\bconsole\.(log|error|warn|debug|info)\b/);
        if (consoleMatch) {
          const consoleIndex = consoleMatch.index;
          const hasCommentBefore = commentIndex !== -1 && commentIndex < consoleIndex;
          const hasMultiLineComment = multiLineStart !== -1 && multiLineStart < consoleIndex;
          
          // Skip if it's clearly in a comment or in a markdown code block
          if (!hasCommentBefore && !hasMultiLineComment && !line.trim().startsWith('*') && !line.includes('```')) {
            const match = line.match(/\bconsole\.(log|error|warn|debug|info)\b/g);
            if (match) codeMatches.push(...match);
          }
        }
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
