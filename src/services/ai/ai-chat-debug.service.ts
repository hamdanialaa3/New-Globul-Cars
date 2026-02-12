/**
 * AI Chat Debug Service
 * خدمة تصحيح مشاكل الدردشة مع AI
 * 
 * استخدمها لتتبع المشاكل والتحقق من الاتصال
 */

import { functions } from '@/firebase/firebase-config';
import { httpsCallable } from 'firebase/functions';
import { logger } from './logger-service';
import { getAuth } from 'firebase/auth';

class AIChatDebugService {
  /**
   * اختبر اتصال الـ AI
   */
  async testConnection(testMessage: string = 'hello'): Promise<{
    success: boolean;
    response?: string;
    error?: string;
    timestamp: string;
    authStatus: boolean;
    message: string;
  }> {
    const result = {
      success: false,
      timestamp: new Date().toISOString(),
      authStatus: false,
      message: ''
    };

    try {
      // 1. تحقق من المصادقة
      const auth = getAuth();
      result.authStatus = !!auth.currentUser;
      
      if (!auth.currentUser) {
        result.message = 'Not authenticated - Please login first';
        result.error = 'UNAUTHENTICATED';
        return result;
      }

      logger.info('Testing AI connection', { userId: auth.currentUser.uid });

      // 2. استدعِ الـ Function
      const call = httpsCallable<any, { message: string; quotaRemaining: number }>(
        functions,
        'geminiChat'
      );

      const response = await Promise.race([
        call({ message: testMessage }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout after 10 seconds')), 10000)
        )
      ]);

      result.success = true;
      result.response = (response as any).data?.message ?? 'No response';
      result.message = 'AI Chat connection successful!';

      logger.info('AI connection test passed', {
        message: testMessage,
        response: result.response?.substring(0, 100)
      });

      return result;
    } catch (error: any) {
      result.error = error.message || 'Unknown error';
      result.message = this.getErrorMessage(error);

      logger.error('AI connection test failed', {
        error: error.message,
        code: error.code,
        timestamp: result.timestamp
      });

      return result;
    }
  }

  /**
   * اختبر الـ Quota
   */
  async checkQuota(): Promise<{
    hasQuota: boolean;
    remaining?: number;
    daily?: number;
    used?: number;
    resetDate?: string;
    message: string;
  }> {
    const result = {
      hasQuota: false,
      message: ''
    };

    try {
      const auth = getAuth();
      if (!auth.currentUser) {
        result.message = 'Not authenticated';
        return result;
      }

      const call = httpsCallable<any, any>(functions, 'aiQuotaCheck');
      const response = await call({ feature: 'ChatMessages' });

      const data = (response as any).data;
      result.hasQuota = data.allowed;
      result.remaining = data.remaining;
      result.message = data.allowed
        ? `You have ${data.remaining} chat messages remaining`
        : `Quota exceeded. Reason: ${data.reason}`;

      return result;
    } catch (error: any) {
      result.message = `Quota check failed: ${error.message}`;
      return result;
    }
  }

  /**
   * اختبر المصادقة
   */
  async checkAuth(): Promise<{
    authenticated: boolean;
    uid?: string;
    email?: string;
    message: string;
  }> {
    const auth = getAuth();
    const user = auth.currentUser;

    return {
      authenticated: !!user,
      uid: user?.uid,
      email: user?.email,
      message: user
        ? `Authenticated as ${user.email}`
        : 'Not authenticated'
    };
  }

  /**
   * اختبر الـ API Key
   */
  async checkApiKey(): Promise<{
    configured: boolean;
    message: string;
    hint: string;
  }> {
    // هذا الاختبار سيتم على الـ Cloud Function
    try {
      const call = httpsCallable<any, any>(functions, 'geminiChat');
      const response = await call({ message: 'test' });
      
      return {
        configured: true,
        message: 'API Key is properly configured',
        hint: 'Service is working'
      };
    } catch (error: any) {
      if (error.message?.includes('not configured')) {
        return {
          configured: false,
          message: 'Gemini API Key is not configured',
          hint: 'Set GOOGLE_GENERATIVE_AI_KEY in Cloud Functions environment'
        };
      }

      return {
        configured: false,
        message: error.message || 'Unknown error',
        hint: 'Check Cloud Functions logs for more details'
      };
    }
  }

  /**
   * اختبر كل شيء
   */
  async runFullDiagnostics(): Promise<{
    auth: Awaited<ReturnType<typeof this.checkAuth>>;
    quota: Awaited<ReturnType<typeof this.checkQuota>>;
    connection: Awaited<ReturnType<typeof this.testConnection>>;
    apiKey: Awaited<ReturnType<typeof this.checkApiKey>>;
    summary: string;
  }> {
    const auth = await this.checkAuth();
    
    if (!auth.authenticated) {
      return {
        auth,
        quota: { hasQuota: false, message: 'Skipped - not authenticated' },
        connection: { success: false, message: 'Skipped - not authenticated', timestamp: new Date().toISOString(), authStatus: false },
        apiKey: { configured: false, message: 'Skipped - not authenticated', hint: '' },
        summary: 'Authentication required first'
      };
    }

    const [quota, connection, apiKey] = await Promise.all([
      this.checkQuota(),
      this.testConnection(),
      this.checkApiKey()
    ]);

    let summary = '';
    if (connection.success) {
      summary = '✅ Everything is working! Your AI Chat is ready.';
    } else if (!apiKey.configured) {
      summary = '❌ Gemini API Key is not configured. Contact administrator.';
    } else if (!quota.hasQuota) {
      summary = '⚠️ Your daily quota is exhausted. Try again tomorrow.';
    } else {
      summary = `❌ Connection failed: ${connection.message}`;
    }

    return { auth, quota, connection, apiKey, summary };
  }

  private getErrorMessage(error: any): string {
    if (error.code === 'unauthenticated') {
      return 'Please login first to use AI Chat';
    } else if (error.code === 'resource-exhausted') {
      return 'Daily quota exceeded. Try again tomorrow.';
    } else if (error.code === 'internal') {
      return 'AI service error. Please try again later.';
    } else if (error.message?.includes('timeout')) {
      return 'Request timed out. Check your internet connection.';
    } else if (error.message?.includes('network')) {
      return 'Network error. Check your connection.';
    } else {
      return error.message || 'Unknown error occurred';
    }
  }
}

export const aiChatDebugService = new AIChatDebugService();

// للاستخدام في المتصفح (console):
// await aiChatDebugService.runFullDiagnostics()
// أو:
// await aiChatDebugService.testConnection('hi')
