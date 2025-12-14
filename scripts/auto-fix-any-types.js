#!/usr/bin/env node
/**
 * Automatic 'any' Type Fixer
 * Replaces common 'any' types with proper TypeScript types
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const SRC_DIR = path.join(__dirname, '../bulgarian-car-marketplace/src');

// Smart replacements based on context
const TYPE_REPLACEMENTS = [
  // Error types
  {
    from: /catch\s*\(\s*error:\s*any\s*\)/g,
    to: 'catch (error: unknown)',
    description: 'Catch block errors'
  },
  // Event handlers
  {
    from: /\(e:\s*any\)\s*=>/g,
    to: '(e: React.ChangeEvent<HTMLInputElement>) =>',
    description: 'Input change events'
  },
  {
    from: /\(event:\s*any\)\s*=>/g,
    to: '(event: React.FormEvent) =>',
    description: 'Form events'
  },
  // Function parameters
  {
    from: /\(data:\s*any\)/g,
    to: '(data: unknown)',
    description: 'Generic data parameters'
  },
  {
    from: /\(value:\s*any\)/g,
    to: '(value: unknown)',
    description: 'Generic value parameters'
  },
  {
    from: /\(item:\s*any\)/g,
    to: '(item: unknown)',
    description: 'Generic item parameters'
  },
  // Response types
  {
    from: /:\s*any\[\]/g,
    to: ': unknown[]',
    description: 'Any arrays'
  },
  // Object types
  {
    from: /:\s*any\s*=/g,
    to: ': Record<string, unknown> =',
    description: 'Object assignments'
  },
  // Firestore documents
  {
    from: /doc\.data\(\)\s*as\s*any/g,
    to: 'doc.data() as DocumentData',
    description: 'Firestore document data'
  },
  // Props
  {
    from: /props:\s*any/g,
    to: 'props: Record<string, unknown>',
    description: 'Component props'
  }
];

let totalFixed = 0;
let filesModified = 0;

function needsImports(content, fixes) {
  const imports = new Set();
  
  if (fixes.includes('React.ChangeEvent') || fixes.includes('React.FormEvent')) {
    if (!content.includes("import React from 'react'") && !content.includes("import * as React from 'react'")) {
      imports.add("import React from 'react';");
    }
  }
  
  if (fixes.includes('DocumentData')) {
    if (!content.includes('DocumentData')) {
      imports.add("import { DocumentData } from 'firebase/firestore';");
    }
  }
  
  return Array.from(imports);
}

function addImports(content, imports) {
  if (imports.length === 0) return content;
  
  const lines = content.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) {
      lastImportIndex = i;
    }
  }
  
  if (lastImportIndex !== -1) {
    imports.forEach(imp => {
      lines.splice(lastImportIndex + 1, 0, imp);
    });
    return lines.join('\n');
  }
  
  return imports.join('\n') + '\n\n' + content;
}

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fixCount = 0;
    const appliedFixes = [];
    
    // Apply all replacements
    TYPE_REPLACEMENTS.forEach(replacement => {
      const matches = content.match(replacement.from);
      if (matches && matches.length > 0) {
        content = content.replace(replacement.from, replacement.to);
        fixCount += matches.length;
        modified = true;
        appliedFixes.push(replacement.to);
      }
    });
    
    // Add necessary imports
    if (modified) {
      const imports = needsImports(content, appliedFixes);
      content = addImports(content, imports);
      
      fs.writeFileSync(filePath, content, 'utf8');
      filesModified++;
      totalFixed += fixCount;
      console.log(`✅ Fixed ${fixCount} 'any' types in: ${path.relative(SRC_DIR, filePath)}`);
    }
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🔧 Starting automatic any type fixes...\n');
  
  // Find all TS/TSX files
  const files = glob.sync('**/*.{ts,tsx}', {
    cwd: SRC_DIR,
    absolute: true,
    ignore: ['**/*.test.ts', '**/*.test.tsx', '**/node_modules/**', '**/types/**']
  });
  
  console.log(`📁 Found ${files.length} files to scan\n`);
  
  files.forEach(fixFile);
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ COMPLETE!`);
  console.log(`📊 Files modified: ${filesModified}`);
  console.log(`🔧 Total fixes: ${totalFixed}`);
  console.log('='.repeat(50));
}

main();
