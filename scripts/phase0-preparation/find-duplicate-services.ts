/**
 * Duplicate Services Finder
 * Identifies duplicate and similar services that need consolidation
 * Part of Pre-Phase 0 preparation
 */

import * as fs from 'fs';
import * as path from 'path';

interface ServiceInfo {
  file: string;
  name: string;
  functions: string[];
  imports: string[];
  lineCount: number;
  usageCount: number;
  usedIn: string[];
}

class DuplicateServicesFinder {
  private services = new Map<string, ServiceInfo>();
  private allFiles: string[] = [];
  
  analyze(directory: string): void {
    console.log(`Finding duplicate services in: ${directory}\n`);
    
    this.findAllServices(directory);
    this.countServiceUsage(directory);
    this.findDuplicates();
    this.generateReport();
    
    console.log('\n✅ Duplicate services analysis complete!');
  }
  
  private findAllServices(dir: string): void {
    if (!fs.existsSync(dir)) return;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!this.shouldSkip(entry.name)) {
          this.findAllServices(fullPath);
        }
      } else if (this.isServiceFile(entry.name)) {
        this.analyzeService(fullPath);
      } else if (this.isTypeScriptFile(entry.name)) {
        this.allFiles.push(fullPath);
      }
    }
  }
  
  private shouldSkip(name: string): boolean {
    return ['node_modules', 'build', 'dist', '.git', 'DDD', '__tests__'].includes(name);
  }
  
  private isServiceFile(name: string): boolean {
    return name.endsWith('.service.ts') || name.endsWith('.service.tsx') || 
           name.endsWith('-service.ts') || name.endsWith('-service.tsx');
  }
  
  private isTypeScriptFile(name: string): boolean {
    return name.endsWith('.ts') || name.endsWith('.tsx');
  }
  
  private analyzeService(filePath: string): void {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const functions = this.extractFunctions(content);
      const imports = this.extractImports(content);
      const lineCount = content.split('\n').length;
      const name = path.basename(filePath, path.extname(filePath));
      
      this.services.set(filePath, {
        file: filePath,
        name,
        functions,
        imports,
        lineCount,
        usageCount: 0,
        usedIn: []
      });
    } catch (error) {
      console.error(`Error analyzing service ${filePath}:`, error);
    }
  }
  
  private extractFunctions(content: string): string[] {
    const functions: string[] = [];
    
    // Extract function declarations
    const funcRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g;
    let match;
    while ((match = funcRegex.exec(content)) !== null) {
      functions.push(match[1]);
    }
    
    // Extract class methods
    const methodRegex = /(?:async\s+)?(\w+)\s*\([^)]*\)\s*:\s*(?:Promise<)?/g;
    while ((match = methodRegex.exec(content)) !== null) {
      if (!['constructor', 'render'].includes(match[1])) {
        functions.push(match[1]);
      }
    }
    
    // Extract arrow functions
    const arrowRegex = /export\s+const\s+(\w+)\s*=\s*(?:async\s*)?\(/g;
    while ((match = arrowRegex.exec(content)) !== null) {
      functions.push(match[1]);
    }
    
    return [...new Set(functions)];
  }
  
  private extractImports(content: string): string[] {
    const imports: string[] = [];
    const importRegex = /import\s+.*\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }
  
  private countServiceUsage(dir: string): void {
    for (const file of this.allFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        this.services.forEach((service, servicePath) => {
          const serviceName = service.name;
          const regex = new RegExp(`from ['"].*${serviceName}`, 'g');
          const matches = content.match(regex);
          
          if (matches && matches.length > 0) {
            service.usageCount += matches.length;
            service.usedIn.push(file);
          }
        });
      } catch (error) {
        // Skip
      }
    }
  }
  
  private findDuplicates(): void {
    const grouped = new Map<string, ServiceInfo[]>();
    
    // Group by similar function names
    this.services.forEach((service) => {
      const key = this.generateSimilarityKey(service);
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(service);
    });
    
    // Find groups with multiple services (potential duplicates)
    const duplicates = Array.from(grouped.entries())
      .filter(([_, services]) => services.length > 1)
      .map(([key, services]) => ({
        similarityKey: key,
        services: services.map(s => ({
          file: this.relativePath(s.file),
          name: s.name,
          functions: s.functions,
          lineCount: s.lineCount,
          usageCount: s.usageCount,
          usedInCount: s.usedIn.length
        }))
      }));
    
    if (duplicates.length > 0) {
      fs.writeFileSync(
        'logs/phase0-preparation/duplicate-services.json',
        JSON.stringify({ count: duplicates.length, groups: duplicates }, null, 2)
      );
      
      console.log(`\n⚠️  Found ${duplicates.length} groups of potentially duplicate services!`);
      duplicates.forEach((group, i) => {
        console.log(`\n  Group ${i + 1}:`);
        group.services.forEach(s => {
          console.log(`    - ${s.file} (${s.lineCount} lines, ${s.usageCount} usages)`);
        });
      });
    }
  }
  
  private generateSimilarityKey(service: ServiceInfo): string {
    // Create a key based on common function name patterns
    const commonFunctions = service.functions
      .filter(f => ['get', 'create', 'update', 'delete', 'fetch', 'save'].some(prefix => 
        f.toLowerCase().startsWith(prefix)
      ))
      .sort()
      .join(',');
    
    return commonFunctions || 'other';
  }
  
  private generateReport(): void {
    const allServices = Array.from(this.services.values());
    
    const unused = allServices.filter(s => s.usageCount === 0);
    const lowUsage = allServices.filter(s => s.usageCount > 0 && s.usageCount < 3);
    const highUsage = allServices.filter(s => s.usageCount >= 10).sort((a, b) => b.usageCount - a.usageCount);
    
    const report = {
      generatedAt: new Date().toISOString(),
      totalServices: allServices.length,
      unusedServices: unused.length,
      lowUsageServices: lowUsage.length,
      highUsageServices: highUsage.length,
      unused: unused.map(s => ({
        file: this.relativePath(s.file),
        name: s.name,
        lineCount: s.lineCount,
        functions: s.functions
      })),
      lowUsage: lowUsage.map(s => ({
        file: this.relativePath(s.file),
        name: s.name,
        usageCount: s.usageCount,
        usedIn: s.usedIn.map(f => this.relativePath(f))
      })),
      highUsage: highUsage.slice(0, 20).map(s => ({
        file: this.relativePath(s.file),
        name: s.name,
        usageCount: s.usageCount,
        usedInCount: s.usedIn.length
      }))
    };
    
    fs.writeFileSync(
      'logs/phase0-preparation/services-usage-report.json',
      JSON.stringify(report, null, 2)
    );
    
    console.log(`\nServices Usage Report:`);
    console.log(`  Total services: ${report.totalServices}`);
    console.log(`  Unused services: ${report.unusedServices}`);
    console.log(`  Low usage (<3): ${report.lowUsageServices}`);
    console.log(`  High usage (>=10): ${report.highUsageServices}`);
    
    if (unused.length > 0) {
      console.log(`\n  Unused services can be moved to DDD/`);
    }
  }
  
  private relativePath(fullPath: string): string {
    return fullPath.replace(process.cwd() + path.sep, '').replace(/\\/g, '/');
  }
}

// Execute
const finder = new DuplicateServicesFinder();
finder.analyze('./src');

