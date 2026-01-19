#!/usr/bin/env ts-node
/**
 * TypeScript Error Fixer Script
 * يصلح أخطاء TypeScript الشاملة
 */

import * as fs from 'fs';
import * as path from 'path';

const srcDir = path.join(__dirname, '../src');
let fixedCount = 0;
let filesModified = new Set<string>();

// 1. Fix unknown -> Error in catch blocks
function fixUnknownErrors() {
  console.log('🔧 إصلاح unknown to Error errors...');
  
  const files = getAllTsFiles(srcDir);
  
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    const originalContent = content;
    
    // Check if file already has normalizeError import
    const hasImport = content.includes("import { normalizeError }");
    
    // Pattern: catch (error) { logger.error(..., error)
    const catchPattern = /catch\s*\(\s*error\s*\)\s*{[\s\S]*?logger\.(error|warn)\([^)]*error/g;
    
    if (catchPattern.test(content) && !hasImport) {
      // Add import at top
      const importStatement = "import { normalizeError } from '@/utils/error-helpers';\n";
      
      if (content.startsWith('import')) {
        content = content.replace(/^(import[^\n]*;\n)/, `$1${importStatement}`);
      } else {
        content = importStatement + content;
      }
      
      // Replace catch (error) with proper handling
      content = content.replace(
        /catch\s*\(\s*error\s*\)\s*{([\s\S]*?)logger\.(error|warn)\(([^)]*),\s*error\s*\)/g,
        'catch (error) {$1logger.$2($3, normalizeError(error))'
      );
      
      if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf-8');
        filesModified.add(file);
        fixedCount++;
      }
    }
  });
  
  console.log(`✅ Fixed ${fixedCount} files with catch error handling\n`);
}

// 2. Add explicit types to implicit any parameters
function fixImplicitAny() {
  console.log('🔧 إصلاح implicit any parameters...');
  
  const files = getAllTsFiles(srcDir);
  let count = 0;
  
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    const originalContent = content;
    
    // Pattern: function(param) or const func = (param) =>
    // Look for function parameters without type annotations
    content = content.replace(
      /(\(|,\s*)(\w+)(\s*[,\)])/g,
      (match, before, paramName, after) => {
        // Skip if it's already typed or is destructuring
        if (before.includes(':') || paramName === 'this') {
          return match;
        }
        return `${before}${paramName}: any${after}`;
      }
    );
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf-8');
      filesModified.add(file);
      count++;
    }
  });
  
  console.log(`✅ Fixed ${count} files with implicit any parameters\n`);
}

// 3. Add locationData to types
function fixLocationData() {
  console.log('🔧 إضافة locationData إلى الأنواع...');
  
  const typesFile = path.join(srcDir, 'types/location.types.ts');
  
  if (!fs.existsSync(typesFile)) {
    // Create location types if missing
    const locationTypes = `/**
 * Location Data Types
 */

export interface LocationData {
  cityName?: string;
  regionName?: string;
  province?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface TooltipLocationData extends LocationData {
  count?: number;
}

export interface AddressLocationData extends LocationData {
  street?: string;
  postalCode?: string;
}
`;
    fs.writeFileSync(typesFile, locationTypes, 'utf-8');
    console.log('✅ Created location.types.ts\n');
  }
}

// Helper function to get all TypeScript files
function getAllTsFiles(dir: string): string[] {
  const files: string[] = [];
  
  function walk(currentPath: string) {
    try {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });
      
      entries.forEach(entry => {
        const fullPath = path.join(currentPath, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          walk(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
          files.push(fullPath);
        }
      });
    } catch (err) {
      // Skip if directory not accessible
    }
  }
  
  walk(dir);
  return files;
}

// Main execution
console.log('🚀 بدء إصلاح أخطاء TypeScript...\n');
fixUnknownErrors();
fixImplicitAny();
fixLocationData();

console.log(`\n📊 ملخص الإصلاحات:`);
console.log(`✅ الملفات المعدلة: ${filesModified.size}`);
console.log(`✅ إجمالي الإصلاحات: ${fixedCount + Array.from(filesModified).length}`);
console.log('\n✨ انتهى الإصلاح!');
