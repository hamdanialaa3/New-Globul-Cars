/**
 * Gemini Analysis Service
 * AI-powered car analysis routed through Firebase Cloud Functions
 *
 * SECURITY: No API keys on the client side.
 * All AI calls go through Cloud Functions which hold the Gemini API key server-side.
 *
 * Features:
 * - Car image analysis (brand, model, year, condition) via CF `analyzeCarImage`
 * - Price estimation via CF `geminiPriceSuggestion`
 * - Equipment/options suggestions via CF `geminiChat` (structured prompt)
 * - Quota management handled server-side
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from '@/firebase/firebase-config';
import { logger } from '@/services/logger-service';
import {
  GeminiCarAnalysisResult,
  PriceEstimate,
  EquipmentSuggestions,
  CarDataForPricing,
} from '@/types/ai-analysis.types';

class GeminiAnalysisService {
  // Cloud Functions are always ready — availability is checked server-side
  private readonly isInitialized = true;

  /**
   * Check if service is ready (always true — Cloud Functions handle availability)
   */
  public isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Analyze car image and extract information via Cloud Functions
   * @param imageBase64 - Base64 encoded image (without data URL prefix)
   * @returns Analysis result with brand, model, year, etc.
   */
  public async analyzeCarImage(imageBase64: string): Promise<GeminiCarAnalysisResult> {
    logger.info('Starting car image analysis via Cloud Function');

    try {
      const analyzeCarImageFn = httpsCallable(functions, 'analyzeCarImage');
      const result = await analyzeCarImageFn({
        imageBase64,
        mimeType: 'image/jpeg'
      });

      // Adapt Cloud Function response to GeminiCarAnalysisResult format
      const raw = result.data as Record<string, unknown>;
      const confidence = (typeof raw.confidence === 'number' ? raw.confidence : 80) / 100;

      const analysisResult: GeminiCarAnalysisResult = {
        brand: { value: (raw.make as string) || '', confidence },
        model: { value: (raw.model as string) || '', confidence },
        yearRange: { value: (raw.year as string) || '', confidence },
        bodyType: { value: (raw.bodyType as string) || '', confidence: confidence * 0.8 },
        color: { value: (raw.color as string) || '', confidence },
        trim: { value: (raw.trim as string) || '', confidence: 0.5 },
        damage: { value: (raw.condition as string) || 'unknown', confidence: confidence * 0.7 },
        reasoning: Array.isArray(raw.suggestions) ? (raw.suggestions as string[]).join('. ') : ''
      };

      logger.info('Car analysis completed via Cloud Function', {
        brand: analysisResult.brand.value,
        model: analysisResult.model.value,
        confidence
      });

      return analysisResult;

    } catch (error: unknown) {
      logger.error('Car analysis via Cloud Function failed', error as Error);
      throw new Error('Failed to analyze car image. Please try again or enter details manually.');
    }
  }

  /**
   * Estimate car price via Cloud Functions
   * @param carData - Car information for pricing
   * @returns Array of price estimates
   */
  public async estimatePrice(carData: CarDataForPricing): Promise<PriceEstimate[]> {
    logger.info('Estimating car price via Cloud Function', {
      brand: carData.brand,
      model: carData.model,
      year: carData.year
    });

    try {
      const priceSuggestionFn = httpsCallable(functions, 'geminiPriceSuggestion');
      const result = await priceSuggestionFn({
        make: carData.brand,
        model: carData.model,
        year: carData.year,
        mileage: carData.mileage || 0,
        condition: carData.condition || 'good',
        location: 'Bulgaria'
      });

      // Adapt Cloud Function response to PriceEstimate[] format
      const raw = result.data as Record<string, unknown>;

      const estimates: PriceEstimate[] = [{
        source: 'Koli One AI Estimate',
        minPrice: (raw.minPrice as number) || 0,
        maxPrice: (raw.maxPrice as number) || 0,
        avgPrice: (raw.avgPrice as number) || 0,
        currency: 'EUR',
        reasoning: (raw.reasoning as string) || ''
      }];

      logger.info('Price estimation completed via Cloud Function', {
        estimates: estimates.length,
        avgPrice: estimates[0]?.avgPrice
      });

      return estimates;

    } catch (error: unknown) {
      logger.error('Price estimation via Cloud Function failed', error as Error);
      throw new Error('Failed to estimate price. You can set price manually.');
    }
  }

  /**
   * Suggest equipment/options via Cloud Functions (uses geminiChat with structured prompt)
   * @param carInfo - Brand, model, year
   * @returns Equipment suggestions by category
   */
  public async suggestOptions(carInfo: {
    brand: string;
    model: string;
    year: string;
  }): Promise<EquipmentSuggestions> {
    logger.info('Suggesting equipment options via Cloud Function', carInfo);

    try {
      const chatFn = httpsCallable(functions, 'geminiChat');
      const result = await chatFn({
        message: `Based on typical equipment for ${carInfo.brand} ${carInfo.model} (${carInfo.year}) in Bulgaria, suggest common equipment options in 3 categories. Return ONLY valid JSON with this exact structure, no other text:
{"safety":["item1","item2"],"comfort":["item1","item2"],"infotainment":["item1","item2"]}

Safety: ABS, Airbags, ESP, Parking Sensors, etc.
Comfort: Climate Control, Leather Seats, Electric Windows, etc.
Infotainment: Navigation, Bluetooth, Touchscreen, etc.

List 5-10 items per category. Use English names.`
      });

      const raw = result.data as Record<string, unknown>;
      const responseText = (raw.message as string) || '';

      // Parse JSON from the chat response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as EquipmentSuggestions;
        if (parsed.safety && parsed.comfort && parsed.infotainment) {
          logger.info('Equipment suggestions generated via Cloud Function', {
            safetyCount: parsed.safety.length,
            comfortCount: parsed.comfort.length,
            infotainmentCount: parsed.infotainment.length
          });
          return parsed;
        }
      }

      // Couldn't parse — return defaults
      throw new Error('Could not parse equipment suggestions');

    } catch (error: unknown) {
      logger.warn('Equipment suggestions via Cloud Function failed, using defaults', error as Error);
      return {
        safety: ['ABS', 'Airbags', 'ESP', 'Parking Sensors', 'Traction Control'],
        comfort: ['Air Conditioning', 'Power Windows', 'Central Locking', 'Power Steering'],
        infotainment: ['Radio', 'Bluetooth', 'USB', 'Aux Input']
      };
    }
  }

  /**
   * Convert File to base64 string (pure base64 without data URL prefix)
   * @param file - Image file
   * @returns Base64 encoded string (without "data:..." prefix)
   */
  public async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Extract base64 part from data URL (remove "data:image/...;base64," prefix)
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

// Export singleton instance
export const geminiAnalysisService = new GeminiAnalysisService();
export default geminiAnalysisService;
