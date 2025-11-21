// Price Suggestion via Gemini (Server-side)
// اقتراح السعر عبر Gemini من الخادم

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { defineSecret } from 'firebase-functions/params';
import { getFirestore } from 'firebase-admin/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';

const db = getFirestore();
const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');
const GEMINI_MODEL = defineSecret('GEMINI_MODEL');

interface PriceSuggestionReq {
  make: string;
  model: string;
  year: number;
  mileage: number;
  condition: string;
  location: string;
}

export const suggestPriceAI = onCall<PriceSuggestionReq>(
  { region: 'europe-west1', secrets: [GEMINI_API_KEY, GEMINI_MODEL] },
  async (request) => {
    try {
      const { data, auth } = request;

      const required = ['make','model','year','mileage','condition','location'] as const;
      for (const k of required) {
        if (data[k] === undefined || data[k] === null || data[k] === '') {
          throw new HttpsError('invalid-argument', `Missing field: ${k}`);
        }
      }

      const apiKey = GEMINI_API_KEY.value() || process.env.GEMINI_API_KEY;
      if (!apiKey) throw new HttpsError('failed-precondition', 'GEMINI_API_KEY not configured');
      const modelName = GEMINI_MODEL.value() || process.env.GEMINI_MODEL || 'gemini-1.5-flash';

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `
        As a Bulgarian car market expert, suggest a fair price.
        Car: ${data.make} ${data.model} ${data.year}
        Mileage: ${data.mileage} km
        Condition: ${data.condition}
        Location: ${data.location}
        Return JSON only with keys: minPrice, avgPrice, maxPrice, reasoning, marketTrend.
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const suggestion = extractJSON(text);

      // Server-side usage log
      if (auth?.uid) {
        try {
          await db.collection('ai_usage_logs').add({
            userId: auth.uid,
            feature: 'price_suggestion',
            success: true,
            timestamp: new Date(),
            metadata: { car: `${data.make} ${data.model}`, avgPrice: suggestion?.avgPrice }
          });
        } catch (e) {
          logger.warn('Failed to log price suggestion usage', e as Error);
        }
      }

      return suggestion;

    } catch (error) {
      logger.error('Price suggestion (server) error', error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError('internal', 'Failed to suggest price');
    }
  }
);

function extractJSON(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    if (match) {
      const s = (match[1] || match[0]);
      return JSON.parse(s);
    }
    throw new Error('No valid JSON');
  }
}
