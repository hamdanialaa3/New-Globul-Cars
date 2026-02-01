/**
 * Gemini Analysis Service
 * AI-powered car analysis using Google Gemini with Smart Retry Fallback
 *
 * Features:
 * - Car image analysis (brand, model, year, condition)
 * - Price estimation
 * - Equipment/options suggestions
 * - Intelligent model retry: gemini-2.0-flash → gemini-1.5-flash → gemini-1.5-pro → gemini-2.0-pro
 * - Automatic retry on API failure with official Google models
 *
 * API: Free tier with rate limiting
 * Models: Uses Google Gemini v1beta API with OFFICIAL model names
 */

import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { logger } from '@/services/logger-service';
import {
  GeminiCarAnalysisResult,
  PriceEstimate,
  EquipmentSuggestions,
  CarDataForPricing,
  GeminiRawResponse,
  GeminiEquipmentResponse
} from '@/types/ai-analysis.types';

// Prioritized list of available models (best to fallback)
// Official Google Gemini v1beta API model names from Google's documentation
const GEMINI_MODELS = {
  FLASH_2_0: 'gemini-2.0-flash',         // Latest 2.0 generation (best for images)
  FLASH_1_5: 'gemini-1.5-flash',         // Stable 1.5 flash model
  PRO_1_5: 'gemini-1.5-pro',             // Stable 1.5 pro model for text
  PRO_2_0: 'gemini-2.0-pro',             // 2.0 pro model (if available)
} as const;

