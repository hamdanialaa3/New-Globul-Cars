// Profile Analysis via Gemini (Server-side)
// تحليل البروفايل عبر Gemini من الخادم

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { defineSecret } from 'firebase-functions/params';
import { getFirestore } from 'firebase-admin/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';

const db = getFirestore();
const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');
const GEMINI_MODEL = defineSecret('GEMINI_MODEL');

interface ProfileAnalysisReq {
  profileData: any;
}

export const analyzeProfileAI = onCall<ProfileAnalysisReq>(
  { region: 'europe-west1', secrets: [GEMINI_API_KEY, GEMINI_MODEL] },
  async (request) => {
    try {
      const { data, auth } = request;
      if (!data?.profileData) {
        throw new HttpsError('invalid-argument', 'Missing profileData');
      }

      const apiKey = GEMINI_API_KEY.value() || process.env.GEMINI_API_KEY;
      if (!apiKey) throw new HttpsError('failed-precondition', 'GEMINI_API_KEY not configured');
      const modelName = GEMINI_MODEL.value() || process.env.GEMINI_MODEL || 'gemini-1.5-flash';

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `
        Analyze this user profile for a car marketplace and return JSON only with keys:
        completeness, trustScore, suggestions, missingFields.
        Profile:
        ${JSON.stringify(data.profileData)}
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const analysis = extractJSON(text);

      if (auth?.uid) {
        try {
          await db.collection('ai_usage_logs').add({
            userId: auth.uid,
            feature: 'profile_analysis',
            success: true,
            timestamp: new Date(),
            metadata: { completeness: analysis?.completeness }
          });
        } catch (e) {
          logger.warn('Failed to log profile analysis usage', e as Error);
        }
      }

      return analysis;

    } catch (error) {
      logger.error('Profile analysis (server) error', error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError('internal', 'Failed to analyze profile');
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
