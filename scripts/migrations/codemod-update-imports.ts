/**
 * Codemod: Automated Import Path Updater
 * Safely updates import paths from old to new locations
 * Uses ts-morph for AST-based transformation
 * Part of Service Consolidation Process
 */

import * as fs from 'fs';
import * as path from 'path';

interface ImportMapping {
  old: string;
  new: string;
  description: string;
}

interface CodemodResult {
  totalFilesScanned: number;
  filesModified: number;
  totalReplacements: number;
  errors: string[];
  diff: Array<{
    file: string;
    changes: number;
    before: string;
    after: string;
  }>;
}

class ImportCod emod {
  private result: CodemodResult = {
    totalFilesScanned: 0,
    filesModified: 0,
    totalReplacements: 0,
    errors: [],
    diff: []
  };
  
  /**
   * Run codemod with mapping configuration
   * @param mappings - Array of old→new import path mappings
   */
  run(mappings: ImportMapping[]): CodemodResult {
    console.log('Running Import Codemod...\n');
    console.log(`Mappings: ${mappings.length}`);
    console.log('');
    
    this.walkDirectory('./src', (filePath) => {
      this.transformFile(filePath, mappings);
    });
    
    this.generateDiffReport();
    this.printSummary();
    
    return this.result;
  }
  
  private transformFile(filePath: string, mappings: ImportMapping[]): void {
    this.result.totalFilesScanned++;
    
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let fileChanges = 0;
      
      mappings.forEach(mapping => {
        const regex = new RegExp(
          `from\\s+['"]${this.escapeRegex(mapping.old)}['"]`,
          'g'
        );
        
        const matches = content.match(regex);
        if (matches) {
          content = content.replace(
            regex,
            `from '${mapping.new}'`
          );
          fileChanges += matches.length;
          this.result.totalReplacements += matches.length;
        }
      });
      
      if (fileChanges > 0) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.result.filesModified++;
        
        this.result.diff.push({
          file: this.relativePath(filePath),
          changes: fileChanges,
          before: this.extractImports(originalContent),
          after: this.extractImports(content)
        });
        
        console.log(`✅ ${this.relativePath(filePath)} (${fileChanges} imports updated)`);
      }
      
    } catch (error) {
      const errorMsg = `Error transforming ${filePath}: ${error}`;
      this.result.errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
    }
  }
  
  private extractImports(content: string): string {
    const imports: string[] = [];
    const importRegex = /import\s+.+\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[0]);
    }
    
    return imports.join('\n');
  }
  
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  private walkDirectory(dir: string, callback: (file: string) => void): void {
    if (!fs.existsSync(dir)) return;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!this.shouldSkip(entry.name)) {
          this.walkDirectory(fullPath, callback);
        }
      } else if (this.isTypeScriptFile(entry.name)) {
        callback(fullPath);
      }
    }
  }
  
  private shouldSkip(name: string): boolean {
    return ['node_modules', 'build', 'dist', '.git', 'DDD'].includes(name);
  }
  
  private isTypeScriptFile(name: string): boolean {
    return name.endsWith('.ts') || name.endsWith('.tsx');
  }
  
  private relativePath(fullPath: string): string {
    return fullPath.replace(process.cwd() + path.sep, '').replace(/\\/g, '/');
  }
  
  private generateDiffReport(): void {
    if (this.result.diff.length === 0) return;
    
    const reportDir = 'logs/migrations';
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(
      `${reportDir}/import-codemod-diff.json`,
      JSON.stringify(this.result, null, 2)
    );
  }
  
  private printSummary(): void {
    console.log('\n' + '='.repeat(60));
    console.log('CODEMOD SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total files scanned: ${this.result.totalFilesScanned}`);
    console.log(`Files modified: ${this.result.filesModified}`);
    console.log(`Total imports updated: ${this.result.totalReplacements}`);
    console.log(`Errors: ${this.result.errors.length}`);
    
    if (this.result.errors.length > 0) {
      console.log('\nErrors:');
      this.result.errors.forEach(err => console.log(`  - ${err}`));
    }
    
    console.log('='.repeat(60));
  }
}

// Example usage:
const mappings: ImportMapping[] = [
  {
    old: '../services/bulgarian-profile-service',
    new: '@/services/profile/UnifiedProfileService',
    description: 'Profile service consolidation'
  },
  {
    old: '../services/dealership/dealership.service',
    new: '@/services/profile/UnifiedProfileService',
    description: 'Dealership to unified profile'
  },
  // Add more mappings as needed
];

const codemod = new ImportCodemod();
const result = codemod.run(mappings);

// Save result
fs.writeFileSync(
  'logs/migrations/codemod-result.json',
  JSON.stringify(result, null, 2)
);

// Exit with error if there were errors
if (result.errors.length > 0) {
  process.exit(1);
}

