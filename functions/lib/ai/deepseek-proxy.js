"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiComplexQuery = exports.aiGenerateCarDescription = exports.aiGenerateText = exports.DeepSeekProxy = void 0;
const admin = require("firebase-admin");
const functions = require("firebase-functions/v1");
const axios_1 = require("axios");
// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
// Use environment variables (process.env) instead of deprecated config methods
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';
// Quota configuration based on user type
const QUOTA_CONFIG = {
    'private': { monthly: 10, daily: 3 },
    'dealer': { monthly: 100, daily: 10 },
    'company': { monthly: 1000, daily: 50 },
};
/**
 * Proxy class to handle DeepSeek API interactions securely
 */
class DeepSeekProxy {
    /**
     * Check if the user has enough quota to proceed
     */
    async checkQuota(userId) {
        var _a;
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            console.warn(`[checkQuota] User ${userId} not found in Firestore. assuming private.`);
        }
        const userData = userDoc.data();
        const userType = (userData === null || userData === void 0 ? void 0 : userData.profileType) || 'private';
        const month = new Date().toISOString().slice(0, 7); // YYYY-MM
        const currentUsage = ((_a = userData === null || userData === void 0 ? void 0 : userData.aiUsage) === null || _a === void 0 ? void 0 : _a[month]) || 0;
        const config = QUOTA_CONFIG[userType] || QUOTA_CONFIG['private'];
        const quota = config.monthly;
        if (currentUsage >= quota) {
            return { canProceed: false, remaining: 0 };
        }
        return { canProceed: true, remaining: quota - currentUsage };
    }
    /**
     * Increment user's usage
     */
    async incrementUsage(userId) {
        const month = new Date().toISOString().slice(0, 7);
        const usageKey = `aiUsage.${month}`;
        await db.collection('users').doc(userId).update({
            [usageKey]: admin.firestore.FieldValue.increment(1),
            lastAIUsage: new Date().toISOString()
        });
    }
    /**
     * Call DeepSeek API
     */
    async callDeepSeekAPI(messages, model = 'deepseek-chat', temperature = 0.7) {
        var _a, _b;
        if (!DEEPSEEK_API_KEY) {
            throw new Error('DeepSeek API key not configured');
        }
        const response = await axios_1.default.post(`${DEEPSEEK_BASE_URL}/chat/completions`, {
            model,
            messages,
            temperature,
            max_tokens: 2048
        }, {
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        return ((_b = (_a = response.data.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || 'No response';
    }
    /**
     * Moderate content
     */
    async moderateContent(prompt) {
        const forbiddenPatterns = [
            /secret|password|api.?key/i,
            /credit.?card|ssn|social.?security/i,
            /kill|bomb|weapon|violence/i,
            /hate|discriminate|racist/i,
            /password/i,
        ];
        return !forbiddenPatterns.some(pattern => pattern.test(prompt));
    }
}
exports.DeepSeekProxy = DeepSeekProxy;
/**
 * Cloud Function: General Text Generation
 */
exports.aiGenerateText = functions.https.onCall(async (data, context) => {
    // 1. Authentication Check
    const { auth } = context;
    if (!auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to use AI features.');
    }
    const userId = auth.uid;
    const proxy = new DeepSeekProxy();
    try {
        // 2. Quota Check
        const quotaCheck = await proxy.checkQuota(userId);
        if (!quotaCheck.canProceed) {
            throw new functions.https.HttpsError('resource-exhausted', 'Monthly AI quota exceeded.');
        }
        // 3. Moderation
        const isSafe = await proxy.moderateContent(data.prompt);
        if (!isSafe) {
            // Log violation
            await db.collection('ai_moderation_logs').add({
                userId,
                prompt: data.prompt.substring(0, 500),
                timestamp: new Date().toISOString(),
                reason: 'Content violates safety policy'
            });
            throw new functions.https.HttpsError('permission-denied', 'Your request contains content that violates our policies.');
        }
        // 4. API Call
        const messages = [
            { role: 'system', content: data.systemMessage || 'You are a helpful automotive assistant for the Bulgarian market. Reply in Bulgarian unless asked otherwise.' },
            { role: 'user', content: data.prompt }
        ];
        const aiResponse = await proxy.callDeepSeekAPI(messages, data.model, data.temperature);
        // 5. Log & Increment
        await db.collection('ai_usage_logs').add({
            userId,
            timestamp: new Date().toISOString(),
            type: 'text-generation',
            model: data.model || 'deepseek-chat',
            promptLength: data.prompt.length,
            success: true
        });
        await proxy.incrementUsage(userId);
        // 6. Return Response
        return {
            response: aiResponse,
            model: data.model || 'deepseek-chat',
            success: true
        };
    }
    catch (error) {
        console.error('[aiGenerateText]', error);
        // Log error
        await db.collection('ai_errors').add({
            userId,
            timestamp: new Date().toISOString(),
            error: error.message,
            type: 'text-generation'
        });
        throw new functions.https.HttpsError('internal', error.message || 'Failed to generate text');
    }
});
/**
 * Cloud Function: Car Description Generation
 */
exports.aiGenerateCarDescription = functions.https.onCall(async (data, context) => {
    const { auth } = context;
    if (!auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Not authenticated');
    }
    const userId = auth.uid;
    const proxy = new DeepSeekProxy();
    try {
        // Quota check
        const quotaCheck = await proxy.checkQuota(userId);
        if (!quotaCheck.canProceed) {
            throw new functions.https.HttpsError('resource-exhausted', 'Monthly AI quota exceeded');
        }
        // Build car details string
        const carDetails = `
    Write a marketing description in ${data.language === 'en' ? 'English' : 'Bulgarian'} for the following car:
    
    Make: ${data.make}
    Model: ${data.model}
    Year: ${data.year}
    Fuel: ${data.fuelType}
    Mileage: ${data.mileage} km
    Price: ${data.price} ${data.currency}
    Location: ${data.city}
    ${data.equipment ? `Features: ${data.equipment.join(', ')}` : ''}
    
    Style: ${data.style || 'professional'} (Professional, confident, trustworthy).
    
    Keep it concise, engaging, and highlighting the car's strengths. Max 150 words.
    `;
        const messages = [
            { role: 'system', content: 'You are an expert automotive copywriter for the Bulgarian market.' },
            { role: 'user', content: carDetails }
        ];
        const description = await proxy.callDeepSeekAPI(messages);
        // Log and increment
        await db.collection('ai_usage_logs').add({
            userId,
            timestamp: new Date().toISOString(),
            type: 'car-description',
            success: true
        });
        await proxy.incrementUsage(userId);
        return {
            description,
            success: true
        };
    }
    catch (error) {
        console.error('[aiGenerateCarDescription]', error);
        throw new functions.https.HttpsError('internal', error.message || 'Failed to generate description');
    }
});
/**
 * Cloud Function: Complex Queries
 */
exports.aiComplexQuery = functions.https.onCall(async (data, context) => {
    const { auth } = context;
    if (!auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Not authenticated');
    }
    const userId = auth.uid;
    const proxy = new DeepSeekProxy();
    try {
        const quotaCheck = await proxy.checkQuota(userId);
        if (!quotaCheck.canProceed) {
            throw new functions.https.HttpsError('resource-exhausted', 'Monthly quota exceeded');
        }
        // Moderation check
        const isSafe = await proxy.moderateContent(data.query);
        if (!isSafe) {
            throw new functions.https.HttpsError('permission-denied', 'Query contains prohibited content');
        }
        const messages = [
            {
                role: 'system',
                content: 'You are an expert automotive consultant for the Bulgarian market. Provide detailed, accurate information.'
            },
            {
                role: 'user',
                content: data.query
            }
        ];
        const response = await proxy.callDeepSeekAPI(messages, data.model, data.temperature);
        // Log usage
        await db.collection('ai_usage_logs').add({
            userId,
            timestamp: new Date().toISOString(),
            type: 'complex-query',
            queryLength: data.query.length,
            success: true
        });
        await proxy.incrementUsage(userId);
        return {
            response,
            success: true
        };
    }
    catch (error) {
        console.error('[aiComplexQuery]', error);
        throw new functions.https.HttpsError('internal', error.message || 'Query processing failed');
    }
});
//# sourceMappingURL=deepseek-proxy.js.map