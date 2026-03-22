"use strict";
/**
 * Hybrid AI Proxy - Server-side routing between Gemini and DeepSeek (v4 API)
 * Created: December 27, 2025
 * Phase: 4.1.2 - AI Integration Complete
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.hybridAIProxy = void 0;
const admin = require("firebase-admin");
const functions = require("firebase-functions/v1");
const axios_1 = require("axios");
// Initialize Firestore
const db = admin.firestore();
// Budget Limits (Monthly in USD)
const BUDGET_LIMITS = {
    gemini: 50.0,
    deepseek: 30.0,
};
// Cost Per Request
const COSTS = {
    gemini: 0.002,
    deepseek: 0.0004,
};
/**
 * Check current budget status
 */
async function checkBudgetStatus() {
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    const statsRef = db.doc('ai_cost_tracking/monthly_stats');
    const statsDoc = await statsRef.get();
    if (!statsDoc.exists) {
        return {
            geminiExceeded: false,
            deepseekExceeded: false,
            geminiRemaining: BUDGET_LIMITS.gemini,
            deepseekRemaining: BUDGET_LIMITS.deepseek,
        };
    }
    const data = statsDoc.data();
    const geminiData = data.gemini || {
        monthlySpent: 0,
        lastReset: currentMonth,
    };
    const deepseekData = data.deepseek || {
        monthlySpent: 0,
        lastReset: currentMonth,
    };
    // Auto-reset if new month
    const geminiSpent = geminiData.lastReset === currentMonth ? geminiData.monthlySpent : 0;
    const deepseekSpent = deepseekData.lastReset === currentMonth ? deepseekData.monthlySpent : 0;
    return {
        geminiExceeded: geminiSpent >= BUDGET_LIMITS.gemini,
        deepseekExceeded: deepseekSpent >= BUDGET_LIMITS.deepseek,
        geminiRemaining: Math.max(0, BUDGET_LIMITS.gemini - geminiSpent),
        deepseekRemaining: Math.max(0, BUDGET_LIMITS.deepseek - deepseekSpent),
    };
}
/**
 * Select best provider based on budget and operation type
 */
function selectProvider(operationType, userType, budget) {
    // If both exceeded, prefer cheaper option
    if (budget.geminiExceeded && budget.deepseekExceeded) {
        return {
            provider: 'deepseek',
            reason: 'Both budgets exceeded, using cheaper provider',
            estimatedCost: COSTS.deepseek,
        };
    }
    // If one exceeded, use the other
    if (budget.geminiExceeded) {
        return {
            provider: 'deepseek',
            reason: 'Gemini budget exceeded',
            estimatedCost: COSTS.deepseek,
        };
    }
    if (budget.deepseekExceeded) {
        return {
            provider: 'gemini',
            reason: 'DeepSeek budget exceeded',
            estimatedCost: COSTS.gemini,
        };
    }
    // For complex operations, prefer Gemini; for bulk, prefer DeepSeek
    if (operationType === 'bulk') {
        return {
            provider: 'deepseek',
            reason: 'Bulk operation - cost-optimized',
            estimatedCost: COSTS.deepseek,
        };
    }
    // Default: alternate to balance costs
    const isOddMinute = new Date().getMinutes() % 2 === 1;
    return {
        provider: isOddMinute ? 'gemini' : 'deepseek',
        reason: 'Load balanced',
        estimatedCost: isOddMinute ? COSTS.gemini : COSTS.deepseek,
    };
}
/**
 * Call Gemini API
 */
async function callGemini(prompt, language) {
    const API_KEY = process.env.GOOGLE_GENERATIVE_AI_KEY;
    if (!API_KEY) {
        throw new Error('Gemini API key not configured');
    }
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const ai = new GoogleGenerativeAI(API_KEY);
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(`[Language: ${language}] ${prompt}`);
    const response = result.response;
    return response.text();
}
/**
 * Call DeepSeek API
 */
