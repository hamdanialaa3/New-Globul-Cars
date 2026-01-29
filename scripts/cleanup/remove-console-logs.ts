/**
 * Console.log Cleanup Script
 * Replaces all console.log with logger service
 * Phase 4.1 - Code Quality
 */

import * as fs from 'fs';
import * as path from 'path';

interface CleanupResult {
  filesScanned: number;
  filesModified: number;
  consoleLogsRemoved: number;
  errors: string[];
}

class ConsoleLogCleaner {
  private result: CleanupResult = {
    filesScanned: 0,
    filesModified: 0,
    consoleLogsRemoved: 0,
    errors: []
  };
  
  clean(): CleanupResult {
    console.log('Starting console.log cleanup...\n');
    
    this.walkDirectory('./src');
    this.printSummary();
    this.saveReport();
    
    return this.result;
  }
  
  private walkDirectory(dir: string): void {
    if (!fs.existsSync(dir)) return;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!this.shouldSkip(entry.name)) {
          this.walkDirectory(fullPath);
        }
      } else if (this.isTypeScriptFile(entry.name)) {
        this.cleanFile(fullPath);
      }
    }
  }
  
  private shouldSkip(name: string): boolean {
    return ['node_modules', 'build', 'dist', '.git', 'DDD', '__tests__'].includes(name);
  }
  
  private isTypeScriptFile(name: string): boolean {
    return name.endsWith('.ts') || name.endsWith('.tsx');
  }
  
  private cleanFile(filePath: string): void {
    this.result.filesScanned++;
    
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let removals = 0;
      
      // Skip if it's the logger service itself
      if (filePath.includes('logger-service') || filePath.includes('logger-wrapper')) {
        return;
      }
      
      // Replace console.log
      const patterns = [
        { old: /console\.log\(/g, new: 'logger.debug(' },
        { old: /console\.error\(/g, new: 'logger.error(' },
        { old: /console\.warn\(/g, new: 'logger.warn(' },
        { old: /console\.info\(/g, new: 'logger.info(' },
        { old: /console\.debug\(/g, new: 'logger.debug(' }
      ];
      
      patterns.forEach(pattern => {
        const matches = content.match(pattern.old);
        if (matches) {
          content = content.replace(pattern.old, pattern.new);
          removals += matches.length;
        }
      });
      
      if (removals > 0) {
        // Add logger import if needed
        if (!content.includes("from '@/services/logger-service'") &&
            !content.includes("from '../services/logger-service'") &&
            !content.includes("from '../../services/logger-service'") &&
            !content.includes("from '../../../services/logger-service'")) {
          // Add import at top
          const lines = content.split('\n');
          let insertIndex = 0;
          
          // Find first import
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('import ')) {
              insertIndex = i + 1;
              break;
            }
          }
          
          if (insertIndex > 0) {
            lines.splice(insertIndex, 0, "import { logger } from '@/services/logger-service';");
            content = lines.join('\n');
          }
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
        this.result.filesModified++;
        this.result.consoleLogsRemoved += removals;
        
        console.log(`✅ ${this.relativePath(filePath)} (${removals} console statements replaced)`);
      }
      
    } catch (error) {
      const errorMsg = `Error cleaning ${filePath}: ${error}`;
      this.result.errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
    }
  }
  
  private relativePath(fullPath: string): string {
    return fullPath.replace(process.cwd() + path.sep, '').replace(/\\/g, '/');
  }
  
  private printSummary(): void {
    console.log('\n' + '='.repeat(60));
    console.log('CONSOLE.LOG CLEANUP SUMMARY');
    console.log('='.repeat(60));
    console.log(`Files scanned: ${this.result.filesScanned}`);
    console.log(`Files modified: ${this.result.filesModified}`);
    console.log(`Console statements replaced: ${this.result.consoleLogsRemoved}`);
    console.log(`Errors: ${this.result.errors.length}`);
    console.log('='.repeat(60));
  }
  
  private saveReport(): void {
    const reportDir = 'logs/phase4-cleanup';
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(
      `${reportDir}/console-log-cleanup-report.json`,
      JSON.stringify(this.result, null, 2)
    );
    
    console.log(`\nReport saved to: ${reportDir}/console-log-cleanup-report.json`);
  }
}

// Execute
const cleaner = new ConsoleLogCleaner();
const result = cleaner.clean();

if (result.errors.length > 0) {
  process.exit(1);
}

