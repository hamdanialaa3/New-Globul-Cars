/**
 * Gemini Analysis Service
 * AI-powered car analysis using Google Gemini 2.0 Flash
 * 
 * Features:
 * - Car image analysis (brand, model, year, condition)
 * - Price estimation
 * - Equipment/options suggestions
 * 
 * API: Free tier with rate limiting
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

class GeminiAnalysisService {
  private ai: GoogleGenerativeAI | null = null;
  private isInitialized = false;

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
   * Analyze car image and extract information
   * @param imageBase64 - Base64 encoded image
   * @returns Analysis result with brand, model, year, etc.
   */
  public async analyzeCarImage(imageBase64: string): Promise<GeminiCarAnalysisResult> {
    if (!this.isReady()) {
      throw new Error('Gemini service not initialized. Check API key configuration.');
    }

    try {
      logger.info('Starting car image analysis');

      const model = this.ai!.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
      });

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
        required: ['brand', 'model', 'yearRange', 'bodyType', 'color', 'trim', 'damage', 'reasoning']
      };

      const prompt = `Analyze this car for a Bulgarian marketplace (Koli.one).

Extract the following information with confidence scores (0-1):
- Brand (BMW, Mercedes, Audi, VW, Toyota, etc.)
- Model (specific model name)
- Year range (e.g., "2018-2020" or single year "2020")
- Body type (sedan, suv, hatchback, coupe, van, pickup, etc.)
- Color (primary color in English)
- Trim level (if visible, e.g., "M Sport", "AMG Line", or "Unknown")
- Damage assessment (none, minor, moderate, severe)

Focus on European car market. Be specific and accurate.
If unsure about any field, set confidence below 0.5 and use "Unknown" for trim.
Provide reasoning for your analysis.

Return ONLY valid JSON matching the schema.`;

      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: imageBase64.includes('base64,') 
                    ? imageBase64.split('base64,')[1] 
                    : imageBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema as any
        }
      });

      const response = await result.response;
      const text = response.text();
      const parsed: GeminiRawResponse = JSON.parse(text);

      logger.info('Car analysis completed', {
        brand: parsed.brand.value,
        model: parsed.model.value,
        confidence: parsed.brand.confidence
      });

      return parsed as GeminiCarAnalysisResult;

    } catch (error) {
      logger.error('Car image analysis failed', error as Error);
      throw new Error('Failed to analyze car image. Please try again or enter details manually.');
    }
  }

  /**
   * Estimate car price based on extracted data
   * @param carData - Car information for pricing
   * @returns Array of price estimates from different sources
   */
  public async estimatePrice(carData: CarDataForPricing): Promise<PriceEstimate[]> {
    if (!this.isReady()) {
      throw new Error('Gemini service not initialized');
    }

    try {
      logger.info('Estimating car price', { 
        brand: carData.brand, 
        model: carData.model, 
        year: carData.year 
      });

      const model = this.ai!.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
      });

      const prompt = `Estimate the price for this car in the Bulgarian market:

Car Details:
- Brand: ${carData.brand}
- Model: ${carData.model}
- Year: ${carData.year}
${carData.mileage ? `- Mileage: ${carData.mileage} km` : ''}
${carData.condition ? `- Condition: ${carData.condition}` : ''}

Provide 2-3 price estimates based on typical Bulgarian car marketplaces (mobile.bg, cars.bg, etc.).
Consider:
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

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/) || text.match(/```json\s*([\s\S]*?)\s*```/);
      if (!jsonMatch) {
        throw new Error('No valid price data in response');
      }

      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const estimates: PriceEstimate[] = JSON.parse(jsonStr);

      logger.info('Price estimation completed', { 
        estimates: estimates.length,
        avgPrice: estimates[0]?.avgPrice 
      });

      return estimates;

    } catch (error) {
      logger.error('Price estimation failed', error as Error);
      throw new Error('Failed to estimate price. You can set price manually.');
    }
  }

  /**
   * Suggest equipment/options based on car info
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

    try {
      logger.info('Suggesting equipment options', carInfo);

      const model = this.ai!.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
      });

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

      logger.info('Equipment suggestions generated', {
        safetyCount: suggestions.safety.length,
        comfortCount: suggestions.comfort.length,
        infotainmentCount: suggestions.infotainment.length
      });

      return suggestions;

    } catch (error) {
      logger.error('Equipment suggestion failed', error as Error);
      // Return default suggestions as fallback
      return {
        safety: ['ABS', 'Airbags', 'ESP'],
        comfort: ['Air Conditioning', 'Power Windows'],
        infotainment: ['Radio', 'Bluetooth']
      };
    }
  }

  /**
   * Convert File to base64 string
   * @param file - Image file
   * @returns Base64 encoded string
   */
  public async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

// Export singleton instance
export const geminiAnalysisService = new GeminiAnalysisService();
export default geminiAnalysisService;