async function callDeepSeek(prompt, language) {
    var _a, _b;
    const API_KEY = process.env.DEEPSEEK_API_KEY;
    if (!API_KEY) {
        throw new Error('DeepSeek API key not configured');
    }
    const response = await axios_1.default.post('https://api.deepseek.com/chat/completions', {
        model: 'deepseek-chat',
        messages: [
            {
                role: 'system',
                content: `You are an automotive expert. Respond in ${language === 'bg' ? 'Bulgarian' : 'English'}.`,
            },
            { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
    }, {
        headers: {
            Authorization: `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
        },
    });
    return ((_b = (_a = response.data.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || 'No response';
}
/**
 * Track AI cost in Firestore
 */
async function trackCost(provider, cost) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const statsRef = db.doc('ai_cost_tracking/monthly_stats');
    const providerKey = `${provider}.monthlySpent`;
    const resetKey = `${provider}.lastReset`;
    await statsRef.set({
        [providerKey]: admin.firestore.FieldValue.increment(cost),
        [resetKey]: currentMonth,
        lastUpdated: new Date().toISOString(),
    }, { merge: true });
}
/**
 * Build prompt from vehicle data
 */
function buildPrompt(vehicleData, language) {
    const { make, model, year, fuelType, transmission, mileage, engineSize, power, equipment, condition, color, } = vehicleData;
    let prompt = language === 'bg' ? `Напиши описание на:\n` : `Write a description for:\n`;
    prompt += `${make} ${model} (${year})\n`;
    if (color)
        prompt += `Color: ${color}\n`;
    if (fuelType)
        prompt += `Fuel: ${fuelType}\n`;
    if (transmission)
        prompt += `Transmission: ${transmission}\n`;
    if (mileage)
        prompt += `Mileage: ${mileage} km\n`;
    if (engineSize)
        prompt += `Engine: ${engineSize}\n`;
    if (power)
        prompt += `Power: ${power} HP\n`;
    if (condition)
        prompt += `Condition: ${condition}\n`;
    if (equipment && equipment.length > 0) {
        prompt += `Equipment:\n`;
        equipment.forEach((item) => (prompt += `• ${item}\n`));
    }
    prompt += `\nThe description should:\n`;
    prompt += `- Be in ${language === 'bg' ? 'Bulgarian' : 'English'}\n`;
    prompt += `- Be between 150-250 words\n`;
    prompt += `- Highlight the vehicle's advantages\n`;
    prompt += `- Be professional and attractive\n`;
    prompt += `- Create emotional connection with buyers\n`;
    return prompt;
}
/**
 * Hybrid AI Proxy Callable Function (v2 API)
 */
exports.hybridAIProxy = functions.https.onCall(async (data, context) => {
    // Auth check — only authenticated users can use AI services
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required to use AI services');
    }
    try {
        const requestData = data;
        const { vehicleData, options } = requestData;
        const { language = 'bg', userType = 'private', operationType = 'single', forceProvider, } = options;
        // Check budget status
        const budgetStatus = await checkBudgetStatus();
        // Select provider
        const decision = forceProvider
            ? {
                provider: forceProvider,
                reason: 'Manually forced',
                estimatedCost: COSTS[forceProvider],
            }
            : selectProvider(operationType, userType, budgetStatus);
        console.log('[hybridAIProxy] Routing Decision:', decision);
        // Build prompt
        const prompt = buildPrompt(vehicleData, language);
        // Call selected provider
        let description;
        try {
            if (decision.provider === 'gemini') {
                description = await callGemini(prompt, language);
            }
            else {
                description = await callDeepSeek(prompt, language);
            }
        }
        catch (error) {
            console.error(`[hybridAIProxy] ${decision.provider} API failed:`, error.message);
            // Fallback to other provider
            const fallbackProvider = decision.provider === 'gemini' ? 'deepseek' : 'gemini';
            console.log(`[hybridAIProxy] Falling back to ${fallbackProvider}`);
            if (fallbackProvider === 'gemini') {
                description = await callGemini(prompt, language);
            }
            else {
                description = await callDeepSeek(prompt, language);
            }
            decision.provider = fallbackProvider;
        }
        // Track cost
        await trackCost(decision.provider, decision.estimatedCost);
        // Return result
        return {
            description,
            provider: decision.provider,
            cost: decision.estimatedCost,
            generatedBy: 'ai',
            budgetStatus: {
                geminiRemaining: budgetStatus.geminiRemaining -
                    (decision.provider === 'gemini' ? decision.estimatedCost : 0),
                deepseekRemaining: budgetStatus.deepseekRemaining -
                    (decision.provider === 'deepseek' ? decision.estimatedCost : 0),
            },
        };
    }
    catch (error) {
        console.error('[hybridAIProxy] Error:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
//# sourceMappingURL=hybrid-ai-proxy.js.map