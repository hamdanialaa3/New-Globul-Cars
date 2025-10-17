// Firebase Internal Error Diagnostic Tool
// Comprehensive error analysis for auth/internal-error

import { auth } from '../firebase/firebase-config';
import { GoogleAuthProvider } from 'firebase/auth';

export interface AuthDiagnosticResult {
  step: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: any;
  solution?: string | undefined;
}

export class FirebaseInternalErrorDiagnostic {
  private results: AuthDiagnosticResult[] = [];

  async runComprehensiveDiagnostic(): Promise<AuthDiagnosticResult[]> {
    this.results = [];
    
    console.log('🔍 بدء التشخيص الشامل لخطأ auth/internal-error...');
    
    // Test 1: Environment Variables
    await this.checkEnvironmentVariables();
    
    // Test 2: Firebase Configuration
    await this.checkFirebaseConfiguration();
    
    // Test 3: Browser Environment
    await this.checkBrowserEnvironment();
    
    // Test 4: Network Connectivity
    await this.checkNetworkConnectivity();
    
    // Test 5: Google Provider Configuration
    await this.checkGoogleProviderConfig();
    
    // Test 6: Domain Authorization
    await this.checkDomainAuthorization();
    
    // Test 7: API Key Validation
    await this.checkAPIKeyValidation();
    
    console.log('📊 نتائج التشخيص:', this.results);
    return this.results;
  }

  private async checkEnvironmentVariables(): Promise<void> {
    console.log('1️⃣ فحص متغيرات البيئة...');
    
    const requiredVars = [
      'REACT_APP_FIREBASE_API_KEY',
      'REACT_APP_FIREBASE_AUTH_DOMAIN',
      'REACT_APP_FIREBASE_PROJECT_ID'
    ];
    
    const missingVars: string[] = [];
    const presentVars: string[] = [];
    
    requiredVars.forEach(varName => {
      const value = process.env[varName];
      if (!value || value.trim() === '') {
        missingVars.push(varName);
      } else {
        presentVars.push(varName);
      }
    });
    
    if (missingVars.length === 0) {
      this.results.push({
        step: 'Environment Variables',
        status: 'success',
        message: 'جميع متغيرات البيئة المطلوبة موجودة',
        details: { presentVars }
      });
    } else {
      this.results.push({
        step: 'Environment Variables',
        status: 'error',
        message: `متغيرات البيئة مفقودة: ${missingVars.join(', ')}`,
        details: { missingVars, presentVars },
        solution: 'أضف المتغيرات المفقودة إلى ملف .env.local'
      });
    }
  }

  private async checkFirebaseConfiguration(): Promise<void> {
    console.log('2️⃣ فحص تكوين Firebase...');
    
    try {
      // Get Firebase app config correctly for v9
      const app = auth.app;
      const config = app.options;
      const requiredFields = ['apiKey', 'authDomain', 'projectId'];
      const missingFields: string[] = [];
      
      requiredFields.forEach(field => {
        if (!config[field as keyof typeof config]) {
          missingFields.push(field);
        }
      });
      
      if (missingFields.length === 0) {
        this.results.push({
          step: 'Firebase Configuration',
          status: 'success',
          message: 'تكوين Firebase صحيح',
          details: {
            projectId: config.projectId,
            authDomain: config.authDomain,
            apiKey: config.apiKey?.slice(0, 10) + '...',
            appName: auth.app.name
          }
        });
      } else {
        this.results.push({
          step: 'Firebase Configuration',
          status: 'error',
          message: `حقول Firebase مفقودة: ${missingFields.join(', ')}`,
          details: { missingFields },
          solution: 'تحقق من تكوين Firebase في firebase-config.ts'
        });
      }
    } catch (error) {
      this.results.push({
        step: 'Firebase Configuration',
        status: 'error',
        message: 'خطأ في قراءة تكوين Firebase',
        details: { error: (error as Error).message },
        solution: 'أعد تهيئة Firebase في firebase-config.ts'
      });
    }
  }

  private async checkBrowserEnvironment(): Promise<void> {
    console.log('3️⃣ فحص بيئة المتصفح...');
    
    const checks = {
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      port: window.location.port,
      isLocalhost: window.location.hostname === 'localhost',
      isHTTPS: window.location.protocol === 'https:',
      hasStorage: !!window.localStorage,
      hasSessionStorage: !!window.sessionStorage,
      cookiesEnabled: navigator.cookieEnabled,
      userAgent: navigator.userAgent
    };
    
    const warnings: string[] = [];
    
    // Check for HTTPS requirement
    if (!checks.isHTTPS && !checks.isLocalhost) {
      warnings.push('Firebase Auth يتطلب HTTPS في الإنتاج');
    }
    
    // Check for storage availability
    if (!checks.hasStorage || !checks.hasSessionStorage) {
      warnings.push('Local/Session Storage غير متاح');
    }
    
    // Check for cookies
    if (!checks.cookiesEnabled) {
      warnings.push('Cookies معطلة في المتصفح');
    }
    
    this.results.push({
      step: 'Browser Environment',
      status: warnings.length === 0 ? 'success' : 'warning',
      message: warnings.length === 0 
        ? 'بيئة المتصفح مناسبة' 
        : `تحذيرات بيئة المتصفح: ${warnings.join(', ')}`,
      details: checks,
      solution: warnings.length > 0 
        ? 'تأكد من تمكين HTTPS و Cookies و Storage'
        : undefined
    });
  }

