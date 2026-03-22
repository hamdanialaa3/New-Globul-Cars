"use strict";
/**
 * Firebase Cloud Functions - AI Functions (v4 API - FIXED)
 * دوال الذكاء الاصطناعي على Firebase
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeImageQuality = exports.analyzeCarImage = exports.geminiPriceSuggestion = exports.geminiChat = exports.aiQuotaCheck = void 0;
const admin = require("firebase-admin");
const functions = require("firebase-functions/v1");
const generative_ai_1 = require("@google/generative-ai");
// Firebase Admin is already initialized in index.ts - no need to initialize again
const db = admin.firestore();
// Initialize Gemini - uses process.env (deprecated config API ref removed)
const getApiKey = () => {
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
}
else {
    console.log('[ai-functions] API key successfully loaded');
}
const genAI = apiKey ? new generative_ai_1.GoogleGenerativeAI(apiKey) : null;
if (!genAI) {
    console.warn('[ai-functions] Gemini AI is disabled - no API key configured');
}
// ==================== AI QUOTA MANAGEMENT ====================
/**
 * Check AI quota for user
 */
exports.aiQuotaCheck = functions
    .region('europe-west1')
    .https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
    }
    const userId = context.auth.uid;
    const { feature } = data;
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
                lastBillingDate: new Date().toISOString().split('T')[0],
            };
            await quotaRef.set(newQuota);
            return {
                allowed: true,
                remaining: newQuota[`daily${feature}`],
            };
        }
        const quota = quotaSnap.data();
        const today = new Date().toISOString().split('T')[0];
        // Reset if new day
        if (quota.lastResetDate !== today) {
            const featureKey = `daily${feature}`;
            const usedKey = `used${feature}`;
            await quotaRef.update({
                [usedKey]: 0,
                lastResetDate: today,
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
    }
    catch (error) {
        console.error('[aiQuotaCheck] Error:', error);
        throw new functions.https.HttpsError('internal', 'Error checking quota');
    }
});
// ==================== GEMINI CHAT ====================
/**
 * Chat with Gemini AI - Main entry point
 * Supports both authenticated users and guests
 */
exports.geminiChat = functions
    .region('europe-west1')
    .https.onCall(async (data, context) => {
    var _a, _b, _c, _d;
    // Support both authenticated users and guests
    const isAuthenticated = !!context.auth;
    const userId = isAuthenticated
        ? context.auth.uid
        : `guest_${context.rawRequest.ip || 'unknown'}`;
    const { message, context: _userContext } = data;
    try {
        // Validate input
        if (!message ||
            typeof message !== 'string' ||
            message.trim().length === 0) {
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
                createdAt: admin.firestore.Timestamp.now(),
            };
            await quotaRef.set(newQuota);
            quotaCheck = await quotaRef.get();
        }
        const quota = quotaCheck.data();
        const today = new Date().toISOString().split('T')[0];
        // Reset quota if new day
        if ((quota === null || quota === void 0 ? void 0 : quota.lastResetDate) !== today) {
            await quotaRef.update({
                usedChatMessages: 0,
                lastResetDate: today,
            });
        }
        // Check quota limit
        const usedToday = (quota === null || quota === void 0 ? void 0 : quota.usedChatMessages) || 0;
        const dailyLimit = (quota === null || quota === void 0 ? void 0 : quota.dailyChatMessages) || (isAuthenticated ? 10 : 3);
        if (usedToday >= dailyLimit) {
            throw new functions.https.HttpsError('resource-exhausted', 'Chat quota exceeded for today. Sign in for more messages.');
        }
        // Call Gemini
        console.log(`[geminiChat] Calling Gemini (${isAuthenticated ? 'authenticated' : 'guest'}) with message:`, message.substring(0, 50) + '...');
        if (!genAI) {
            throw new functions.https.HttpsError('internal', 'AI service not configured');
        }
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(message.trim());
        const response = result.response.text();
        console.log('[geminiChat] Gemini response received, length:', response.length);
        // Update quota
        await quotaRef.update({
            usedChatMessages: admin.firestore.FieldValue.increment(1),
            totalCost: admin.firestore.FieldValue.increment(0.001),
        });
        // Log usage
        await db.collection('ai_usage_logs').add({
            userId,
            isAuthenticated,
            feature: 'chat',
            timestamp: Date.now(),
            cost: 0.001,
            tier: (quota === null || quota === void 0 ? void 0 : quota.tier) || (isAuthenticated ? 'free' : 'guest'),
            success: true,
        });
        const quotaRemaining = dailyLimit - (usedToday + 1);
        console.log('[geminiChat] Success - quota remaining:', quotaRemaining);
        return {
            message: response,
            quotaRemaining: quotaRemaining,
        };
    }
    catch (error) {
        console.error('[geminiChat] Error:', error);
        // Return specific error messages for debugging
        if (error.code === 'resource-exhausted') {
            throw error;
        }
        else if (error.code === 'invalid-argument') {
            throw error;
        }
        else if (((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('API')) ||
            ((_b = error.message) === null || _b === void 0 ? void 0 : _b.includes('key')) ||
            ((_c = error.message) === null || _c === void 0 ? void 0 : _c.includes('401'))) {
            console.error('[geminiChat] API Configuration Error:', error.message);
            throw new functions.https.HttpsError('internal', 'AI service configuration error');
        }
        else if ((_d = error.message) === null || _d === void 0 ? void 0 : _d.includes('PERMISSION_DENIED')) {
            console.error('[geminiChat] Permission Denied:', error.message);
            throw new functions.https.HttpsError('permission-denied', 'Access denied to AI service');
        }
        else {
            console.error('[geminiChat] Unexpected error:', error.message || error);
            throw new functions.https.HttpsError('internal', 'Failed to generate response');
        }
    }
});
// ==================== PRICE SUGGESTION ====================
/**
 * Suggest price for car using Gemini
 */
