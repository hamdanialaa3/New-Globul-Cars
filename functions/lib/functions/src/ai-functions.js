"use strict";
/**
 * Firebase Cloud Functions - AI Functions
 * دوال الذكاء الاصطناعي على Firebase
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsapp = exports.getRecommendations = exports.processVoiceMessage = exports.detectLanguageAndTranslate = exports.whatsappWebhook = exports.sentimentAnalysis = exports.geminiProfileAnalysis = exports.geminiPriceSuggestion = exports.geminiChat = exports.aiQuotaCheck = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const generative_ai_1 = require("@google/generative-ai");
// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
// Initialize Gemini
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_KEY || '');
// ==================== AI QUOTA MANAGEMENT ====================
/**
 * Check AI quota for user
 */
exports.aiQuotaCheck = functions.https.onCall(async (data, context) => {
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
                lastBillingDate: new Date().toISOString().split('T')[0]
            };
            await quotaRef.set(newQuota);
            return { allowed: true, remaining: newQuota[`daily${feature}`] };
        }
        const quota = quotaSnap.data();
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
    }
    catch (error) {
        console.error('Quota check error:', error);
        throw new functions.https.HttpsError('internal', 'Error checking quota');
    }
});
// ==================== GEMINI CHAT ====================
/**
 * Chat with Gemini AI
 */
exports.geminiChat = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
    }
    const userId = context.auth.uid;
    const { message, context: userContext } = data;
    try {
        // Check quota
        const quotaCheck = await db.collection('ai_quotas').doc(userId).get();
        if (!quotaCheck.exists) {
            throw new functions.https.HttpsError('failed-precondition', 'User quota not initialized');
        }
        const quota = quotaCheck.data();
        const today = new Date().toISOString().split('T')[0];
        if ((quota === null || quota === void 0 ? void 0 : quota.lastResetDate) !== today) {
            await db.collection('ai_quotas').doc(userId).update({
                usedChatMessages: 0,
                lastResetDate: today
            });
        }
        if (((quota === null || quota === void 0 ? void 0 : quota.usedChatMessages) || 0) >= ((quota === null || quota === void 0 ? void 0 : quota.dailyChatMessages) || 10)) {
            throw new functions.https.HttpsError('resource-exhausted', 'Chat quota exceeded');
        }
        // Call Gemini
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent(message);
        const response = result.response.text();
        // Update quota
        await db.collection('ai_quotas').doc(userId).update({
            usedChatMessages: admin.firestore.FieldValue.increment(1),
            totalCost: admin.firestore.FieldValue.increment(0.001) // Cost per message
        });
        // Log usage
        await db.collection('ai_usage_logs').add({
            userId,
            feature: 'chat',
            timestamp: Date.now(),
            cost: 0.001,
            tier: (quota === null || quota === void 0 ? void 0 : quota.tier) || 'free',
            success: true
        });
        return { message: response, quotaRemaining: ((quota === null || quota === void 0 ? void 0 : quota.dailyChatMessages) || 10) - ((quota === null || quota === void 0 ? void 0 : quota.usedChatMessages) || 0) - 1 };
    }
    catch (error) {
        console.error('Gemini chat error:', error);
        throw new functions.https.HttpsError('internal', 'Chat failed');
    }
});
// ==================== PRICE SUGGESTION ====================
/**
 * Suggest price for car using Gemini
 */
exports.geminiPriceSuggestion = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
    }
    const userId = context.auth.uid;
    const { make, model, year, mileage, condition, location } = data;
    try {
        const model_obj = genAI.getGenerativeModel({ model: 'gemini-pro' });
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
        const result = await model_obj.generateContent(prompt);
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
    }
    catch (error) {
        console.error('Price suggestion error:', error);
        throw new functions.https.HttpsError('internal', 'Price suggestion failed');
    }
});
// ==================== PROFILE ANALYSIS ====================
/**
 * Analyze user profile
 */
