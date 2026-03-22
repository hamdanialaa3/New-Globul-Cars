/**
 * Provider Stack Order Checker
 * Ensures App.tsx provider order remains unchanged
 * Part of Project-Specific Safety Guards
 */

import * as fs from 'fs';

const REQUIRED_PROVIDER_ORDER = [
  'ThemeProvider',
  'GlobalStyles',
  'LanguageProvider',
  'AuthProvider',
  'ProfileTypeProvider',
  'ToastProvider',
  'GoogleReCaptchaProvider',
  'Router'
];

class ProviderStackChecker {
  private appTsxPath = './src/App.tsx';
  
  check(): boolean {
    console.log('Checking Provider Stack Order in App.tsx...\n');
    
    const content = fs.readFileSync(this.appTsxPath, 'utf8');
    const currentOrder = this.extractProviderOrder(content);
    
    const isValid = this.validateOrder(currentOrder);
    
    if (isValid) {
      console.log('✅ Provider stack order is correct!');
      return true;
    } else {
      console.error('❌ Provider stack order has changed!');
      console.error('\nRequired order:');
      REQUIRED_PROVIDER_ORDER.forEach((p, i) => console.error(`  ${i + 1}. ${p}`));
      console.error('\nCurrent order:');
      currentOrder.forEach((p, i) => console.error(`  ${i + 1}. ${p}`));
      return false;
    }
  }
  
  private extractProviderOrder(content: string): string[] {
    const order: string[] = [];
    const lines = content.split('\n');
    
    REQUIRED_PROVIDER_ORDER.forEach(provider => {
      const index = lines.findIndex(line => line.includes(`<${provider}`));
      if (index !== -1) {
        order.push(provider);
      }
    });
    
    return order;
  }
  
  private validateOrder(currentOrder: string[]): boolean {
    if (currentOrder.length !== REQUIRED_PROVIDER_ORDER.length) {
      return false;
    }
    
    for (let i = 0; i < REQUIRED_PROVIDER_ORDER.length; i++) {
      if (currentOrder[i] !== REQUIRED_PROVIDER_ORDER[i]) {
        return false;
      }
    }
    
    return true;
  }
}

// Execute
const checker = new ProviderStackChecker();
const isValid = checker.check();

if (!isValid) {
  process.exit(1);
}