class GeminiAnalysisService {
  private ai: GoogleGenerativeAI | null = null;
  private isInitialized = false;
  private currentModel: string = GEMINI_MODELS.FLASH_2_0; // Start with latest 2.0 model

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // Check for API key in environment
    const apiKey =
      process.env.REACT_APP_GEMINI_API_KEY ||
      process.env.REACT_APP_GOOGLE_GENERATIVE_AI_KEY ||
      process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      logger.warn('Gemini API key not found. AI features will be disabled.');
      return;
    }

    try {
      this.ai = new GoogleGenerativeAI(apiKey);
      this.isInitialized = true;
      logger.info('Gemini Analysis Service initialized');
    } catch (error) {
      logger.error('Failed to initialize Gemini service', error as Error);
    }
  }

  /**
   * Check if service is ready
   */
  public isReady(): boolean {
    return this.isInitialized && this.ai !== null;
  }

  /**
   * Analyze car image and extract information WITH RETRY LOGIC
   * @param imageBase64 - Base64 encoded image
   * @returns Analysis result with brand, model, year, etc.
   */
  public async analyzeCarImage(imageBase64: string): Promise<GeminiCarAnalysisResult> {
    if (!this.isReady()) {
      throw new Error('Gemini service not initialized. Check API key configuration.');
    }

    logger.info('Starting car image analysis');

    // Define response schema for structured output
    const responseSchema = {
      type: SchemaType.OBJECT,
      properties: {
        brand: {
          type: SchemaType.OBJECT,
          properties: {
            value: { type: SchemaType.STRING },
            confidence: { type: SchemaType.NUMBER }
          },
          required: ['value', 'confidence']
        },
        model: {
          type: SchemaType.OBJECT,
          properties: {
            value: { type: SchemaType.STRING },
            confidence: { type: SchemaType.NUMBER }
          },
          required: ['value', 'confidence']
        },
        yearRange: {
          type: SchemaType.OBJECT,
          properties: {
            value: { type: SchemaType.STRING },
            confidence: { type: SchemaType.NUMBER }
          },
          required: ['value', 'confidence']
        },
        bodyType: {
          type: SchemaType.OBJECT,
          properties: {
            value: { type: SchemaType.STRING },
            confidence: { type: SchemaType.NUMBER }
          },
          required: ['value', 'confidence']
        },
        color: {
          type: SchemaType.OBJECT,
          properties: {
            value: { type: SchemaType.STRING },
            confidence: { type: SchemaType.NUMBER }
          },
          required: ['value', 'confidence']
        },
        trim: {
          type: SchemaType.OBJECT,
          properties: {
            value: { type: SchemaType.STRING },
            confidence: { type: SchemaType.NUMBER }
          },
          required: ['value', 'confidence']
        },
        damage: {
          type: SchemaType.OBJECT,
          properties: {
            value: { type: SchemaType.STRING },
            confidence: { type: SchemaType.NUMBER }
          },
          required: ['value', 'confidence']
        },
        reasoning: { type: SchemaType.STRING }
      },
      required: ['brand', 'model', 'yearRange']
    };

    const prompt = `Analyze the following car image and extract key information.
Return structured JSON with fields: brand, model, yearRange, bodyType, color, trim,
damage, reasoning. YearRange should be like "2018-2020".
Focus on real-world recognition based on the image content.`;

    // Try models in order: latest 2.0 first for best compatibility
    const modelsToTry = [
      GEMINI_MODELS.FLASH_2_0,       // Primary: Latest generation
      GEMINI_MODELS.FLASH_1_5,       // Backup: Stable 1.5 flash
      GEMINI_MODELS.PRO_1_5,         // Backup: Stable 1.5 pro
      GEMINI_MODELS.PRO_2_0          // Final fallback: 2.0 pro
    ];

    let lastError: Error | null = null;

    for (const modelName of modelsToTry) {
      try {
        logger.info('Trying Gemini model for analysis', { model: modelName });
        
        const model = this.ai!.getGenerativeModel({ model: modelName });

        const result = await model.generateContent({
          contents: [{
            role: 'user',
            parts: [
              { text: prompt },
              { inlineData: { data: imageBase64, mimeType: 'image/*' } as any }
            ]
          }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema as any
          }
        });

        const response = await result.response;
        const text = response.text();
        const parsed: GeminiRawResponse = JSON.parse(text);

        // Success! Update current model and return
        this.currentModel = modelName;
        logger.info('Car analysis completed', {
          model: modelName,
          brand: parsed.brand.value,
          modelValue: parsed.model.value,
          confidence: parsed.brand.confidence
        });

        return parsed as GeminiCarAnalysisResult;

      } catch (error) {
        lastError = error as Error;
        logger.warn(`Model ${modelName} failed, trying next`, error as Error);
        continue;
      }
    }

    // All models failed
    logger.error('All Gemini models failed for car analysis', lastError!);
    throw new Error('Failed to analyze car image. Please try again or enter details manually.');
  }

  /**
   * Estimate car price based on extracted data WITH RETRY LOGIC
   * @param carData - Car information for pricing
   * @returns Array of price estimates from different sources
   */
  public async estimatePrice(carData: CarDataForPricing): Promise<PriceEstimate[]> {
    if (!this.isReady()) {
      throw new Error('Gemini service not initialized');
    }

    logger.info('Estimating car price', {
      brand: carData.brand,
      model: carData.model,
      year: carData.year
    });

    const prompt = `Estimate the price for this car in the Bulgarian market:

Car Details:
- Brand: ${carData.brand}
- Model: ${carData.model}
- Year: ${carData.year}
${carData.mileage ? `- Mileage: ${carData.mileage} km` : ''}
${carData.condition ? `- Condition: ${carData.condition}` : ''}

Provide 2-3 price estimates based on typical Bulgarian car marketplaces (mobile.bg,
cars.bg, etc.). Consider:
- Current market trends in Bulgaria
- Typical depreciation for this vehicle
- Popular pricing for similar vehicles

Return JSON array with format:
[
  {
    "source": "mobile.bg typical",
    "minPrice": 15000,
    "maxPrice": 18000,
    "avgPrice": 16500,
    "currency": "EUR",
    "reasoning": "Based on similar listings..."
  }
]

Prices must be in EUR. Be realistic for Bulgarian market.`;

    // Try models in order: latest generation first
    const modelsToTry = [
      GEMINI_MODELS.FLASH_2_0,       // Primary: Latest generation
      GEMINI_MODELS.FLASH_1_5,       // Backup: Stable 1.5 flash
      GEMINI_MODELS.PRO_1_5,         // Backup: Stable 1.5 pro
      GEMINI_MODELS.PRO_2_0          // Final fallback: 2.0 pro
    ];

    let lastError: Error | null = null;

    for (const modelName of modelsToTry) {
      try {
        logger.info('Trying Gemini model for price estimation', { model: modelName });
        
        const model = this.ai!.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\[[\s\S]*\]/) || text.match(/```json\s*([\s\S]*)\s*```/);
        if (!jsonMatch) {
          throw new Error('No valid price data in response');
        }

        const jsonStr = (jsonMatch[1] || jsonMatch[0]).toString();
        const estimates: PriceEstimate[] = JSON.parse(jsonStr);

        // Success!
        this.currentModel = modelName;
        logger.info('Price estimation completed', {
          model: modelName,
          estimates: estimates.length,
          avgPrice: estimates[0]?.avgPrice
        });

        return estimates;

      } catch (error) {
        lastError = error as Error;
        logger.warn(`Model ${modelName} failed for price estimation, trying next`, error as Error);
        continue;
      }
    }

    // All models failed
    logger.error('All Gemini models failed for price estimation', lastError!);
    throw new Error('Failed to estimate price. You can set price manually.');
  }

  /**
   * Suggest equipment/options based on car info WITH RETRY LOGIC
   * @param carInfo - Brand, model, year
   * @returns Equipment suggestions by category
   */
  public async suggestOptions(carInfo: {
    brand: string;
    model: string;
    year: string;
  }): Promise<EquipmentSuggestions> {
    if (!this.isReady()) {
      throw new Error('Gemini service not initialized');
    }

    logger.info('Suggesting equipment options', carInfo);

    const responseSchema = {
      type: SchemaType.OBJECT,
      properties: {
        safety: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING }
        },
        comfort: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING }
        },
        infotainment: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING }
        }
      },
      required: ['safety', 'comfort', 'infotainment']
    };

    const prompt = `Based on typical equipment for ${carInfo.brand} ${carInfo.model} (${carInfo.year}) in Bulgaria:
Suggest common equipment options in 3 categories:

1. Safety: ABS, Airbags, ESP, Parking Sensors, etc.
2. Comfort: Climate Control, Leather Seats, Electric Windows, etc.
3. Infotainment: Navigation, Bluetooth, Touchscreen, etc.

Use Bulgarian market standards. List 5-10 items per category.
Use English names for equipment.

Return ONLY valid JSON matching the schema.`;

    // Try models in order: latest generation first
    const modelsToTry = [
      GEMINI_MODELS.FLASH_2_0,       // Primary: Latest generation
      GEMINI_MODELS.FLASH_1_5,       // Backup: Stable 1.5 flash
      GEMINI_MODELS.PRO_1_5,         // Backup: Stable 1.5 pro
      GEMINI_MODELS.PRO_2_0          // Final fallback: 2.0 pro
    ];

    for (const modelName of modelsToTry) {
      try {
        logger.info('Trying Gemini model for equipment suggestions', { model: modelName });
        
        const model = this.ai!.getGenerativeModel({ model: modelName });

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema as any
          }
        });

        const response = await result.response;
        const text = response.text();
        const suggestions: GeminiEquipmentResponse = JSON.parse(text);

        // Success!
        this.currentModel = modelName;
        logger.info('Equipment suggestions generated', {
          model: modelName,
          safetyCount: suggestions.safety.length,
          comfortCount: suggestions.comfort.length,
          infotainmentCount: suggestions.infotainment.length
        });

        return suggestions;

      } catch (error) {
        logger.warn(`Model ${modelName} failed for equipment suggestions, trying next`, error as Error);
        continue;
      }
    }

    // All models failed - return default suggestions as fallback
    logger.error('All Gemini models failed for equipment suggestions, using defaults');
    return {
      safety: ['ABS', 'Airbags', 'ESP'],
      comfort: ['Air Conditioning', 'Power Windows'],
      infotainment: ['Radio', 'Bluetooth']
    };
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