exports.geminiProfileAnalysis = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
    }
    const userId = context.auth.uid;
    const { profileData } = data;
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = `
    Analyze this user profile for a car marketplace:
    ${JSON.stringify(profileData, null, 2)}
    
    Provide JSON:
    {
      "completeness": 0-100,
      "trustScore": 0-100,
      "suggestions": ["array of suggestions"],
      "missingFields": ["array of missing fields"]
    }
    `;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse analysis');
        }
        const analysis = JSON.parse(jsonMatch[0]);
        // Update quota
        await db.collection('ai_quotas').doc(userId).update({
            usedProfileAnalysis: admin.firestore.FieldValue.increment(1)
        });
        return analysis;
    }
    catch (error) {
        console.error('Profile analysis error:', error);
        throw new functions.https.HttpsError('internal', 'Profile analysis failed');
    }
});
// ==================== SENTIMENT ANALYSIS ====================
/**
 * Analyze sentiment of text
 */
exports.sentimentAnalysis = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
    }
    const userId = context.auth.uid;
    const { text, language = 'en' } = data;
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = `
    Analyze the sentiment of this text (${language}):
    "${text}"
    
    Return JSON:
    {
      "sentiment": "positive|neutral|negative",
      "score": -1 to 1,
      "confidence": 0-100,
      "keywords": ["key words"],
      "summary": "brief summary"
    }
    `;
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse sentiment');
        }
        const sentiment = JSON.parse(jsonMatch[0]);
        // Update quota
        await db.collection('ai_quotas').doc(userId).update({
            usedSentimentAnalysis: admin.firestore.FieldValue.increment(1)
        });
        // Log analysis
        await db.collection('sentiment_logs').add({
            userId,
            text: text.slice(0, 100),
            sentiment: sentiment.sentiment,
            score: sentiment.score,
            timestamp: Date.now(),
            language
        });
        return sentiment;
    }
    catch (error) {
        console.error('Sentiment analysis error:', error);
        throw new functions.https.HttpsError('internal', 'Sentiment analysis failed');
    }
});
// ==================== WHATSAPP MESSAGE PROCESSING ====================
/**
 * Process WhatsApp webhook
 */
exports.whatsappWebhook = functions.https.onRequest(async (req, res) => {
    var _a, _b, _c, _d;
    // Verify webhook
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'your-verify-token';
    if (req.method === 'GET') {
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];
        if (token === verifyToken) {
            res.send(challenge);
            return;
        }
        res.status(403).send('Forbidden');
        return;
    }
    if (req.method === 'POST') {
        try {
            const body = req.body;
            if (body.object === 'whatsapp_business_account') {
                const message = (_d = (_c = (_b = (_a = body.entry[0]) === null || _a === void 0 ? void 0 : _a.changes[0]) === null || _b === void 0 ? void 0 : _b.value) === null || _c === void 0 ? void 0 : _c.messages) === null || _d === void 0 ? void 0 : _d[0];
                if (message) {
                    await processWhatsAppMessage(message);
                }
            }
            res.status(200).send('EVENT_RECEIVED');
        }
        catch (error) {
            console.error('WhatsApp webhook error:', error);
            res.status(500).send('Error');
        }
    }
});
/**
 * Process single WhatsApp message
 */
async function processWhatsAppMessage(message) {
    try {
        const { from, text, type } = message;
        if (type === 'text') {
            // Get AI response
            const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
            const result = await model.generateContent(text.body);
            const response = result.response.text();
            // Send back via WhatsApp
            await sendWhatsAppMessage(from, response);
            // Log conversation
            await db.collection('whatsapp_conversations').add({
                phone: from,
                userMessage: text.body,
                aiResponse: response,
                timestamp: Date.now(),
                type: 'text'
            });
        }
    }
    catch (error) {
        console.error('Error processing WhatsApp message:', error);
    }
}
/**
 * Send WhatsApp message
 */
