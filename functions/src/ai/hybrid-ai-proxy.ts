/**
 * Hybrid AI Proxy - Server-side routing between Gemini and DeepSeek
 * Created: December 27, 2025
 * Phase: 4.1.2 - AI Integration Complete
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

const logger = functions.logger;

// Initialize Firestore
const db = admin.firestore();

// Type Definitions
type AIProvider = 'gemini' | 'deepseek';
type OperationType = 'single' | 'bulk' | 'analysis' | 'image' | 'chat' | 'market-insights';
type UserType = 'private' | 'dealer' | 'company';

interface HybridAIRequest {
  vehicleData: {
    make: string;
    model: string;
    year: number;
    fuelType?: string;
    transmission?: string;
    mileage?: number;
    engineSize?: string;
    power?: number;
    equipment?: string[];
    condition?: 'excellent' | 'good' | 'fair';
    color?: string;
  };
  options: {
    language: 'bg' | 'en';
    userType?: UserType;
    operationType?: OperationType;
    forceProvider?: AIProvider;
  };
}

interface RoutingDecision {
  provider: AIProvider;
  reason: string;
  estimatedCost: number;
}

interface BudgetStatus {
  geminiExceeded: boolean;
  deepseekExceeded: boolean;
  geminiRemaining: number;
  deepseekRemaining: number;
}

// Budget Limits (Monthly in USD)
const BUDGET_LIMITS = {
  gemini: 50.0,
  deepseek: 30.0
};

// Cost Per Request
const COSTS = {
  gemini: 0.002,
  deepseek: 0.0004
};

/**
 * Check current budget status
 */
async function checkBudgetStatus(): Promise<BudgetStatus> {
  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const statsRef = db.doc('ai_cost_tracking/monthly_stats');
  const statsDoc = await statsRef.get();

  if (!statsDoc.exists) {
    return {
      geminiExceeded: false,
      deepseekExceeded: false,
      geminiRemaining: BUDGET_LIMITS.gemini,
      deepseekRemaining: BUDGET_LIMITS.deepseek
    };
  }

  const data = statsDoc.data()!;
  const geminiData = data.gemini || { monthlySpent: 0, lastReset: currentMonth };
  const deepseekData = data.deepseek || { monthlySpent: 0, lastReset: currentMonth };

  // Auto-reset if new month
  const geminiSpent = geminiData.lastReset === currentMonth ? geminiData.monthlySpent : 0;
  const deepseekSpent = deepseekData.lastReset === currentMonth ? deepseekData.monthlySpent : 0;

  return {
    geminiExceeded: geminiSpent >= BUDGET_LIMITS.gemini,
    deepseekExceeded: deepseekSpent >= BUDGET_LIMITS.deepseek,
    geminiRemaining: Math.max(0, BUDGET_LIMITS.gemini - geminiSpent),
    deepseekRemaining: Math.max(0, BUDGET_LIMITS.deepseek - deepseekSpent)
  };
}

/**
 * Track cost in Firestore
 */
async function trackCost(provider: AIProvider, cost: number): Promise<void> {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const statsRef = db.doc('ai_cost_tracking/monthly_stats');

  await statsRef.set(
    {
      [provider]: {
        monthlySpent: admin.firestore.FieldValue.increment(cost),
        requestCount: admin.firestore.FieldValue.increment(1),
        lastReset: currentMonth,
        lastUpdate: admin.firestore.FieldValue.serverTimestamp()
      }
    },
    { merge: true }
  );
}

/**
 * Smart provider selection
 */
function selectProvider(
  operationType: OperationType,
  userType: UserType,
  budgetStatus: BudgetStatus,
  bulkSize?: number
): RoutingDecision {
  // Image operations → Gemini only (Vision API required)
  if (operationType === 'image') {
    if (budgetStatus.geminiExceeded) {
      return {
        provider: 'deepseek',
        reason: 'Gemini budget exceeded, using DeepSeek (limited image support)',
        estimatedCost: COSTS.deepseek
      };
    }
    return {
      provider: 'gemini',
      reason: 'Image analysis requires Gemini Vision API',
      estimatedCost: COSTS.gemini
    };
  }

  // If Gemini budget exceeded, force DeepSeek
  if (budgetStatus.geminiExceeded && !budgetStatus.deepseekExceeded) {
    return {
      provider: 'deepseek',
      reason: 'Gemini budget exceeded, using DeepSeek',
      estimatedCost: COSTS.deepseek
    };
  }

  // Bulk operations → DeepSeek (cost-effective)
  if (operationType === 'bulk' || (bulkSize && bulkSize > 5)) {
    return {
      provider: 'deepseek',
      reason: 'Bulk operations optimized for cost',
      estimatedCost: COSTS.deepseek * (bulkSize || 1)
    };
  }

  // Market insights/analysis → DeepSeek (faster)
  if (operationType === 'market-insights' || operationType === 'analysis') {
    return {
      provider: 'deepseek',
      reason: 'Data analysis optimized',
      estimatedCost: COSTS.deepseek
    };
  }

  // Default → DeepSeek (balanced cost/performance)
  return {
    provider: 'deepseek',
    reason: 'Standard operations optimal cost/performance',
    estimatedCost: COSTS.deepseek
  };
}

/**
 * Call Gemini API
 */
