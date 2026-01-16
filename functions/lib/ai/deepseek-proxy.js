"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiGenerateCarDescription = exports.aiGenerateText = exports.DeepSeekProxy = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios_1 = require("axios");
// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
// Use functions.config() to access environment variables in production
// Ensure you set this via: firebase functions:config:set deepseek.api_key="YOUR_KEY"
const DEEPSEEK_API_KEY = ((_a = functions.config().deepseek) === null || _a === void 0 ? void 0 : _a.api_key) || process.env.DEEPSEEK_API_KEY;
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
            // If user doesn't exist in DB (e.g. legacy auth), assume 'private' default or block
            // For now, let's assume private default to allow operation
            console.warn(`User ${userId} not found in Firestore. assuming private.`);
        }
        const userData = userDoc.data();
        const userType = (userData === null || userData === void 0 ? void 0 : userData.profileType) || 'private';
        const month = new Date().toISOString().slice(0, 7); // YYYY-MM
        // Check monthly usage
        // const usageKey = `aiUsage.${month}`; // Kept as comment or removed entirely 
        // Logic seems to use a simpler check or different key structure below or it's just dead code
        // Checking the file, I'll assume safe deletion if not used.
        const currentUsage = ((_a = userData === null || userData === void 0 ? void 0 : userData.aiUsage) === null || _a === void 0 ? void 0 : _a[month]) || 0;
        const config = QUOTA_CONFIG[userType] || QUOTA_CONFIG['private'];
        const quota = config.monthly;
        return {
            canProceed: currentUsage < quota,
            remaining: quota - currentUsage,
        };
    }
    /**
     * Increment the user's AI usage counter
     */
    async incrementUsage(userId) {
        const month = new Date().toISOString().slice(0, 7);
        const usageField = `aiUsage.${month}`;
        await db.collection('users').doc(userId).update({
            [usageField]: admin.firestore.FieldValue.increment(1),
            'aiLastUsed': admin.firestore.FieldValue.serverTimestamp(),
        }).catch(async (err) => {
            // If update fails (e.g. document doesn't exist or field is nested map issue), try set with merge
            if (err.code === 'not-found') {
                // Create user doc if missing (should not happen in normal flow)
            }
            else {
                // Handle nested field creation if dot notation fails on empty map
                await db.collection('users').doc(userId).set({
                    aiUsage: { [month]: admin.firestore.FieldValue.increment(1) },
                    aiLastUsed: admin.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            }
        });
    }
    /**
     * Call the DeepSeek API
     */
    async callDeepSeekAPI(messages, model = 'deepseek-chat', temperature = 0.7) {
        var _a, _b, _c, _d;
        if (!DEEPSEEK_API_KEY) {
            throw new Error('DeepSeek API Key is not configured on the server.');
        }
        try {
            const response = await axios_1.default.post(`${DEEPSEEK_BASE_URL}/chat/completions`, {
                model,
                messages,
                temperature,
                max_tokens: 2000,
            }, {
                headers: {
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('DeepSeek API request failed:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            throw new Error(`DeepSeek API Error: ${((_d = (_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) === null || _d === void 0 ? void 0 : _d.message) || error.message}`);
        }
    }
    /**
     * Simple content moderation (keyword based for now)
     */
    async moderateContent(prompt) {
        const forbiddenPatterns = [
            /رقم بطاقة/i,
            /credit card/i,
            /password/i,
            // Add more specific patterns if needed for Bulgarian context
        ];
        return !forbiddenPatterns.some(pattern => pattern.test(prompt));
    }
}
exports.DeepSeekProxy = DeepSeekProxy;
/**
 * Cloud Function: General Text Generation
 */
exports.aiGenerateText = functions.region('europe-west1').https.onCall(async (data, context) => {
    // 1. Authentication Check
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to use AI features.');
    }
    const userId = context.auth.uid;
    const proxy = new DeepSeekProxy();
    try {
        // 2. Quota Check
        const quotaCheck = await proxy.checkQuota(userId);
        if (!quotaCheck.canProceed) {
            throw new functions.https.HttpsError('resource-exhausted', 'Monthly AI quota exceeded.', { remaining: 0 });
        }
        // 3. Moderation
        const isSafe = await proxy.moderateContent(data.prompt);
        if (!isSafe) {
            // Log violation
            await db.collection('ai_moderation_logs').add({
                userId,
                prompt: data.prompt.substring(0, 500),
                reason: 'Sensitive content detected',
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
            });
            throw new functions.https.HttpsError('invalid-argument', 'Content contains sensitive or prohibited information.');
        }
        // 4. API Call
        const messages = [
            {
                role: 'system',
                content: data.systemMessage || 'You are a helpful automotive assistant for the Bulgarian market. Reply in Bulgarian unless asked otherwise.'
            },
            {
                role: 'user',
                content: data.prompt
            }
        ];
        const aiResponse = await proxy.callDeepSeekAPI(messages, data.model, data.temperature);
        // 5. Update Usage
        await proxy.incrementUsage(userId);
        // 6. Log Request (Analytics)
        await db.collection('ai_requests').add({
            userId,
            promptLength: data.prompt.length,
            responseLength: aiResponse.choices[0].message.content.length,
            model: data.model || 'deepseek-chat',
            tokens: aiResponse.usage.total_tokens,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        // 7. Return Result
        return {
            success: true,
            content: aiResponse.choices[0].message.content,
            usage: aiResponse.usage,
            remainingQuota: quotaCheck.remaining - 1,
        };
    }
    catch (error) {
        console.error('AI Proxy Error:', error);
        throw new functions.https.HttpsError('internal', error.message || 'An internal error occurred in the AI service.');
    }
});
/**
 * Cloud Function: Specialized Car Description Generator
 */
exports.aiGenerateCarDescription = functions.region('europe-west1').https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }
    // Construct a specialized prompt for car descriptions
    const prompt = `
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
    
    Instructions:
    1. Start with a catchy headline.
    2. Highlight key features relevant to Bulgarian buyers (reliability, economy, comfort).
    3. Include a call to action.
    4. Keep it under 300 words.
    5. Format with clear paragraphs.
  `;
    // Reuse the main text generation function logic (or call it directly if exported/separated)
    // Here we just call the proxy directly to avoid http overhead of self-call
    const proxy = new DeepSeekProxy();
    try {
        const quotaCheck = await proxy.checkQuota(context.auth.uid);
        if (!quotaCheck.canProceed) {
            throw new functions.https.HttpsError('resource-exhausted', 'Quota exceeded');
        }
        const messages = [
            { role: 'system', content: 'You are an expert car copywriter.' },
            { role: 'user', content: prompt }
        ];
        const aiResponse = await proxy.callDeepSeekAPI(messages);
        await proxy.incrementUsage(context.auth.uid);
        return {
            success: true,
            content: aiResponse.choices[0].message.content,
            usage: aiResponse.usage
        };
    }
    catch (error) {
        throw new functions.https.HttpsError('internal', error.message);
    }
});
//# sourceMappingURL=deepseek-proxy.js.map