async function sendWhatsAppMessage(phone, message) {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const apiVersion = process.env.WHATSAPP_API_VERSION || 'v18.0';
    try {
        const response = await fetch(`https://graph.instagram.com/${apiVersion}/${phoneNumberId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: phone,
                type: 'text',
                text: {
                    body: message
                }
            })
        });
        if (!response.ok) {
            throw new Error(`WhatsApp API error: ${response.statusText}`);
        }
        return await response.json();
    }
    catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw error;
    }
}
// ==================== MULTI-LANGUAGE NLU ====================
/**
 * Detect language and translate
 */
exports.detectLanguageAndTranslate = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
    }
    const { text, targetLanguage = 'en' } = data;
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = `
    Detect the language and translate to ${targetLanguage}:
    "${text}"
    
    Return JSON:
    {
      "detectedLanguage": "language code",
      "confidence": 0-100,
      "translation": "translated text",
      "originalText": "${text}"
    }
    `;
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse language detection');
        }
        return JSON.parse(jsonMatch[0]);
    }
    catch (error) {
        console.error('Language detection error:', error);
        throw new functions.https.HttpsError('internal', 'Language detection failed');
    }
});
// ==================== VOICE MESSAGE PROCESSING ====================
/**
 * Process voice message (mock - requires Whisper API)
 */
exports.processVoiceMessage = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
    }
    const userId = context.auth.uid;
    const { audioUrl, language = 'en' } = data;
    try {
        // Note: For real implementation, use OpenAI Whisper API
        // This is a placeholder
        const prompt = `
    Transcribe this audio message (${language}) and provide:
    {
      "transcript": "transcribed text",
      "confidence": 0-100,
      "language": "detected language",
      "duration": "audio duration in seconds"
    }
    `;
        // Update quota
        await db.collection('ai_quotas').doc(userId).update({
            usedVoiceMessages: admin.firestore.FieldValue.increment(1)
        });
        return {
            transcript: 'Voice transcription requires Whisper API',
            confidence: 0,
            language,
            duration: 0
        };
    }
    catch (error) {
        console.error('Voice processing error:', error);
        throw new functions.https.HttpsError('internal', 'Voice processing failed');
    }
});
// ==================== RECOMMENDATION ENGINE ====================
/**
 * Get personalized car recommendations
 */
exports.getRecommendations = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
    }
    const userId = context.auth.uid;
    const { preferences, maxResults = 10 } = data;
    try {
        // Get user behavior
        const viewsRef = db.collection('car_views').where('userId', '==', userId);
        const viewsSnap = await viewsRef.limit(20).get();
        const views = viewsSnap.docs.map(doc => doc.data());
        // Analyze preferences
        const likes = {
            makes: {},
            priceRanges: {},
            years: {},
            fuelTypes: {},
            transmissions: {}
        };
        views.forEach(view => {
            // Count preferences
            likes.makes[view.make] = (likes.makes[view.make] || 0) + 1;
            likes.priceRanges[view.priceRange] = (likes.priceRanges[view.priceRange] || 0) + 1;
            // ... more analysis
        });
        // Query cars matching preferences
        const carsRef = db.collectionGroup('cars');
        const recommendations = await carsRef.limit(maxResults).get();
        // Score and sort
        const scored = recommendations.docs.map(doc => {
            const car = doc.data();
            let score = 0;
            if (likes.makes[car.make])
                score += 50;
            if (preferences.maxPrice && car.price <= preferences.maxPrice)
                score += 30;
            if (preferences.minYear && car.year >= preferences.minYear)
                score += 20;
            return { car, score, docId: doc.id };
        })
            .sort((a, b) => b.score - a.score)
            .slice(0, maxResults);
        return {
            recommendations: scored.map(r => r.car),
            scores: scored.map(r => r.score),
            reasoning: 'Based on your viewing history and preferences'
        };
    }
    catch (error) {
        console.error('Recommendations error:', error);
        throw new functions.https.HttpsError('internal', 'Recommendations failed');
    }
});
// Export webhook
exports.whatsapp = exports.whatsappWebhook;
//# sourceMappingURL=ai-functions.js.map