#!/usr/bin/env node

/**
 * Security Audit Script
 * Scans the codebase for exposed API keys, secrets, and sensitive information
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Patterns to search for (common API key patterns)
const dangerousPatterns = [
  { name: 'Firebase API Key', regex: /AIza[0-9A-Za-z_-]{35}/, severity: 'high' },
  { name: 'Stripe Secret Key', regex: /sk_(live|test)_[0-9a-zA-Z]{24,}/, severity: 'critical' },
  { name: 'Stripe Public Key', regex: /pk_(live|test)_[0-9a-zA-Z]{24,}/, severity: 'medium' },
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/, severity: 'critical' },
  { name: 'Generic Secret', regex: /(secret|password|passwd|pwd)[\s]*=[\s]*["'][^"']+["']/i, severity: 'medium' },
  { name: 'Generic API Key', regex: /api[_-]?key[\s]*=[\s]*["'][^"']+["']/i, severity: 'medium' },
  { name: 'Bearer Token', regex: /bearer[\s]+[a-zA-Z0-9_\-\.=]+/i, severity: 'high' },
  { name: 'Private Key', regex: /-----BEGIN (RSA|OPENSSH|DSA|EC) PRIVATE KEY-----/, severity: 'critical' },
];

// Directories to scan
const dirsToScan = ['src', 'public', 'scripts'];

// Files to exclude
const excludePatterns = [
  /node_modules/,
  /\.git/,
  /build/,
  /dist/,
  /coverage/,
  /\.env\.example/,
  /\.env\.template/,
  /security-audit\.js/,
  /\.test\./,
  /\.spec\./,
  /__tests__/,
  /__mocks__/,
];

let issuesFound = 0;
let filesScanned = 0;

function shouldExclude(filePath) {
  return excludePatterns.some(pattern => pattern.test(filePath));
}

function scanFile(filePath) {
  if (shouldExclude(filePath)) {
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    filesScanned++;

    dangerousPatterns.forEach(({ name, regex, severity }) => {
      const matches = content.match(new RegExp(regex, 'g'));
      if (matches) {
        const lines = content.split('\n');
        matches.forEach(match => {
          const lineNumber = lines.findIndex(line => line.includes(match)) + 1;
          
          // Check if it's in a comment explaining what should be added
          const line = lines[lineNumber - 1];
          if (line.includes('placeholder') || 
              line.includes('your_') || 
              line.includes('example') ||
              line.includes('TODO:') ||
              line.includes('FIXME:')) {
            return; // Skip placeholders
          }

          issuesFound++;
          const severityColor = severity === 'critical' ? colors.red : 
                               severity === 'high' ? colors.yellow : 
                               colors.blue;
          
          console.log(`\n${severityColor}[${severity.toUpperCase()}]${colors.reset} ${name} detected`);
          console.log(`  File: ${colors.blue}${filePath}${colors.reset}`);
          console.log(`  Line: ${lineNumber}`);
          console.log(`  Match: ${colors.yellow}${match.substring(0, 50)}...${colors.reset}`);
        });
      }
    });
  } catch (error) {
    // Skip files that can't be read
  }
}

function scanDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  const items = fs.readdirSync(dirPath);

  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!shouldExclude(fullPath)) {
        scanDirectory(fullPath);
      }
    } else if (stat.isFile()) {
      // Only scan source code and config files
      if (/\.(js|jsx|ts|tsx|json|yml|yaml)$/.test(item)) {
        scanFile(fullPath);
      }
    }
  });
}

console.log(`${colors.blue}╔════════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.blue}║     Security Audit - Exposed Secrets      ║${colors.reset}`);
console.log(`${colors.blue}╚════════════════════════════════════════════╝${colors.reset}\n`);

// Scan each directory
dirsToScan.forEach(dir => {
  console.log(`Scanning directory: ${colors.green}${dir}${colors.reset}`);
  scanDirectory(dir);
});

console.log(`\n${colors.blue}════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.green}Files scanned: ${filesScanned}${colors.reset}`);

if (issuesFound === 0) {
  console.log(`${colors.green}✓ No exposed secrets found!${colors.reset}`);
  console.log(`${colors.blue}════════════════════════════════════════════${colors.reset}\n`);
  process.exit(0);
} else {
  console.log(`${colors.red}✗ ${issuesFound} potential issue(s) found!${colors.reset}`);
  console.log(`${colors.blue}════════════════════════════════════════════${colors.reset}\n`);
  console.log(`${colors.yellow}⚠ WARNING: Exposed secrets detected in your codebase!${colors.reset}`);
  console.log(`${colors.yellow}Please review the findings above and:${colors.reset}`);
  console.log(`  1. Remove hardcoded secrets from source code`);
  console.log(`  2. Use environment variables instead`);
  console.log(`  3. Add sensitive files to .gitignore`);
  console.log(`  4. If secrets were committed, rotate them immediately\n`);
  
  process.exit(1);
}
