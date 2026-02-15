// Gemini Vision Service - FREE + PAID Image Analysis
// مجاني + مدفوع مع نظام الحصص

import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase/firebase-config';
import { CarAnalysisResult, ImageQualityAnalysis } from '../../types/ai.types';
import { logger } from '../logger-service';
import { aiQuotaService } from './ai-quota.service';

class GeminiVisionService {
  private isInitialized = true; // Always true now as we use Cloud Functions

  constructor() {
    // No local API key needed anymore!
  }

  async analyzeCarImage(imageFile: File, userId?: string): Promise<CarAnalysisResult> {
    // Check quota if userId provided (Fail fast UX)
    if (userId) {
      const quotaCheck = await aiQuotaService.canUseFeature(userId, 'image_analysis');
      if (!quotaCheck.allowed) {
        throw new Error(quotaCheck.reason || 'Quota exceeded');
      }
    }

    try {
      logger.debug('Analyzing car image via Cloud Function', { userId });

      const base64Full = await this.fileToBase64(imageFile);
      const base64 = base64Full.split(',')[1];
      const mimeType = imageFile.type;

      const analyzeCarImageFn = httpsCallable(functions, 'analyzeCarImage');
      const result = await analyzeCarImageFn({
        imageBase64: base64,
        mimeType: mimeType
      });

      const parsed = result.data as CarAnalysisResult;

      logger.info('Car image analyzed successfully', {
        make: parsed.make,
        confidence: parsed.confidence
      });

      // Note: Usage tracking is now handled validation-side in the Cloud Function

      return parsed;

    } catch (error: any) {
      logger.error('Gemini Vision error', error);
      throw new Error('Failed to analyze image. Please try again.');
    }
  }

  async analyzeImageQuality(imageFile: File, userId?: string): Promise<ImageQualityAnalysis> {
    // Check quota
    if (userId) {
      const quotaCheck = await aiQuotaService.canUseFeature(userId, 'image_analysis');
      if (!quotaCheck.allowed) {
        throw new Error(quotaCheck.reason || 'Quota exceeded');
      }
    }

    try {
      const base64Full = await this.fileToBase64(imageFile);
      const base64 = base64Full.split(',')[1];
      const mimeType = imageFile.type;

      const analyzeImageQualityFn = httpsCallable(functions, 'analyzeImageQuality');
      const result = await analyzeImageQualityFn({
        imageBase64: base64,
        mimeType: mimeType
      });

      return result.data as ImageQualityAnalysis;

    } catch (error: any) {
      logger.error('Image quality analysis error', error);
      throw error;
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}

export const geminiVisionService = new GeminiVisionService();
export default geminiVisionService;
