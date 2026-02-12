import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v1';
import axios from 'axios';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

// Use environment variables (process.env) instead of deprecated config methods
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

// Quota configuration based on user type
const QUOTA_CONFIG: Record<string, { monthly: number; daily: number }> = {
    'private': { monthly: 10, daily: 3 },
    'dealer': { monthly: 100, daily: 10 },
    'company': { monthly: 1000, daily: 50 },
};

/**
 * Proxy class to handle DeepSeek API interactions securely
 */
export class DeepSeekProxy {
    /**
     * Check if the user has enough quota to proceed
     */
    async checkQuota(userId: string): Promise<{ canProceed: boolean; remaining: number }> {
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            console.warn(`[checkQuota] User ${userId} not found in Firestore. assuming private.`);
        }

        const userData = userDoc.data();
        const userType = userData?.profileType || 'private';
        const month = new Date().toISOString().slice(0, 7); // YYYY-MM

        const currentUsage = userData?.aiUsage?.[month] || 0;
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
    async incrementUsage(userId: string): Promise<void> {
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
    async callDeepSeekAPI(
        messages: { role: string; content: string }[],
        model: string = 'deepseek-chat',
        temperature: number = 0.7
    ): Promise<string> {
        if (!DEEPSEEK_API_KEY) {
            throw new Error('DeepSeek API key not configured');
        }

        const response = await axios.post(
            `${DEEPSEEK_BASE_URL}/chat/completions`,
            {
                model,
                messages,
                temperature,
                max_tokens: 2048
            },
            {
                headers: {
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data.choices[0]?.message?.content || 'No response';
    }

    /**
     * Moderate content
     */
    async moderateContent(prompt: string): Promise<boolean> {
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

/**
 * Cloud Function: General Text Generation
 */
export const aiGenerateText = functions.https.onCall(async (data, context) => {
    // 1. Authentication Check
    const { auth } = context;

    if (!auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'You must be logged in to use AI features.'
        );
    }

    const userId = auth.uid;
    const proxy = new DeepSeekProxy();

    try {
        // 2. Quota Check
        const quotaCheck = await proxy.checkQuota(userId);
        if (!quotaCheck.canProceed) {
            throw new functions.https.HttpsError(
                'resource-exhausted',
                'Monthly AI quota exceeded.',
            );
        }

        // 3. Moderation
        const isSafe = await proxy.moderateContent((data as any).prompt);
        if (!isSafe) {
            // Log violation
            await db.collection('ai_moderation_logs').add({
                userId,
                prompt: (data as any).prompt.substring(0, 500),
                timestamp: new Date().toISOString(),
                reason: 'Content violates safety policy'
            });

            throw new functions.https.HttpsError(
                'permission-denied',
                'Your request contains content that violates our policies.'
            );
        }

        // 4. API Call
        const messages = [
            { role: 'system', content: (data as any).systemMessage || 'You are a helpful automotive assistant for the Bulgarian market. Reply in Bulgarian unless asked otherwise.' },
            { role: 'user', content: (data as any).prompt }
        ];

        const aiResponse = await proxy.callDeepSeekAPI(messages, (data as any).model, (data as any).temperature);

        // 5. Log & Increment
        await db.collection('ai_usage_logs').add({
            userId,
            timestamp: new Date().toISOString(),
            type: 'text-generation',
            model: (data as any).model || 'deepseek-chat',
            promptLength: (data as any).prompt.length,
            success: true
        });

        await proxy.incrementUsage(userId);

        // 6. Return Response
        return {
            response: aiResponse,
            model: (data as any).model || 'deepseek-chat',
            success: true
        };
    } catch (error: any) {
        console.error('[aiGenerateText]', error);

        // Log error
        await db.collection('ai_errors').add({
            userId,
            timestamp: new Date().toISOString(),
            error: error.message,
            type: 'text-generation'
        });

        throw new functions.https.HttpsError(
            'internal',
            error.message || 'Failed to generate text'
        );
    }
});

/**
 * Cloud Function: Car Description Generation
 */
export const aiGenerateCarDescription = functions.https.onCall(async (data, context) => {
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
    Write a marketing description in ${(data as any).language === 'en' ? 'English' : 'Bulgarian'} for the following car:
    
    Make: ${(data as any).make}
    Model: ${(data as any).model}
    Year: ${(data as any).year}
    Fuel: ${(data as any).fuelType}
    Mileage: ${(data as any).mileage} km
    Price: ${(data as any).price} ${(data as any).currency}
    Location: ${(data as any).city}
    ${(data as any).equipment ? `Features: ${(data as any).equipment.join(', ')}` : ''}
    
    Style: ${(data as any).style || 'professional'} (Professional, confident, trustworthy).
    
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
    } catch (error: any) {
        console.error('[aiGenerateCarDescription]', error);

        throw new functions.https.HttpsError('internal', error.message || 'Failed to generate description');
    }
});


/**
 * Cloud Function: Complex Queries
 */
export const aiComplexQuery = functions.https.onCall(async (data, context) => {
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
        const isSafe = await proxy.moderateContent((data as any).query);
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
                content: (data as any).query
            }
        ];

        const response = await proxy.callDeepSeekAPI(messages, (data as any).model, (data as any).temperature);

        // Log usage
        await db.collection('ai_usage_logs').add({
            userId,
            timestamp: new Date().toISOString(),
            type: 'complex-query',
            queryLength: (data as any).query.length,
            success: true
        });

        await proxy.incrementUsage(userId);

        return {
            response,
            success: true
        };
    } catch (error: any) {
        console.error('[aiComplexQuery]', error);
        throw new functions.https.HttpsError('internal', error.message || 'Query processing failed');
    }
});