exports.geminiPriceSuggestion = functions
    .region('europe-west1')
    .https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
    }
    const userId = context.auth.uid;
    const { make, model, year, mileage, condition, location } = data;
    // Input validation & sanitization
    if (!make || !model || !year) {
        throw new functions.https.HttpsError('invalid-argument', 'make, model, and year are required');
    }
    const sanitize = (v) => String(v !== null && v !== void 0 ? v : '')
        .replace(/[^\w\s,.\-\/а-яА-ЯёЁ()]/gi, '')
        .substring(0, 100);
    const safeMake = sanitize(make);
    const safeModel = sanitize(model);
    const safeYear = Number(year) || 0;
    const safeMileage = Number(mileage) || 0;
    const safeCondition = sanitize(condition);
    const safeLocation = sanitize(location);
    try {
        if (!genAI) {
            throw new functions.https.HttpsError('internal', 'AI service not configured');
        }
        const modelObj = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = `
    As a Bulgarian car market expert, suggest a fair price for:
    
    Car: ${safeMake} ${safeModel} ${safeYear}
    Mileage: ${safeMileage} km
    Condition: ${safeCondition}
    Location: ${safeLocation}
    
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
        await db
            .collection('ai_quotas')
            .doc(userId)
            .update({
            usedPriceSuggestions: admin.firestore.FieldValue.increment(1),
            totalCost: admin.firestore.FieldValue.increment(0.002),
        });
        return suggestion;
    }
    catch (error) {
        console.error('[geminiPriceSuggestion] Error:', error);
        throw new functions.https.HttpsError('internal', 'Price suggestion failed');
    }
});
// ==================== IMAGE ANALYSIS ====================
/**
 * Helper: Handle Guest Quota for Image Analysis
 */
async function checkImageAnalysisQuota(userId, isGuest) {
    const quotaRef = db.collection('ai_quotas').doc(userId);
    let quotaCheck = await quotaRef.get();
    if (!quotaCheck.exists) {
        // Auto-initialize quota
        const newQuota = {
            userId,
            tier: isGuest ? 'guest' : 'free',
            dailyImageAnalysis: isGuest ? 2 : 5, // Strict limit for guests (2 per day), 5 for free users
            usedImageAnalysis: 0,
            lastResetDate: new Date().toISOString().split('T')[0],
            createdAt: admin.firestore.Timestamp.now(),
        };
        await quotaRef.set(newQuota);
        quotaCheck = await quotaRef.get();
    }
    const quota = quotaCheck.data();
    const today = new Date().toISOString().split('T')[0];
    // Reset if new day
    if (quota.lastResetDate !== today) {
        await quotaRef.update({
            usedImageAnalysis: 0,
            lastResetDate: today,
        });
        return; // Reset done, usage is 0
    }
    const used = quota.usedImageAnalysis || 0;
    const limit = quota.dailyImageAnalysis || (isGuest ? 2 : 5);
    if (used >= limit) {
        throw new functions.https.HttpsError('resource-exhausted', isGuest
            ? 'Guest limit reached. Please sign in to analyze more cars.'
            : 'Daily analysis limit reached.');
    }
}
/**
 * Helper: Track Usage
 */
async function trackImageAnalysisUsage(userId, cost) {
    try {
        await db
            .collection('ai_quotas')
            .doc(userId)
            .update({
            usedImageAnalysis: admin.firestore.FieldValue.increment(1),
            totalCost: admin.firestore.FieldValue.increment(cost),
            lastActivity: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
    catch (e) {
        console.error('Error tracking usage:', e);
    }
}
/**
 * Analyze car image using Gemini Vision
 */
exports.analyzeCarImage = functions
    .region('europe-west1')
    .https.onCall(async (data, context) => {
    // 1. Authentication & Guest Handling
    const isAuthenticated = !!context.auth;
    // Use IP as guest ID if not authenticated
    const userId = isAuthenticated
        ? context.auth.uid
        : `guest_${context.rawRequest.ip || 'unknown'}`;
    // 2. Strict Quota Check BEFORE processing
    await checkImageAnalysisQuota(userId, !isAuthenticated);
    // 3. Input Validation
    const { imageBase64, mimeType } = data;
    if (!imageBase64) {
        throw new functions.https.HttpsError('invalid-argument', 'Image data required');
    }
    try {
        if (!genAI) {
            throw new functions.https.HttpsError('internal', 'AI service not configured');
        }
        // Use Gemini 2.0 Flash for speed/cost effectiveness
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = `
      Analyze this car image for the Bulgarian car marketplace.
      
      Provide accurate information in JSON format:
      {
        "make": "car brand (BMW, Mercedes, Toyota, etc.)",
        "model": "car model (320i, C-Class, Corolla, etc.)",
        "year": "approximate year or range (2018-2020)",
        "color": "primary color in English",
        "condition": "excellent/good/fair/poor",
        "confidence": 85,
        "suggestions": ["list of suggestions"]
      }
      
      Be specific and accurate. If unsure, indicate lower confidence.
    `;
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageBase64,
                    mimeType: mimeType || 'image/jpeg',
                },
            },
        ]);
        const text = result.response.text();
        // Extract JSON with robust parsing
        let parsed;
        try {
            const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
            }
            else {
                parsed = JSON.parse(text);
            }
        }
        catch (e) {
            console.warn('JSON Parse Error:', text);
            throw new Error('Failed to parse AI response');
        }
        // 4. Track Usage
        await trackImageAnalysisUsage(userId, 0.005);
        return parsed;
    }
    catch (error) {
        console.error('[analyzeCarImage] Error:', error);
        if (error instanceof functions.https.HttpsError)
            throw error;
        throw new functions.https.HttpsError('internal', 'Image analysis failed');
    }
});
/**
 * Analyze image quality
 */
exports.analyzeImageQuality = functions
    .region('europe-west1')
    .https.onCall(async (data, context) => {
    const isAuthenticated = !!context.auth;
    const userId = isAuthenticated
        ? context.auth.uid
        : `guest_${context.rawRequest.ip || 'unknown'}`;
    // Strict Quota Check
    await checkImageAnalysisQuota(userId, !isAuthenticated);
    const { imageBase64, mimeType } = data;
    if (!imageBase64) {
        throw new functions.https.HttpsError('invalid-argument', 'Image data required');
    }
    try {
        if (!genAI) {
            throw new functions.https.HttpsError('internal', 'AI service not configured');
        }
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = `
      Analyze the quality of this car photo.
      
      Rate each aspect from 0-100 and provide JSON:
      {
        "clarity": 85,
        "lighting": 90,
        "angle": 75,
        "overallScore": 83,
        "suggestions": ["specific improvements"]
      }
    `;
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageBase64,
                    mimeType: mimeType || 'image/jpeg',
                },
            },
        ]);
        const text = result.response.text();
        let parsed;
        try {
            const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
            }
            else {
                parsed = JSON.parse(text);
            }
        }
        catch (_a) {
            throw new Error('Failed to parse AI response');
        }
        await trackImageAnalysisUsage(userId, 0.001);
        return parsed;
    }
    catch (error) {
        console.error('[analyzeImageQuality] Error:', error);
        if (error instanceof functions.https.HttpsError)
            throw error;
        throw new functions.https.HttpsError('internal', 'Quality analysis failed');
    }
});
//# sourceMappingURL=ai-functions.js.map