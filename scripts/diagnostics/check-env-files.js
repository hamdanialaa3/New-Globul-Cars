/**
 * Pre-commit Security Check
 * 
 * Prevents accidental commit of sensitive environment files.
 * Run automatically by Husky before each commit.
 */

const fs = require('fs');
const path = require('path');

const FORBIDDEN_FILES = [
  '.env.backup',
  '.env.facebook',
  '.env.production',
  '.env.local'  // Should only be in local development
];

const FORBIDDEN_PATTERNS = [
  /\.pem$/,
  /\.key$/,
  /\.p12$/,
  /\.pfx$/,
  /secrets\.json$/,
  /credentials\.json$/
];

let hasIssues = false;

console.log('🔍 Running security checks...\n');

// Check for forbidden files
FORBIDDEN_FILES.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.error(`❌ ERROR: ${file} should not be committed!`);
    hasIssues = true;
  }
});

// Check for forbidden patterns in staged files
try {
  const { execSync } = require('child_process');
  const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf-8' })
    .split('\n')
    .filter(Boolean);

  stagedFiles.forEach(file => {
    FORBIDDEN_PATTERNS.forEach(pattern => {
      if (pattern.test(file)) {
        console.error(`❌ ERROR: ${file} matches forbidden pattern (${pattern})!`);
        hasIssues = true;
      }
    });
  });
} catch (error) {
  // Git command failed - might not be in a git repo
  console.warn('⚠️  Could not check staged files');
}

if (hasIssues) {
  console.error('\n🚨 Security check FAILED!');
  console.error('\n📝 To fix:');
  console.error('   1. Remove files: git rm --cached ' + FORBIDDEN_FILES.join(' '));
  console.error('   2. Ensure .gitignore is up to date');
  console.error('   3. NEVER commit API keys or credentials\n');
  process.exit(1);
}

console.log('✅ Security check passed - no sensitive files detected\n');
process.exit(0);
