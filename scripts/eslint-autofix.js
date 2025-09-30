#!/usr/bin/env node
/**
 * ESLint Auto-Fixer Script for Bulgarian Car Marketplace
 * Automatically fixes common ESLint issues and unused variables
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Starting Auto-Fix for ESLint Issues...\n');

// Step 1: Run ESLint with auto-fix
console.log('📝 Running ESLint auto-fix...');
try {
  execSync('npx eslint src/**/*.{tsx,ts,jsx,js} --fix', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('✅ ESLint auto-fix completed\n');
} catch (error) {
  console.log('⚠️  ESLint auto-fix completed with some remaining issues\n');
}

// Step 2: Fix common import issues
console.log('📦 Fixing common import issues...');

const fixCommonImports = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Remove unused React imports when only using JSX
  if (content.includes('import React') && !content.includes('React.')) {
    content = content.replace(/import React,\s*{/, 'import {');
    content = content.replace(/import React\s*from\s*['"]react['"];\s*\n/, '');
    modified = true;
  }

  // Remove unused useEffect imports
  if (content.includes('useEffect') && !content.includes('useEffect(')) {
    content = content.replace(/,\s*useEffect/, '');
    content = content.replace(/useEffect,\s*/, '');
    content = content.replace(/{\s*useEffect\s*}/, '{}');
    modified = true;
  }

  // Fix empty import statements
  content = content.replace(/import\s*{\s*}\s*from.*;\s*\n/g, '');

  if (modified) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
};

// Get all TypeScript/JavaScript files
const getAllFiles = (dir, extensions = ['.tsx', '.ts', '.jsx', '.js']) => {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...getAllFiles(fullPath, extensions));
    } else if (extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
};

const srcFiles = getAllFiles('./src');
let fixedFiles = 0;

srcFiles.forEach(file => {
  if (fixCommonImports(file)) {
    fixedFiles++;
  }
});

console.log(`✅ Fixed imports in ${fixedFiles} files\n`);

// Step 3: Remove unused styled components
console.log('🎨 Checking for unused styled components...');

const fixUnusedStyledComponents = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Find styled components that are defined but never used
  const styledComponentRegex = /const\s+(\w+)\s*=\s*styled\.[\w.]+`[^`]*`;?\s*\n/g;
  const matches = [...content.matchAll(styledComponentRegex)];
  
  for (const match of matches) {
    const componentName = match[1];
    const componentRegex = new RegExp(`<${componentName}[^>]*>|</${componentName}>`, 'g');
    
    // If component is not used in JSX, comment it out
    if (!componentRegex.test(content)) {
      content = content.replace(match[0], `// Unused styled component: ${componentName}\n// ${match[0].replace(/\n/g, '\n// ')}`);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
};

let styledComponentsFixed = 0;
srcFiles.forEach(file => {
  if (fixUnusedStyledComponents(file)) {
    styledComponentsFixed++;
  }
});

console.log(`✅ Commented out unused styled components in ${styledComponentsFixed} files\n`);

// Step 4: Generate summary report
console.log('📊 Generating summary report...');

try {
  const lintOutput = execSync('npx eslint src/**/*.{tsx,ts,jsx,js} --format json', { 
    encoding: 'utf8',
    cwd: process.cwd()
  });
  
  const results = JSON.parse(lintOutput);
  const totalErrors = results.reduce((sum, result) => sum + result.errorCount, 0);
  const totalWarnings = results.reduce((sum, result) => sum + result.warningCount, 0);
  const filesWithIssues = results.filter(result => result.errorCount > 0 || result.warningCount > 0).length;

  console.log('📈 Final ESLint Summary:');
  console.log(`   Files with issues: ${filesWithIssues}`);
  console.log(`   Total errors: ${totalErrors}`);
  console.log(`   Total warnings: ${totalWarnings}`);
  
  if (totalErrors === 0 && totalWarnings === 0) {
    console.log('🎉 All ESLint issues have been resolved!');
  } else {
    console.log('\n📋 Remaining issues need manual review:');
    
    results.forEach(result => {
      if (result.errorCount > 0 || result.warningCount > 0) {
        console.log(`\n📄 ${result.filePath.replace(process.cwd(), '.')}`);
        result.messages.forEach(message => {
          const type = message.severity === 2 ? '❌' : '⚠️';
          console.log(`   ${type} Line ${message.line}: ${message.message}`);
        });
      }
    });
  }

} catch (error) {
  console.log('⚠️  Could not generate detailed summary');
}

console.log('\n🎯 Auto-fix process completed!');
console.log('🔍 Review the changes and test your application.');