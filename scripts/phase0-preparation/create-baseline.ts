/**
 * Baseline Creator
 * Creates performance and build baselines for comparison
 * Part of Pre-Phase 0 preparation
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface Baseline {
  timestamp: string;
  git: {
    branch: string;
    commit: string;
    tag?: string;
  };
  files: {
    total: number;
    typescript: number;
    services: number;
    components: number;
    pages: number;
  };
  codeMetrics: {
    totalLines: number;
    totalFiles: number;
    averageLinesPerFile: number;
    filesOver300Lines: number;
    filesOver500Lines: number;
  };
  dependencies: {
    production: number;
    development: number;
    total: number;
  };
}

class BaselineCreator {
  private baseline: Partial<Baseline> = {};
  
  create(): void {
    console.log('Creating project baseline...\n');
    
    this.ensureLogsDirectory();
    this.captureTimestamp();
    this.captureGitInfo();
    this.countFiles();
    this.analyzeCodeMetrics();
    this.analyzeDependencies();
    this.saveBaseline();
    
    console.log('\n✅ Baseline created successfully!');
  }
  
  private ensureLogsDirectory(): void {
    const logsDir = 'logs/phase0-preparation';
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }
  
  private captureTimestamp(): void {
    this.baseline.timestamp = new Date().toISOString();
    console.log(`Timestamp: ${this.baseline.timestamp}`);
  }
  
  private captureGitInfo(): void {
    try {
      const branch = this.execCommand('git rev-parse --abbrev-ref HEAD');
      const commit = this.execCommand('git rev-parse HEAD');
      
      this.baseline.git = {
        branch: branch.trim(),
        commit: commit.trim().substring(0, 8)
      };
      
      console.log(`Git: ${this.baseline.git.branch} @ ${this.baseline.git.commit}`);
    } catch (error) {
      console.warn('Could not capture Git info');
      this.baseline.git = {
        branch: 'unknown',
        commit: 'unknown'
      };
    }
  }
  
  private countFiles(): void {
    const counts = {
      total: 0,
      typescript: 0,
      services: 0,
      components: 0,
      pages: 0
    };
    
    this.walkDirectory('./src', (filePath) => {
      counts.total++;
      
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        counts.typescript++;
      }
      
      if (filePath.includes('/services/') && filePath.includes('service')) {
        counts.services++;
      }
      
      if (filePath.includes('/components/')) {
        counts.components++;
      }
      
      if (filePath.includes('/pages/')) {
        counts.pages++;
      }
    });
    
    this.baseline.files = counts;
    console.log(`\nFile counts:`);
    console.log(`  Total: ${counts.total}`);
    console.log(`  TypeScript: ${counts.typescript}`);
    console.log(`  Services: ${counts.services}`);
    console.log(`  Components: ${counts.components}`);
    console.log(`  Pages: ${counts.pages}`);
  }
  
  private analyzeCodeMetrics(): void {
    let totalLines = 0;
    let fileCount = 0;
    let filesOver300 = 0;
    let filesOver500 = 0;
    
    this.walkDirectory('./src', (filePath) => {
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const lines = content.split('\n').length;
          
          totalLines += lines;
          fileCount++;
          
          if (lines > 300) filesOver300++;
          if (lines > 500) filesOver500++;
        } catch (error) {
          // Skip
        }
      }
    });
    
    this.baseline.codeMetrics = {
      totalLines,
      totalFiles: fileCount,
      averageLinesPerFile: Math.round(totalLines / fileCount),
      filesOver300Lines: filesOver300,
      filesOver500Lines: filesOver500
    };
    
    console.log(`\nCode metrics:`);
    console.log(`  Total lines: ${totalLines.toLocaleString()}`);
    console.log(`  Files: ${fileCount}`);
    console.log(`  Avg lines/file: ${this.baseline.codeMetrics.averageLinesPerFile}`);
    console.log(`  Files >300 lines: ${filesOver300}`);
    console.log(`  Files >500 lines: ${filesOver500}`);
  }
  
  private analyzeDependencies(): void {
    try {
      const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
      
      const prodCount = Object.keys(packageJson.dependencies || {}).length;
      const devCount = Object.keys(packageJson.devDependencies || {}).length;
      
      this.baseline.dependencies = {
        production: prodCount,
        development: devCount,
        total: prodCount + devCount
      };
      
      console.log(`\nDependencies:`);
      console.log(`  Production: ${prodCount}`);
      console.log(`  Development: ${devCount}`);
      console.log(`  Total: ${prodCount + devCount}`);
    } catch (error) {
      console.warn('Could not analyze dependencies');
      this.baseline.dependencies = {
        production: 0,
        development: 0,
        total: 0
      };
    }
  }
  
  private saveBaseline(): void {
    const filename = `logs/phase0-preparation/baseline-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(this.baseline, null, 2));
    
    // Also save as latest
    fs.writeFileSync(
      'logs/phase0-preparation/baseline-latest.json',
      JSON.stringify(this.baseline, null, 2)
    );
    
    console.log(`\nBaseline saved to:`);
    console.log(`  ${filename}`);
    console.log(`  logs/phase0-preparation/baseline-latest.json`);
  }
  
  private walkDirectory(dir: string, callback: (filePath: string) => void): void {
    if (!fs.existsSync(dir)) return;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!this.shouldSkip(entry.name)) {
          this.walkDirectory(fullPath, callback);
        }
      } else {
        callback(fullPath);
      }
    }
  }
  
  private shouldSkip(name: string): boolean {
    return ['node_modules', 'build', 'dist', '.git', 'DDD'].includes(name);
  }
  
  private execCommand(command: string): string {
    try {
      return execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    } catch (error) {
      return '';
    }
  }
}

// Execute
const creator = new BaselineCreator();
creator.create();

