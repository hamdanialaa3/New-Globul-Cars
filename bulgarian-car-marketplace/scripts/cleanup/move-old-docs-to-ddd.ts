/**
 * Old Documentation Cleanup Script
 * Moves old duplicate documentation files to DDD
 * Phase 5 - Documentation Consolidation
 */

import * as fs from 'fs';
import * as path from 'path';

const OLD_DOCS_TO_MOVE = [
  'COMMIT_MESSAGE.txt',
  'COMMIT_MESSAGE_FINAL.txt',
  '✅ CRITICAL_FIXES_COMPLETE.md',
  '✅ EXECUTION_COMPLETE_62_PERCENT.md',
  '✅ FINAL_SUMMARY_AR.md',
  '🎉 PROJECT_COMPLETION_75_PERCENT.md',
  '🎯 NEXT_STEPS.md',
  '📊 FINAL_IMPLEMENTATION_REPORT_75_PERCENT.md',
  '📊 IMPLEMENTATION_SUMMARY.md',
  '📋 QUICK_START_GUIDE.md',
  '📌 README_IMPLEMENTATION.md',
  '📦 PROJECT_DELIVERABLES.md',
  '🔧 BUGFIX_AND_REFACTORING_PLAN.md'
];

class OldDocsCleanup {
  private movedCount = 0;
  private targetDir = 'DDD/old-docs-20251103';
  
  cleanup(): void {
    console.log('Moving old documentation files to DDD...\n');
    
    // Create target directory
    if (!fs.existsSync(this.targetDir)) {
      fs.mkdirSync(this.targetDir, { recursive: true });
    }
    
    OLD_DOCS_TO_MOVE.forEach(file => {
      this.moveFile(file);
    });
    
    this.createManifest();
    this.printSummary();
  }
  
  private moveFile(filename: string): void {
    const sourcePath = path.join('..', filename);
    const targetPath = path.join(this.targetDir, filename);
    
    if (fs.existsSync(sourcePath)) {
      try {
        // Copy to DDD
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`✅ Moved: ${filename}`);
        this.movedCount++;
        
        // Note: Not deleting yet - just documenting for manual review
      } catch (error) {
        console.error(`❌ Error moving ${filename}:`, error);
      }
    } else {
      console.log(`⚠️  Not found: ${filename}`);
    }
  }
  
  private createManifest(): void {
    const manifest = {
      movedAt: new Date().toISOString(),
      totalFiles: this.movedCount,
      files: OLD_DOCS_TO_MOVE,
      reason: 'Duplicate/outdated documentation - consolidated into REFACTORING/',
      newLocation: '📚 DOCUMENTATION/REFACTORING/',
      canRestore: true
    };
    
    fs.writeFileSync(
      path.join(this.targetDir, 'MANIFEST.json'),
      JSON.stringify(manifest, null, 2)
    );
  }
  
  private printSummary(): void {
    console.log('\n' + '='.repeat(60));
    console.log('OLD DOCS CLEANUP SUMMARY');
    console.log('='.repeat(60));
    console.log(`Files moved to DDD: ${this.movedCount}`);
    console.log(`Target directory: ${this.targetDir}`);
    console.log(`\nThese files are backed up and can be restored if needed.`);
    console.log('='.repeat(60));
  }
}

// Execute
const cleanup = new OldDocsCleanup();
cleanup.cleanup();

