/**
 * Import Dependency Analyzer
 * Analyzes all imports in the project and generates comprehensive reports
 * Part of Pre-Phase 0 preparation
 */

import * as fs from 'fs';
import * as path from 'path';

interface FileImport {
  file: string;
  imports: Array<{
    module: string;
    namedImports: string[];
    defaultImport?: string;
    isRelative: boolean;
    line: number;
  }>;
  importedBy: string[];
  exports: string[];
  lineCount: number;
}

class ImportAnalyzer {
  private fileMap = new Map<string, FileImport>();
  private circularDeps: string[][] = [];
  
  analyze(directory: string): void {
    console.log(`Starting import analysis for: ${directory}\n`);
    
    this.scanDirectory(directory);
    this.buildReverseMap();
    this.detectCircularDependencies();
    this.generateReports();
    
    console.log('\n✅ Import analysis complete!');
  }
  
  private scanDirectory(dir: string): void {
    if (!fs.existsSync(dir)) {
      console.error(`Directory not found: ${dir}`);
      return;
    }
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!this.shouldSkipDirectory(entry.name)) {
          this.scanDirectory(fullPath);
        }
      } else if (this.isTypeScriptFile(entry.name)) {
        this.analyzeFile(fullPath);
      }
    }
  }
  
  private shouldSkipDirectory(name: string): boolean {
    const skipDirs = ['node_modules', 'build', 'dist', '.git', 'DDD'];
    return skipDirs.includes(name);
  }
  
  private isTypeScriptFile(name: string): boolean {
    return name.endsWith('.ts') || name.endsWith('.tsx');
  }
  
  private analyzeFile(filePath: string): void {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const imports = this.extractImports(content);
      const exports = this.extractExports(content);
      const lineCount = content.split('\n').length;
      
      this.fileMap.set(filePath, {
        file: filePath,
        imports,
        importedBy: [],
        exports,
        lineCount
      });
    } catch (error) {
      console.error(`Error analyzing file ${filePath}:`, error);
    }
  }
  
  private extractImports(content: string): any[] {
    const imports: any[] = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Match: import { a, b } from 'module'
      const namedMatch = /import\s*{\s*([^}]+)\s*}\s*from\s*['"]([^'"]+)['"]/g.exec(line);
      if (namedMatch) {
        imports.push({
          module: namedMatch[2],
          namedImports: namedMatch[1].split(',').map(s => s.trim()),
          isRelative: namedMatch[2].startsWith('.'),
          line: i + 1
        });
        continue;
      }
      
      // Match: import DefaultExport from 'module'
      const defaultMatch = /import\s+(\w+)\s+from\s*['"]([^'"]+)['"]/g.exec(line);
      if (defaultMatch) {
        imports.push({
          module: defaultMatch[2],
          namedImports: [],
          defaultImport: defaultMatch[1],
          isRelative: defaultMatch[2].startsWith('.'),
          line: i + 1
        });
        continue;
      }
      
      // Match: import * as Name from 'module'
      const namespaceMatch = /import\s*\*\s*as\s+(\w+)\s+from\s*['"]([^'"]+)['"]/g.exec(line);
      if (namespaceMatch) {
        imports.push({
          module: namespaceMatch[2],
          namedImports: [`* as ${namespaceMatch[1]}`],
          isRelative: namespaceMatch[2].startsWith('.'),
          line: i + 1
        });
      }
    }
    
    return imports;
  }
  
  private extractExports(content: string): string[] {
    const exports: string[] = [];
    const exportRegex = /export\s+(?:default\s+)?(?:class|function|const|interface|type|enum)\s+(\w+)/g;
    let match;
    
    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }
    
    return exports;
  }
  
  private buildReverseMap(): void {
    this.fileMap.forEach((data, file) => {
      data.imports.forEach(imp => {
        if (imp.isRelative) {
          const resolvedPath = this.resolveImport(file, imp.module);
          if (resolvedPath && this.fileMap.has(resolvedPath)) {
            this.fileMap.get(resolvedPath)!.importedBy.push(file);
          }
        }
      });
    });
  }
  
  private resolveImport(fromFile: string, importPath: string): string | null {
    const baseDir = path.dirname(fromFile);
    const resolved = path.resolve(baseDir, importPath);
    
    const extensions = ['.ts', '.tsx', '/index.ts', '/index.tsx'];
    for (const ext of extensions) {
      const fullPath = resolved + ext;
      if (this.fileMap.has(fullPath)) {
        return fullPath;
      }
    }
    
    return null;
  }
  
  private detectCircularDependencies(): void {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const dfs = (file: string, path: string[]): void => {
      visited.add(file);
      recursionStack.add(file);
      
      const data = this.fileMap.get(file);
      if (!data) return;
      
      for (const imp of data.imports) {
        if (!imp.isRelative) continue;
        
        const targetFile = this.resolveImport(file, imp.module);
        if (!targetFile) continue;
        
        if (!visited.has(targetFile)) {
          dfs(targetFile, [...path, file]);
        } else if (recursionStack.has(targetFile)) {
          const cycleStart = path.indexOf(targetFile);
          if (cycleStart >= 0) {
            const cycle = [...path.slice(cycleStart), file, targetFile];
            this.circularDeps.push(cycle);
          }
        }
      }
      
      recursionStack.delete(file);
    };
    
    this.fileMap.forEach((_, file) => {
      if (!visited.has(file)) {
        dfs(file, []);
      }
    });
  }
  
  private generateReports(): void {
    this.ensureLogsDirectory();
    
    // Main report
    this.generateMainReport();
    
    // Circular dependencies report
    this.generateCircularDepsReport();
    
    // Most/Least imported files
    this.generatePopularityReport();
    
    // Orphan files report
    this.generateOrphanFilesReport();
    
    // Large files report
    this.generateLargeFilesReport();
  }
  
  private ensureLogsDirectory(): void {
    const logsDir = 'logs/phase0-preparation';
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }
  
  private generateMainReport(): void {
    const fileDetails = Array.from(this.fileMap.entries()).map(([file, data]) => ({
      file: this.relativePath(file),
      lineCount: data.lineCount,
      importCount: data.imports.length,
      importedByCount: data.importedBy.length,
      exportCount: data.exports.length,
      imports: data.imports.map(i => i.module),
      exports: data.exports
    }));
    
    const report = {
      generatedAt: new Date().toISOString(),
      totalFiles: this.fileMap.size,
      totalLines: fileDetails.reduce((sum, f) => sum + f.lineCount, 0),
      averageImportsPerFile: this.average(fileDetails.map(f => f.importCount)),
      averageExportsPerFile: this.average(fileDetails.map(f => f.exportCount)),
      averageLinesPerFile: this.average(fileDetails.map(f => f.lineCount)),
      files: fileDetails
    };
    
    fs.writeFileSync(
      'logs/phase0-preparation/import-analysis-main.json',
      JSON.stringify(report, null, 2)
    );
    
    console.log(`\nMain Report:`);
    console.log(`  Total files: ${report.totalFiles}`);
    console.log(`  Total lines: ${report.totalLines.toLocaleString()}`);
    console.log(`  Avg imports/file: ${report.averageImportsPerFile.toFixed(2)}`);
    console.log(`  Avg exports/file: ${report.averageExportsPerFile.toFixed(2)}`);
    console.log(`  Avg lines/file: ${report.averageLinesPerFile.toFixed(0)}`);
  }
  
  private generateCircularDepsReport(): void {
    if (this.circularDeps.length === 0) {
      console.log(`\n✅ No circular dependencies found!`);
      return;
    }
    
    const report = {
      totalCycles: this.circularDeps.length,
      cycles: this.circularDeps.map(cycle => 
        cycle.map(f => this.relativePath(f))
      )
    };
    
    fs.writeFileSync(
      'logs/phase0-preparation/circular-dependencies.json',
      JSON.stringify(report, null, 2)
    );
    
    console.log(`\n⚠️  WARNING: Found ${this.circularDeps.length} circular dependencies!`);
    console.log(`   See: logs/phase0-preparation/circular-dependencies.json`);
  }
  
  private generatePopularityReport(): void {
    const files = Array.from(this.fileMap.entries())
      .map(([file, data]) => ({
        file: this.relativePath(file),
        importedByCount: data.importedBy.length,
        importedBy: data.importedBy.map(f => this.relativePath(f))
      }))
      .sort((a, b) => b.importedByCount - a.importedByCount);
    
    const mostImported = files.slice(0, 20);
    const leastImported = files.filter(f => f.importedByCount > 0)
      .slice(-20)
      .reverse();
    
    fs.writeFileSync(
      'logs/phase0-preparation/most-imported-files.json',
      JSON.stringify({ files: mostImported }, null, 2)
    );
    
    fs.writeFileSync(
      'logs/phase0-preparation/least-imported-files.json',
      JSON.stringify({ files: leastImported }, null, 2)
    );
    
    console.log(`\nMost imported files (top 5):`);
    mostImported.slice(0, 5).forEach((f, i) => {
      console.log(`  ${i + 1}. ${f.file} (${f.importedByCount} imports)`);
    });
  }
  
  private generateOrphanFilesReport(): void {
    const orphans = Array.from(this.fileMap.entries())
      .filter(([_, data]) => data.importedBy.length === 0)
      .map(([file, _]) => this.relativePath(file));
    
    fs.writeFileSync(
      'logs/phase0-preparation/orphan-files.json',
      JSON.stringify({ count: orphans.length, files: orphans }, null, 2)
    );
    
    console.log(`\nOrphan files (not imported anywhere): ${orphans.length}`);
    if (orphans.length > 0 && orphans.length <= 10) {
      orphans.forEach(f => console.log(`  - ${f}`));
    }
  }
  
  private generateLargeFilesReport(): void {
    const largeFiles = Array.from(this.fileMap.entries())
      .filter(([_, data]) => data.lineCount > 300)
      .map(([file, data]) => ({
        file: this.relativePath(file),
        lines: data.lineCount,
        needsSplit: data.lineCount > 500
      }))
      .sort((a, b) => b.lines - a.lines);
    
    fs.writeFileSync(
      'logs/phase0-preparation/large-files.json',
      JSON.stringify({ 
        count: largeFiles.length,
        criticalCount: largeFiles.filter(f => f.needsSplit).length,
        files: largeFiles 
      }, null, 2)
    );
    
    console.log(`\nLarge files (>300 lines): ${largeFiles.length}`);
    console.log(`  Critical (>500 lines): ${largeFiles.filter(f => f.needsSplit).length}`);
  }
  
  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  }
  
  private relativePath(fullPath: string): string {
    return fullPath.replace(process.cwd() + path.sep, '').replace(/\\/g, '/');
  }
}

// Execute
const analyzer = new ImportAnalyzer();
analyzer.analyze('./src');

