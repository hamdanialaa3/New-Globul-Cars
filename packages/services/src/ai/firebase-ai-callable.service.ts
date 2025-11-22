// Firebase AI Callable Service
// خدمة استدعاء وظائف الذكاء الاصطناعي من Firebase
// Secure server-side AI integration

import { getFunctions, httpsCallable } from 'firebase/functions';
import { AIChatContext, AIChatMessage, PriceSuggestion, ProfileAnalysis } from '@globul-cars/core/types/ai.types';
import { logger } from '../logger-service';

class FirebaseAICallableService {
  private functions = getFunctions();

  /**
   * Chat with Gemini AI (Server-side)
   * المحادثة مع Gemini AI (من جانب الخادم)
   */
  async chat(
    message: string,
    context: AIChatContext = {},
    conversationHistory: AIChatMessage[] = []
  ): Promise<{ message: string; quotaRemaining?: number }> {
    try {
      const geminiChatCallable = httpsCallable(this.functions, 'geminiChat');
      
      const result = await geminiChatCallable({
        message,
        context,
        conversationHistory: conversationHistory.slice(-6).map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      });

      return result.data as { message: string; quotaRemaining?: number };
    } catch (error) {
      logger.error('Firebase AI Chat error', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Get price suggestion from AI (Server-side)
   * الحصول على اقتراح السعر من الذكاء الاصطناعي
   */
  async suggestPrice(carDetails: {
    make: string;
    model: string;
    year: number;
    mileage: number;
    condition: string;
    location: string;
    fuelType?: string;
    transmission?: string;
  }): Promise<PriceSuggestion> {
    try {
      const priceSuggestionCallable = httpsCallable(this.functions, 'geminiPriceSuggestion');
      
      const result = await priceSuggestionCallable(carDetails);
      return result.data as PriceSuggestion;
    } catch (error) {
      logger.error('Firebase AI Price Suggestion error', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Analyze user profile (Server-side)
   * تحليل ملف المستخدم
   */
  async analyzeProfile(profileData: any): Promise<ProfileAnalysis> {
    try {
      const profileAnalysisCallable = httpsCallable(this.functions, 'geminiProfileAnalysis');
      
      const result = await profileAnalysisCallable({ profileData });
      return result.data as ProfileAnalysis;
    } catch (error) {
      logger.error('Firebase AI Profile Analysis error', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Check AI quota
   * التحقق من حصة الذكاء الاصطناعي
   */
  async checkQuota(feature: 'chat' | 'price_suggestion' | 'profile_analysis'): Promise<{
    allowed: boolean;
    remaining: number;
    reason?: string;
  }> {
    try {
      const quotaCheckCallable = httpsCallable(this.functions, 'aiQuotaCheck');
      
      const result = await quotaCheckCallable({ feature });
      return result.data as { allowed: boolean; remaining: number; reason?: string };
    } catch (error) {
      logger.error('Firebase AI Quota Check error', error as Error);
      return { allowed: true, remaining: -1 }; // Fallback to allow if check fails
    }
  }

  /**
   * Handle Firebase Function errors
   * معالجة أخطاء Firebase Functions
   */
  private handleError(error: any): Error {
    if (error?.code === 'functions/resource-exhausted') {
      return new Error('AI quota exceeded. Please upgrade your plan or try again later.');
    }
    
    if (error?.code === 'functions/unauthenticated') {
      return new Error('Please sign in to use AI features.');
    }

    if (error?.code === 'functions/failed-precondition') {
      return new Error('AI service is not properly configured. Please contact support.');
    }

    return new Error(error?.message || 'AI service temporarily unavailable. Please try again.');
  }
}

// Singleton instance
export const firebaseAIService = new FirebaseAICallableService();
export default firebaseAIService;
