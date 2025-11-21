// Gemini Chat Cloud Function Endpoint
// نقطة نهاية Gemini للمحادثة

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { defineSecret } from 'firebase-functions/params';
import { getFirestore } from 'firebase-admin/firestore';
import { GeminiChatRequest } from './types';
import { GoogleGenerativeAI } from '@google/generative-ai';

const db = getFirestore();

/**
 * Gemini Chat API Endpoint
 * معالجة طلبات المحادثة مع Gemini من الخادم
 */
const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');
const GEMINI_MODEL = defineSecret('GEMINI_MODEL');

export const geminiChat = onCall<GeminiChatRequest>(
  { region: 'europe-west1', secrets: [GEMINI_API_KEY, GEMINI_MODEL] },
  async (request) => {
    try {
      const { data, auth } = request;

      if (!data.message) {
        throw new HttpsError('invalid-argument', 'Message is required');
      }

      // Check quota if user is authenticated
      if (auth?.uid) {
        const quotaCheck = await checkQuota(auth.uid, 'chat');
        if (!quotaCheck.allowed) {
          throw new HttpsError('resource-exhausted', quotaCheck.reason || 'Quota exceeded');
        }
      }

      logger.info('Gemini Chat Request', {
        userId: auth?.uid,
        messageLength: data.message.length,
        context: data.context?.page
      });

      // Build context-aware prompt
      const systemPrompt = buildSystemPrompt(data.context);
      const fullPrompt = buildFullPrompt(systemPrompt, data.message, data.conversationHistory);

      // Server-side call to Gemini
      const apiKey = GEMINI_API_KEY.value() || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new HttpsError('failed-precondition', 'GEMINI_API_KEY secret is not configured');
      }

      const modelName = GEMINI_MODEL.value() || process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent(fullPrompt);
      const text = result.response.text();

      const response = {
        message: text,
        quotaRemaining: auth?.uid ? await getRemainingQuota(auth.uid, 'chat') : -1
      };

      // Track usage
      if (auth?.uid) {
        await trackUsage(auth.uid, 'chat', true);
      }

      return response;

    } catch (error) {
      logger.error('Gemini Chat Error', error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError('internal', 'Chat processing failed');
    }
  }
);

/**
 * بناء system prompt حسب السياق
 */
function buildSystemPrompt(context?: GeminiChatRequest['context']): string {
  const basePrompt = `You are an intelligent AI assistant for Bulgarian Car Marketplace (Globul Cars).
You help users buy and sell cars in Bulgaria. You understand Bulgarian, English, Arabic, Russian, and Turkish.`;

  if (!context) return basePrompt;

  const contextualPrompts: Record<string, string> = {
    'sell': `${basePrompt}\nYou are helping a user sell their car. Guide them through the listing process, suggest optimal pricing, and provide tips for better listings.`,
    'search': `${basePrompt}\nYou are helping a user search for cars. Understand their requirements and suggest suitable vehicles.`,
    'profile': `${basePrompt}\nYou are helping a user improve their profile. Suggest ways to increase trust score and profile completeness.`,
    'car-details': `${basePrompt}\nYou are helping a user understand a specific car listing. Provide insights about the vehicle, market value, and buying tips.`
  };

  return contextualPrompts[context.page || ''] || basePrompt;
}

/**
 * بناء الـ prompt الكامل مع السجل
 */
function buildFullPrompt(
  systemPrompt: string,
  message: string,
  history?: GeminiChatRequest['conversationHistory']
): string {
  let prompt = systemPrompt + '\n\n';

  if (history && history.length > 0) {
    prompt += 'Conversation History:\n';
    history.forEach(msg => {
      prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    });
    prompt += '\n';
  }

  prompt += `User: ${message}\nAssistant:`;
  return prompt;
}

/**
 * فحص الحصة المتاحة
 */
async function checkQuota(userId: string, feature: string): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const quotaDoc = await db.collection('ai_quotas').doc(userId).get();
    
    if (!quotaDoc.exists) {
      return { allowed: true }; // First time user
    }

    const quota = quotaDoc.data();
    const today = new Date().toISOString().split('T')[0];

    // Reset if new day
    if (quota?.lastResetDate !== today) {
      return { allowed: true };
    }

    const featureMap: Record<string, { used: string; limit: string }> = {
      chat: { used: 'usedChatMessages', limit: 'dailyChatMessages' }
    };

    const { used, limit } = featureMap[feature] || { used: '', limit: '' };
    
    if (!used || !limit) return { allowed: true };

    const usedCount = quota[used] || 0;
    const limitCount = quota[limit] || -1;

    if (limitCount === -1) return { allowed: true }; // Unlimited

    if (usedCount >= limitCount) {
      return { 
        allowed: false, 
        reason: `Daily limit reached (${limitCount}). Upgrade for more.` 
      };
    }

    return { allowed: true };

  } catch (error) {
    logger.error('Quota check failed', error);
    return { allowed: true }; // Allow on error
  }
}

/**
 * الحصول على الحصة المتبقية
 */
async function getRemainingQuota(userId: string, feature: string): Promise<number> {
  try {
    const quotaDoc = await db.collection('ai_quotas').doc(userId).get();
    if (!quotaDoc.exists) return -1;

    const quota = quotaDoc.data();
    const featureMap: Record<string, { used: string; limit: string }> = {
      chat: { used: 'usedChatMessages', limit: 'dailyChatMessages' }
    };

    const { used, limit } = featureMap[feature] || { used: '', limit: '' };
    if (!used || !limit) return -1;

    const usedCount = quota?.[used] || 0;
    const limitCount = quota?.[limit] || -1;

    if (limitCount === -1) return -1; // Unlimited
    return Math.max(0, limitCount - usedCount);

  } catch (error) {
    return -1;
  }
}

/**
 * تتبع الاستخدام
 */
async function trackUsage(userId: string, feature: string, success: boolean) {
  try {
    await db.collection('ai_usage_logs').add({
      userId,
      feature,
      success,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Failed to track usage', error);
  }
}
