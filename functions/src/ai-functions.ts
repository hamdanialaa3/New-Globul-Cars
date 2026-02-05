/**
 * Firebase Cloud Functions - AI Functions (v4 API - FIXED)
 * دوال الذكاء الاصطناعي على Firebase
 */

import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v1';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Firebase Admin is already initialized in index.ts - no need to initialize again
const db = admin.firestore();

// Initialize Gemini - uses process.env (functions.config() deprecated March 2026)
const getApiKey = (): string | undefined => {
  const envKey = process.env.GOOGLE_GENERATIVE_AI_KEY;
  if (envKey) {
    console.log('[ai-functions] API key loaded, length:', envKey.length);
    return envKey.trim();
  }
  return undefined;
};

const apiKey = getApiKey();
if (!apiKey) {
  console.error('[ai-functions] GOOGLE_GENERATIVE_AI_KEY is not configured');
} else {
  console.log('[ai-functions] API key successfully loaded');
}
const genAI = new GoogleGenerativeAI(apiKey || 'MISSING_KEY');

// ==================== AI QUOTA MANAGEMENT ====================

/**
 * Check AI quota for user
 */
export const aiQuotaCheck = functions.region('europe-west1').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
  }

  const userId = context.auth.uid;
  const { feature } = data as any;

  try {
    const quotaRef = db.collection('ai_quotas').doc(userId);
    const quotaSnap = await quotaRef.get();

    if (!quotaSnap.exists) {
      // Create new quota
      const newQuota = {
        userId,
        tier: 'free',
        dailyImageAnalysis: 5,
        dailyPriceSuggestions: 3,
        dailyChatMessages: 10,
        dailyProfileAnalysis: 2,
        dailyVoiceMessages: 2,
        dailySentimentAnalysis: 5,
        usedImageAnalysis: 0,
        usedPriceSuggestions: 0,
        usedChatMessages: 0,
        usedProfileAnalysis: 0,
        usedVoiceMessages: 0,
        usedSentimentAnalysis: 0,
        lastResetDate: new Date().toISOString().split('T')[0],
        totalCost: 0,
        lastBillingDate: new Date().toISOString().split('T')[0]
      };
      await quotaRef.set(newQuota);
      return { allowed: true, remaining: (newQuota as any)[`daily${feature}`] };
    }

    const quota = quotaSnap.data() as any;
    const today = new Date().toISOString().split('T')[0];

    // Reset if new day
    if (quota.lastResetDate !== today) {
      const featureKey = `daily${feature}`;
      const usedKey = `used${feature}`;

      await quotaRef.update({
        [usedKey]: 0,
        lastResetDate: today
      });

      return { allowed: true, remaining: quota[featureKey] };
    }

    const usedKey = `used${feature}`;
    const dailyKey = `daily${feature}`;
    const used = quota[usedKey] || 0;
    const limit = quota[dailyKey] || -1;
    if (limit === -1) {
      return { allowed: true, remaining: -1 }; // Unlimited
    }

    if (used >= limit) {
      return { allowed: false, remaining: 0, reason: 'Daily limit exceeded' };
    }

    return { allowed: true, remaining: limit - used };
  } catch (error: any) {
    console.error('[aiQuotaCheck] Error:', error);
    throw new functions.https.HttpsError('internal', 'Error checking quota');
  }
});

// ==================== GEMINI CHAT ====================

/**
 * Chat with Gemini AI - Main entry point
 * Supports both authenticated users and guests
 */
