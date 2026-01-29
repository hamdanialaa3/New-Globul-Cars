/**
 * Translation Coverage Checker
 * Ensures all text strings have both BG and EN translations
 * Part of Project-Specific Safety Guards
 */

import * as fs from 'fs';
import * as path from 'path';

interface TranslationKey {
  key: string;
  file: string;
  line: number;
  hasBG: boolean;
  hasEN: boolean;
}

class TranslationChecker {
  private translationsPath = './src/locales/translations.ts';
  private translations: any = {};
  private missingKeys: TranslationKey[] = [];
  private usedKeys = new Set<string>();
  
  check(): void {
    console.log('Checking translation coverage...\n');
    
    this.loadTranslations();
    this.scanSourceFiles('./src');
    this.findMissingTranslations();
    this.generateReport();
    
    if (this.missingKeys.length > 0) {
      console.error(`\nFAILED: Found ${this.missingKeys.length} missing translations!`);
      process.exit(1);
    } else {
      console.log('\n✅ All translations present!');
    }
  }
  
  private loadTranslations(): void {
    try {
      const content = fs.readFileSync(this.translationsPath, 'utf8');
      
      const bgMatch = content.match(/bg:\s*{([^}]+)}/s);
      const enMatch = content.match(/en:\s*{([^}]+)}/s);
      
      if (bgMatch) {
        this.translations.bg = this.parseTranslationObject(bgMatch[1]);
      }
      
      if (enMatch) {
        this.translations.en = this.parseTranslationObject(enMatch[1]);
      }
      
      console.log(`Loaded ${Object.keys(this.translations.bg || {}).length} BG keys`);
      console.log(`Loaded ${Object.keys(this.translations.en || {}).length} EN keys`);
      
    } catch (error) {
      console.error('Error loading translations:', error);
      process.exit(1);
    }
  }
  
  private parseTranslationObject(content: string): Record<string, any> {
    const result: Record<string, any> = {};
    const keyRegex = /(\w+):\s*['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = keyRegex.exec(content)) !== null) {
      result[match[1]] = match[2];
    }
    
    return result;
  }
  
  private scanSourceFiles(dir: string): void {
    if (!fs.existsSync(dir)) return;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!this.shouldSkip(entry.name)) {
          this.scanSourceFiles(fullPath);
        }
      } else if (this.isReactFile(entry.name)) {
        this.checkFile(fullPath);
      }
    }
  }
  
  private shouldSkip(name: string): boolean {
    return ['node_modules', 'build', 'dist', '.git', 'DDD', '__tests__'].includes(name);
  }
  
  private isReactFile(name: string): boolean {
    return name.endsWith('.tsx') || name.endsWith('.ts');
  }
  
  private checkFile(filePath: string): void {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        const tCallRegex = /\.t\(['"]([^'"]+)['"]\)/g;
        let match;
        
        while ((match = tCallRegex.exec(line)) !== null) {
          const key = match[1];
          this.usedKeys.add(key);
          
          const hasBG = this.translations.bg && key in this.translations.bg;
          const hasEN = this.translations.en && key in this.translations.en;
          
          if (!hasBG || !hasEN) {
            this.missingKeys.push({
              key,
              file: this.relativePath(filePath),
              line: index + 1,
              hasBG,
              hasEN
            });
          }
        }
      });
      
    } catch (error) {
      // Skip
    }
  }
  
  private findMissingTranslations(): void {
    // Additional check: keys in translations but never used
    const bgKeys = Object.keys(this.translations.bg || {});
    const enKeys = Object.keys(this.translations.en || {});
    
    const unusedBG = bgKeys.filter(k => !this.usedKeys.has(k));
    const unusedEN = enKeys.filter(k => !this.usedKeys.has(k));
    
    if (unusedBG.length > 0 || unusedEN.length > 0) {
      console.warn(`\nWARNING: Found unused translation keys:`);
      if (unusedBG.length > 0) console.warn(`  BG: ${unusedBG.length} keys`);
      if (unusedEN.length > 0) console.warn(`  EN: ${unusedEN.length} keys`);
    }
  }
  
  private generateReport(): void {
    if (this.missingKeys.length === 0) {
      console.log('\n✅ Translation coverage: 100%');
      console.log(`   Used keys: ${this.usedKeys.size}`);
      return;
    }
    
    const report = {
      totalUsedKeys: this.usedKeys.size,
      missingCount: this.missingKeys.length,
      missing: this.missingKeys
    };
    
    fs.writeFileSync(
      'logs/translation-coverage-report.json',
      JSON.stringify(report, null, 2)
    );
    
    console.error('\n❌ Translation Coverage Issues:');
    console.error(`   Total keys used: ${this.usedKeys.size}`);
    console.error(`   Missing translations: ${this.missingKeys.length}`);
    console.error('\n   Details:');
    
    this.missingKeys.forEach(item => {
      const missing = [];
      if (!item.hasBG) missing.push('BG');
      if (!item.hasEN) missing.push('EN');
      console.error(`     ${item.file}:${item.line} - Key "${item.key}" missing ${missing.join(', ')}`);
    });
    
    console.error('\n   See: logs/translation-coverage-report.json');
  }
  
  private relativePath(fullPath: string): string {
    return fullPath.replace(process.cwd() + path.sep, '').replace(/\\/g, '/');
  }
}

// Execute
const checker = new TranslationChecker();
checker.check();