  private async checkNetworkConnectivity(): Promise<void> {
    console.log('4️⃣ فحص الاتصال بالشبكة...');
    
    try {
      // Test Firebase endpoints
      const endpoints = [
        `https://${auth.config.authDomain}`,
        'https://identitytoolkit.googleapis.com',
        'https://accounts.google.com'
      ];
      
      const results = await Promise.allSettled(
        endpoints.map(async (endpoint) => {
          await fetch(endpoint, { 
            method: 'HEAD',
            mode: 'no-cors'
          });
          return { endpoint, status: 'reachable' };
        })
      );
      
      const reachable = results.filter(r => r.status === 'fulfilled').length;
      const total = endpoints.length;
      
      this.results.push({
        step: 'Network Connectivity',
        status: reachable === total ? 'success' : 'warning',
        message: `الاتصال بالشبكة: ${reachable}/${total} endpoints متاحة`,
        details: { reachable, total, endpoints },
        solution: reachable < total 
          ? 'تحقق من إعدادات الشبكة والجدار الناري'
          : undefined
      });
    } catch (error) {
      this.results.push({
        step: 'Network Connectivity',
        status: 'warning',
        message: 'لا يمكن اختبار الاتصال بالشبكة',
        details: { error: (error as Error).message },
        solution: 'تحقق من اتصال الإنترنت'
      });
    }
  }

  private async checkGoogleProviderConfig(): Promise<void> {
    console.log('5️⃣ فحص تكوين Google Provider...');
    
    try {
      const googleProvider = new GoogleAuthProvider();
      googleProvider.addScope('email');
      googleProvider.addScope('profile');
      
      // Check if provider is properly configured
      const providerId = googleProvider.providerId;
      const isGoogleProvider = providerId === 'google.com';
      
      if (isGoogleProvider) {
        this.results.push({
          step: 'Google Provider Config',
          status: 'success',
          message: 'تكوين Google Provider صحيح',
          details: { providerId, isGoogleProvider }
        });
      } else {
        this.results.push({
          step: 'Google Provider Config',
          status: 'error',
          message: 'تكوين Google Provider غير صحيح',
          details: { providerId, isGoogleProvider },
          solution: 'تأكد من استخدام GoogleAuthProvider الصحيح'
        });
      }
    } catch (error) {
      this.results.push({
        step: 'Google Provider Config',
        status: 'error',
        message: 'خطأ في تكوين Google Provider',
        details: { error: (error as Error).message },
        solution: 'أعد تهيئة GoogleAuthProvider'
      });
    }
  }

  private async checkDomainAuthorization(): Promise<void> {
    console.log('6️⃣ فحص ترخيص النطاق...');
    
    const currentDomain = window.location.hostname;
    const authDomain = auth.config.authDomain;
    const currentPort = window.location.port;
    const fullDomain = currentPort ? `${currentDomain}:${currentPort}` : currentDomain;
    
    // Common authorized domains for development
    const commonDevDomains = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0'
    ];
    
    const isDevDomain = commonDevDomains.includes(currentDomain);
    const isAuthDomain = currentDomain === authDomain?.split('.')[0];
    
    this.results.push({
      step: 'Domain Authorization',
      status: isDevDomain || isAuthDomain ? 'success' : 'warning',
      message: isDevDomain || isAuthDomain 
        ? 'النطاق مخول للمصادقة'
        : 'النطاق قد يحتاج ترخيص في Firebase Console',
      details: {
        currentDomain: fullDomain,
        authDomain,
        isDevDomain,
        isAuthDomain
      },
      solution: !isDevDomain && !isAuthDomain
        ? `أضف ${fullDomain} إلى Authorized domains في Firebase Console`
        : undefined
    });
  }

  private async checkAPIKeyValidation(): Promise<void> {
    console.log('7️⃣ فحص صحة API Key...');
    
    const apiKey = auth.config.apiKey;
    
    if (!apiKey) {
      this.results.push({
        step: 'API Key Validation',
        status: 'error',
        message: 'API Key مفقود',
        solution: 'أضف REACT_APP_FIREBASE_API_KEY إلى متغيرات البيئة'
      });
      return;
    }
    
    // Basic API key format validation
    const isValidFormat = /^AIza[0-9A-Za-z-_]{35}$/.test(apiKey);
    
    if (isValidFormat) {
      this.results.push({
        step: 'API Key Validation',
        status: 'success',
        message: 'تنسيق API Key صحيح',
        details: {
          keyPrefix: apiKey.slice(0, 10) + '...',
          length: apiKey.length,
          format: 'valid'
        }
      });
    } else {
      this.results.push({
        step: 'API Key Validation',
        status: 'error',
        message: 'تنسيق API Key غير صحيح',
        details: {
          keyPrefix: apiKey.slice(0, 10) + '...',
          length: apiKey.length,
          expectedFormat: 'AIza[35 characters]'
        },
        solution: 'تحقق من API Key في Firebase Console'
      });
    }
  }

  // Get specific solutions for auth/internal-error
  getInternalErrorSolutions(): string[] {
    return [
      '1. تحقق من تفعيل Google Sign-in في Firebase Console',
      '2. تأكد من إضافة النطاق الحالي إلى Authorized domains',
      '3. تحقق من صحة API Key و Auth Domain',
      '4. أعد تحميل الصفحة وامسح Cache المتصفح',
      '5. تأكد من تمكين Third-party cookies',
      '6. تحقق من إعدادات CORS في Firebase',
      '7. جرب تسجيل الدخول في وضع التصفح الخفي',
      '8. تأكد من عدم وجود Ad Blockers تحجب Firebase'
    ];
  }
}

export default FirebaseInternalErrorDiagnostic;