async function callGemini(prompt: string, language: string): Promise<string> {
  const geminiKey = functions.config().gemini?.api_key;
  if (!geminiKey) {
    throw new Error('Gemini API key not configured');
  }

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000
      }
    }
  );

  return response.data.candidates[0].content.parts[0].text;
}

/**
 * Call DeepSeek API
 */
async function callDeepSeek(prompt: string, language: string): Promise<string> {
  const deepseekKey = functions.config().deepseek?.api_key;
  if (!deepseekKey) {
    throw new Error('DeepSeek API key not configured');
  }

  const response = await axios.post(
    'https://api.deepseek.com/v1/chat/completions',
    {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: language === 'bg' 
            ? 'Вие сте професионален автомобилен експерт. Генерирайте атрактивно описание на български език.'
            : 'You are a professional automotive expert. Generate an attractive description.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    },
    {
      headers: {
        'Authorization': `Bearer ${deepseekKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.choices[0].message.content;
}

/**
 * Build prompt for vehicle description
 */
function buildPrompt(vehicleData: any, language: string): string {
  const { make, model, year, fuelType, transmission, mileage, power, equipment, condition } = vehicleData;

  if (language === 'bg') {
    let prompt = `Генерирай професионално и атрактивно описание за:\n\n`;
    prompt += `🚗 **${make} ${model}** (${year} г.)\n\n`;
    
    if (fuelType) prompt += `⛽ Гориво: ${fuelType}\n`;
    if (transmission) prompt += `⚙️ Скоростна кутия: ${transmission}\n`;
    if (mileage) prompt += `📏 Пробег: ${mileage.toLocaleString('bg-BG')} км\n`;
    if (power) prompt += `💪 Мощност: ${power} к.с.\n`;
    if (condition) prompt += `✨ Състояние: ${condition}\n`;
    
    if (equipment && equipment.length > 0) {
      prompt += `\n🔧 Оборудване:\n`;
      equipment.forEach((item: string) => prompt += `• ${item}\n`);
    }
    
    prompt += `\nОписанието трябва да:\n`;
    prompt += `- Бъде на български език\n`;
    prompt += `- Бъде между 150-250 думи\n`;
    prompt += `- Подчертае предимствата на автомобила\n`;
    prompt += `- Бъде професионално и привлекателно\n`;
    prompt += `- Включва емоционална връзка с купувача\n`;
    
    return prompt;
  } else {
    // English prompt (similar structure)
    let prompt = `Generate a professional and attractive description for:\n\n`;
    prompt += `🚗 **${make} ${model}** (${year})\n\n`;
    
    if (fuelType) prompt += `⛽ Fuel: ${fuelType}\n`;
    if (transmission) prompt += `⚙️ Transmission: ${transmission}\n`;
    if (mileage) prompt += `📏 Mileage: ${mileage.toLocaleString('en-US')} km\n`;
    if (power) prompt += `💪 Power: ${power} HP\n`;
    if (condition) prompt += `✨ Condition: ${condition}\n`;
    
    if (equipment && equipment.length > 0) {
      prompt += `\n🔧 Equipment:\n`;
      equipment.forEach((item: string) => prompt += `• ${item}\n`);
    }
    
    prompt += `\nThe description should:\n`;
    prompt += `- Be in English\n`;
    prompt += `- Be between 150-250 words\n`;
    prompt += `- Highlight the vehicle's advantages\n`;
    prompt += `- Be professional and attractive\n`;
    prompt += `- Create emotional connection with buyers\n`;
    
    return prompt;
  }
}

/**
 * Hybrid AI Proxy Callable Function
 */
export const hybridAIProxy = functions
  .region('europe-west1')
  .https.onCall(async (data: HybridAIRequest, context) => {
    try {
      // Auth check (optional - comment out for testing)
      // if (!context.auth) {
      //   throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
      // }

      const { vehicleData, options } = data;
      const { language = 'bg', userType = 'private', operationType = 'single', forceProvider } = options;

      // Check budget status
      const budgetStatus = await checkBudgetStatus();

      // Select provider
      const decision = forceProvider
        ? { provider: forceProvider, reason: 'Manually forced', estimatedCost: COSTS[forceProvider] }
        : selectProvider(operationType, userType, budgetStatus);

      logger.info('Hybrid AI Routing Decision:', decision);

      // Build prompt
      const prompt = buildPrompt(vehicleData, language);

      // Call selected provider
      let description: string;
      try {
        if (decision.provider === 'gemini') {
          description = await callGemini(prompt, language);
        } else {
          description = await callDeepSeek(prompt, language);
        }
      } catch (error: any) {
        logger.error(`${decision.provider} API failed:`, error.message);
        
        // Fallback to other provider
        const fallbackProvider = decision.provider === 'gemini' ? 'deepseek' : 'gemini';
        logger.info(`Falling back to ${fallbackProvider}`);
        
        if (fallbackProvider === 'gemini') {
          description = await callGemini(prompt, language);
        } else {
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
          geminiRemaining: budgetStatus.geminiRemaining - (decision.provider === 'gemini' ? decision.estimatedCost : 0),
          deepseekRemaining: budgetStatus.deepseekRemaining - (decision.provider === 'deepseek' ? decision.estimatedCost : 0)
        }
      };

    } catch (error: any) {
      logger.error('Hybrid AI Proxy Error:', error);
      throw new functions.https.HttpsError('internal', error.message);
    }
  });