export const geminiChat = functions.region('europe-west1').https.onCall(async (data, context) => {
  // Support both authenticated users and guests
  const isAuthenticated = !!context.auth;
  const userId = isAuthenticated ? context.auth!.uid : `guest_${context.rawRequest.ip || 'unknown'}`;
  const { message, context: _userContext } = data as any;

  try {
    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw new functions.https.HttpsError('invalid-argument', 'Message is required');
    }

    // Check API key availability
    if (!apiKey || apiKey === 'MISSING_KEY') {
      console.error('[geminiChat] API key not configured');
      throw new functions.https.HttpsError('internal', 'AI service not configured');
    }

    // Check and initialize quota (stricter limits for guests)
    const quotaRef = db.collection('ai_quotas').doc(userId);
    let quotaCheck = await quotaRef.get();
    
    if (!quotaCheck.exists) {
      // Auto-initialize quota for new user/guest
      const newQuota = {
        userId,
        tier: isAuthenticated ? 'free' : 'guest',
        dailyChatMessages: isAuthenticated ? 10 : 3, // Guests: 3 messages/day
        usedChatMessages: 0,
        lastResetDate: new Date().toISOString().split('T')[0],
        totalCost: 0,
        createdAt: admin.firestore.Timestamp.now()
      };
      await quotaRef.set(newQuota);
      quotaCheck = await quotaRef.get();
    }

    const quota = quotaCheck.data() as any;
    const today = new Date().toISOString().split('T')[0];

    // Reset quota if new day
    if (quota?.lastResetDate !== today) {
      await quotaRef.update({
        usedChatMessages: 0,
        lastResetDate: today
      });
    }

    // Check quota limit
    const usedToday = quota?.usedChatMessages || 0;
    const dailyLimit = quota?.dailyChatMessages || (isAuthenticated ? 10 : 3);
    if (usedToday >= dailyLimit) {
      throw new functions.https.HttpsError('resource-exhausted', 'Chat quota exceeded for today. Sign in for more messages.');
    }

    // Call Gemini
    console.log(`[geminiChat] Calling Gemini (${isAuthenticated ? 'authenticated' : 'guest'}) with message:`, message.substring(0, 50) + '...');
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(message.trim());
    const response = result.response.text();

    console.log('[geminiChat] Gemini response received, length:', response.length);

    // Update quota
    await quotaRef.update({
      usedChatMessages: admin.firestore.FieldValue.increment(1),
      totalCost: admin.firestore.FieldValue.increment(0.001)
    });

    // Log usage
    await db.collection('ai_usage_logs').add({
      userId,
      isAuthenticated,
      feature: 'chat',
      timestamp: Date.now(),
      cost: 0.001,
      tier: quota?.tier || (isAuthenticated ? 'free' : 'guest'),
      success: true
    });

    const quotaRemaining = dailyLimit - (usedToday + 1);
    console.log('[geminiChat] Success - quota remaining:', quotaRemaining);

    return { 
      message: response, 
      quotaRemaining: quotaRemaining
    };
  } catch (error: any) {
    console.error('[geminiChat] Error:', error);
    
    // Return specific error messages for debugging
    if (error.code === 'resource-exhausted') {
      throw error;
    } else if (error.code === 'invalid-argument') {
      throw error;
    } else if (error.message?.includes('API') || error.message?.includes('key') || error.message?.includes('401')) {
      console.error('[geminiChat] API Configuration Error:', error.message);
      throw new functions.https.HttpsError('internal', 'AI service configuration error');
    } else if (error.message?.includes('PERMISSION_DENIED')) {
      console.error('[geminiChat] Permission Denied:', error.message);
      throw new functions.https.HttpsError('permission-denied', 'Access denied to AI service');
    } else {
      console.error('[geminiChat] Unexpected error:', error.message || error);
      throw new functions.https.HttpsError('internal', 'Failed to generate response');
    }
  }
});

// ==================== PRICE SUGGESTION ====================

/**
 * Suggest price for car using Gemini
 */
export const geminiPriceSuggestion = functions.region('europe-west1').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
  }

  const userId = context.auth.uid;
  const { make, model, year, mileage, condition, location } = data as any;

  try {
    const modelObj = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
    As a Bulgarian car market expert, suggest a fair price for:
    
    Car: ${make} ${model} ${year}
    Mileage: ${mileage} km
    Condition: ${condition}
    Location: ${location}
    
    Provide in JSON format:
    {
      "minPrice": number,
      "avgPrice": number,
      "maxPrice": number,
      "reasoning": "explanation",
      "marketTrend": "high|average|low"
    }
    `;

    const result = await modelObj.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse price suggestion');
    }

    const suggestion = JSON.parse(jsonMatch[0]);

    // Update quota
    await db.collection('ai_quotas').doc(userId).update({
      usedPriceSuggestions: admin.firestore.FieldValue.increment(1),
      totalCost: admin.firestore.FieldValue.increment(0.002)
    });

    return suggestion;
  } catch (error: any) {
    console.error('[geminiPriceSuggestion] Error:', error);
    throw new functions.https.HttpsError('internal', 'Price suggestion failed');
  }
});
