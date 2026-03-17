/**
 * Per-Phase Metrics Reporter
 * Generates comprehensive metrics report after each phase
 * Part of Quality Assurance Process
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface PhaseMetrics {
  phase: string;
  timestamp: string;
  metrics: {
    services: {
      total: number;
      change: number;
      percentage: string;
    };
    codeLines: {
      total: number;
      change: number;
      percentage: string;
    };
    buildTime: {
      seconds: number;
      change: number;
      percentage: string;
    };
    bundleSize: {
      mb: number;
      change: number;
      percentage: string;
    };
    typeScriptErrors: number;
    testCoverage: {
      percentage: number;
      change: number;
    };
    consoleLogs: number;
    todos: number;
    deprecated: number;
  };
  circularDependencies: number;
  filesMovedToDDD: number;
  testsPass: boolean;
  buildSuccess: boolean;
}

class PhaseMetricsReporter {
  private phaseName: string;
  private baselinePath = 'logs/phase0-preparation/baseline-latest.json';
  private baseline: any = null;
  
  constructor(phaseName: string) {
    this.phaseName = phaseName;
  }
  
  async generate(): Promise<void> {
    console.log(`\nGenerating metrics report for ${this.phaseName}...\n`);
    
    this.loadBaseline();
    const metrics = await this.collectMetrics();
    this.saveReport(metrics);
    this.printSummary(metrics);
  }
  
  private loadBaseline(): void {
    if (fs.existsSync(this.baselinePath)) {
      this.baseline = JSON.parse(fs.readFileSync(this.baselinePath, 'utf8'));
      console.log('Baseline loaded for comparison\n');
    } else {
      console.warn('No baseline found - this will be the new baseline\n');
    }
  }
  
  private async collectMetrics(): Promise<PhaseMetrics> {
    const servicesCount = this.countServices();
    const codeLines = this.countCodeLines();
    const consoleLogs = this.countConsoleLogs();
    const todos = this.countTodos();
    const deprecated = this.countDeprecated();
    const circular = this.checkCircularDeps();
    
    return {
      phase: this.phaseName,
      timestamp: new Date().toISOString(),
      metrics: {
        services: {
          total: servicesCount,
          change: this.baseline ? servicesCount - this.baseline.files.services : 0,
          percentage: this.baseline ? this.calcPercentage(servicesCount, this.baseline.files.services) : '0%'
        },
        codeLines: {
          total: codeLines,
          change: this.baseline ? codeLines - this.baseline.codeMetrics.totalLines : 0,
          percentage: this.baseline ? this.calcPercentage(codeLines, this.baseline.codeMetrics.totalLines) : '0%'
        },
        buildTime: {
          seconds: 0, // Placeholder
          change: 0,
          percentage: '0%'
        },
        bundleSize: {
          mb: 0, // Placeholder
          change: 0,
          percentage: '0%'
        },
        typeScriptErrors: this.countTypeScriptErrors(),
        testCoverage: {
          percentage: 0, // Placeholder
          change: 0
        },
        consoleLogs,
        todos,
        deprecated
      },
      circularDependencies: circular,
      filesMovedToDDD: this.countDDDFiles(),
      testsPass: this.runTests(),
      buildSuccess: this.checkBuild()
    };
  }
  
  private countServices(): number {
    let count = 0;
    this.walkDirectory('./src/services', (file) => {
      if (file.includes('service')) {
        count++;
      }
    });
    return count;
  }
  
  private countCodeLines(): number {
    let total = 0;
    this.walkDirectory('./src', (file) => {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const content = fs.readFileSync(file, 'utf8');
        total += content.split('\n').length;
      }
    });
    return total;
  }
  
  private countConsoleLogs(): number {
    let count = 0;
    this.walkDirectory('./src', (file) => {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const content = fs.readFileSync(file, 'utf8');
        const matches = content.match(/console\.(log|warn|error|debug|info)/g);
        if (matches) count += matches.length;
      }
    });
    return count;
  }
  
  private countTodos(): number {
    let count = 0;
    this.walkDirectory('./src', (file) => {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const content = fs.readFileSync(file, 'utf8');
        const matches = content.match(/\/\/\s*(TODO|FIXME|HACK|XXX)/gi);
        if (matches) count += matches.length;
      }
    });
    return count;
  }
  
  private countDeprecated(): number {
    let count = 0;
    this.walkDirectory('./src', (file) => {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const content = fs.readFileSync(file, 'utf8');
        const matches = content.match(/@deprecated|DEPRECATED/gi);
        if (matches) count += matches.length;
      }
    });
    return count;
  }
  
  private checkCircularDeps(): number {
    const reportPath = 'logs/phase0-preparation/circular-dependencies.json';
    if (fs.existsSync(reportPath)) {
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      return report.totalCycles || 0;
    }
    return 0;
  }
  
  private countDDDFiles(): number {
    if (!fs.existsSync('../DDD')) return 0;
    let count = 0;
    this.walkDirectory('../DDD', () => count++);
    return count;
  }
  
  private countTypeScriptErrors(): number {
    try {
      execSync('npm run build', { stdio: 'pipe' });
      return 0;
    } catch (error) {
      return 1;
    }
  }
  
  private runTests(): boolean {
    try {
      execSync('npm test -- --passWithNoTests', { stdio: 'pipe' });
      return true;
    } catch (error) {
      return false;
    }
  }
  
  private checkBuild(): boolean {
    try {
      execSync('npm run build', { stdio: 'pipe' });
      return true;
    } catch (error) {
      return false;
    }
  }
  
  private saveReport(metrics: PhaseMetrics): void {
    const reportDir = `logs/phase-reports`;
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const reportPath = `${reportDir}/${this.phaseName}-metrics.json`;
    fs.writeFileSync(reportPath, JSON.stringify(metrics, null, 2));
    
    console.log(`\nReport saved to: ${reportPath}`);
  }
  
  private printSummary(metrics: PhaseMetrics): void {
    console.log('\n' + '='.repeat(60));
    console.log(`PHASE METRICS REPORT: ${this.phaseName}`);
    console.log('='.repeat(60));
    
    console.log('\nServices:');
    console.log(`  Total: ${metrics.metrics.services.total}`);
    console.log(`  Change: ${metrics.metrics.services.change} (${metrics.metrics.services.percentage})`);
    
    console.log('\nCode Lines:');
    console.log(`  Total: ${metrics.metrics.codeLines.total.toLocaleString()}`);
    console.log(`  Change: ${metrics.metrics.codeLines.change.toLocaleString()} (${metrics.metrics.codeLines.percentage})`);
    
    console.log('\nCode Quality:');
    console.log(`  Console.log: ${metrics.metrics.consoleLogs}`);
    console.log(`  TODOs: ${metrics.metrics.todos}`);
    console.log(`  DEPRECATED: ${metrics.metrics.deprecated}`);
    console.log(`  TypeScript Errors: ${metrics.metrics.typeScriptErrors}`);
    
    console.log('\nHealth:');
    console.log(`  Build: ${metrics.buildSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Tests: ${metrics.testsPass ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Circular Deps: ${metrics.circularDependencies}`);
    
    console.log('\nMigration:');
    console.log(`  Files moved to DDD: ${metrics.filesMovedToDDD}`);
    
    console.log('='.repeat(60));
  }
  
  private calcPercentage(current: number, baseline: number): string {
    const change = ((current - baseline) / baseline) * 100;
    return change.toFixed(1) + '%';
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
      } else {
        callback(fullPath);
      }
    }
  }
  
  private shouldSkip(name: string): boolean {
    return ['node_modules', 'build', 'dist', '.git'].includes(name);
  }
}

// Execute
const phaseName = process.argv[2] || 'unknown-phase';
const reporter = new PhaseMetricsReporter(phaseName);
reporter.generate();

