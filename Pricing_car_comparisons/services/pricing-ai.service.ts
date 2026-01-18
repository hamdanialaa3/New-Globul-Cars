/**
 * خدمة AI لتسعير السيارات باستخدام Google Gemini
 * AI Pricing Service using Google Gemini API
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { CarSpecs, AIAnalysis, PriceRange, SimilarCar } from '../types/pricing.types';

// استيراد المفتاح من Firebase Config أو Environment Variable
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';

export class PricingAIService {
  private genai: GoogleGenerativeAI | null;
  private model: any;

  constructor() {
    if (!GEMINI_API_KEY) {
      console.warn('Gemini API Key not found. Please set REACT_APP_GEMINI_API_KEY in .env');
      this.genai = null;
      this.model = null;
    } else {
      this.genai = new GoogleGenerativeAI(GEMINI_API_KEY);
      this.model = this.genai.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }
  }

  /**
   * تحليل السعر باستخدام AI
   */
  async analyzePrice(specs: CarSpecs, marketData?: any[]): Promise<AIAnalysis> {
    if (!this.model) {
      throw new Error('Gemini API not configured. Please set REACT_APP_GEMINI_API_KEY');
    }

    try {
      const prompt = this.buildPrompt(specs, marketData);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseAIResponse(text, specs);
    } catch (error) {
      console.error('Error in AI pricing analysis:', error);
      throw new Error('Failed to analyze price with AI');
    }
  }

  /**
   * بناء Prompt محسّن لـ Gemini
   */
  private buildPrompt(specs: CarSpecs, marketData?: any[]): string {
    const marketContext = marketData && marketData.length > 0
      ? `\n\nMarket Data from Bulgarian websites:\n${JSON.stringify(marketData.slice(0, 10), null, 2)}`
      : '';

    return `You are an expert car pricing analyst specializing in the Bulgarian car market.

Analyze the following car and provide a detailed pricing estimate:

Car Specifications:
- Brand: ${specs.brand}
- Model: ${specs.model}
- Category: ${specs.category}
- Year: ${specs.year}
- Mileage: ${specs.mileage.toLocaleString()} km
- Fuel Type: ${specs.fuelType || 'not specified'}
- Transmission: ${specs.transmission || 'not specified'}
- Condition: ${specs.condition || 'not specified'}
${marketContext}

Please provide your analysis in the following JSON format:
{
  "estimatedPrice": {
    "low": <minimum price in EUR>,
    "average": <average price in EUR>,
    "high": <maximum price in EUR>
  },
  "confidence": <confidence level 0-100>,
  "reasoning": "<detailed explanation in Bulgarian or English>",
  "marketTrend": "<increasing|stable|decreasing>",
  "factors": ["<factor1>", "<factor2>", ...],
  "similarCars": [
    {
      "brand": "<brand>",
      "model": "<model>",
      "year": <year>,
      "mileage": <mileage>,
      "price": <price in EUR>,
      "source": "<source>",
      "similarity": <0-100>
    }
  ]
}

Important:
1. Prices must be in EUR (Euro)
2. Consider Bulgarian market conditions
3. Account for mileage depreciation
4. Consider age and condition
5. Base analysis on real Bulgarian market data if available
6. Confidence should reflect data quality and market availability

Respond ONLY with valid JSON, no additional text.`;
  }

  /**
   * تحليل استجابة AI
   */
  private parseAIResponse(text: string, specs: CarSpecs): AIAnalysis {
    try {
      // استخراج JSON من النص
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        estimatedPrice: {
          low: parsed.estimatedPrice?.low || 0,
          average: parsed.estimatedPrice?.average || 0,
          high: parsed.estimatedPrice?.high || 0,
          currency: 'EUR',
        },
        confidence: parsed.confidence || 50,
        reasoning: parsed.reasoning || 'Analysis completed',
        marketTrend: parsed.marketTrend || 'stable',
        factors: parsed.factors || [],
        similarCars: parsed.similarCars || [],
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      
      // Fallback response
      return {
        estimatedPrice: {
          low: 0,
          average: 0,
          high: 0,
          currency: 'EUR',
        },
        confidence: 0,
        reasoning: 'Failed to parse AI response',
        marketTrend: 'stable',
        factors: [],
        similarCars: [],
      };
    }
  }

  /**
   * تحسين السعر بناءً على بيانات السوق
   */
  async refinePriceWithMarketData(
    initialAnalysis: AIAnalysis,
    marketData: any[]
  ): Promise<AIAnalysis> {
    if (!marketData || marketData.length === 0) {
      return initialAnalysis;
    }

    const prices = marketData
      .map(item => item.price)
      .filter(price => price > 0)
      .sort((a, b) => a - b);

    if (prices.length === 0) {
      return initialAnalysis;
    }

    const low = Math.min(...prices);
    const high = Math.max(...prices);
    const average = prices.reduce((sum, p) => sum + p, 0) / prices.length;

    return {
      ...initialAnalysis,
      estimatedPrice: {
        low: Math.min(initialAnalysis.estimatedPrice.low, low),
        average: (initialAnalysis.estimatedPrice.average + average) / 2,
        high: Math.max(initialAnalysis.estimatedPrice.high, high),
        currency: 'EUR',
      },
      confidence: Math.min(100, initialAnalysis.confidence + 20),
    };
  }
}

export const pricingAIService = new PricingAIService();
