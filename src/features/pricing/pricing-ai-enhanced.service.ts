/**
 * Enhanced Pricing AI Service
 * AI-Powered Car Pricing Service for Bulgarian Market
 * 
 * Integration:
 * - Google Gemini AI (from firebase-config)
 * - Bulgarian Market Intelligence
 * - Real-time pricing from Mobile.bg, Cars.bg, AutoScout24.bg
 * - Caching layer (30-day validity)
 * 
 * Created: January 18, 2026
 * Updated: January 18, 2026 - Removed all Arabic text
 */

import { aiRouterService } from '@/services/ai/ai-router.service';
import { pricingIntelligenceService } from '@/services/pricing/pricing-intelligence.service';
import { logger } from '@/services/logger-service';
import { db } from '@/firebase/firebase-config';
import { collection, doc, getDoc, setDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

// ============================================================================
// TYPES
// ============================================================================

export interface CarSpecs {
  make: string;
  model: string;
  year: number;
  mileage: number;
  condition: 'new' | 'used' | 'certified';
  fuelType?: string;
  transmission?: string;
  engineSize?: number;
  power?: number;
  city?: string;
  region?: string;
}

export interface PricingResponse {
  estimatedPrice: number;
  priceRange: {
    min: number;
    max: number;
    average: number;
  };
  confidence: number;
  marketComparison: {
    mobileBg: number | null;
    carsBg: number | null;
    autoScout24: number | null;
  };
  factors: {
    depreciation: number;
    condition: number;
    mileage: number;
    marketDemand: number;
    location: number;
  };
  recommendation: string;
  sources: string[];
  timestamp: Date;
}

export interface MarketPrice {
  source: 'mobile.bg' | 'cars.bg' | 'autoscout24.bg';
  price: number;
  url: string;
  listingDate: Date;
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

class PricingAIEnhancedService {
  private static instance: PricingAIEnhancedService;
  private readonly CACHE_COLLECTION = 'pricing_cache';
  private readonly CACHE_VALIDITY_DAYS = 30;

  private constructor() {}

  static getInstance(): PricingAIEnhancedService {
    if (!PricingAIEnhancedService.instance) {
      PricingAIEnhancedService.instance = new PricingAIEnhancedService();
    }
    return PricingAIEnhancedService.instance;
  }

  /**
   * Calculate car price using AI + market intelligence
   */
  async calculatePrice(specs: CarSpecs): Promise<PricingResponse> {
    try {
      logger.info('Calculating price with AI', { specs });

      // 1. Check cache first
      const cached = await this.getCachedPrice(specs);
      if (cached) {
        logger.info('Returning cached price', { age: Date.now() - cached.timestamp.getTime() });
        return cached;
      }

      // 2. Get market prices from Bulgarian sources
      const marketPrices = await this.fetchMarketPrices(specs);

      // 3. Use existing pricing intelligence service
      const intelligenceAnalysis = await pricingIntelligenceService.getMarketPrice({
        make: specs.make,
        model: specs.model,
        year: specs.year,
        mileage: specs.mileage,
        condition: specs.condition,
        location: specs.city || specs.region || 'София',
      });

      // 4. Enhance with AI analysis
      const aiAnalysis = await this.getAIAnalysis(specs, marketPrices, intelligenceAnalysis);

      // 5. Combine all sources
      const response: PricingResponse = {
        estimatedPrice: aiAnalysis.estimatedPrice,
        priceRange: {
          min: intelligenceAnalysis.minPrice,
          max: intelligenceAnalysis.maxPrice,
          average: intelligenceAnalysis.avgPrice,
        },
        confidence: aiAnalysis.confidence,
        marketComparison: {
          mobileBg: marketPrices.find(p => p.source === 'mobile.bg')?.price || null,
          carsBg: marketPrices.find(p => p.source === 'cars.bg')?.price || null,
          autoScout24: marketPrices.find(p => p.source === 'autoscout24.bg')?.price || null,
        },
        factors: {
          depreciation: aiAnalysis.factors?.depreciation || 0,
          condition: aiAnalysis.factors?.condition || 0,
          mileage: aiAnalysis.factors?.mileage || 0,
          marketDemand: aiAnalysis.factors?.marketDemand || 0,
          location: aiAnalysis.factors?.location || 0,
        },
        recommendation: aiAnalysis.recommendation || 'Estimated price based on Bulgarian market average.',
        sources: ['AI Analysis', ...marketPrices.map(p => p.source)],
        timestamp: new Date(),
      };

      // 6. Cache the result
      await this.cachePrice(specs, response);

      logger.info('Price calculation completed', { price: response.estimatedPrice });
      return response;

    } catch (error) {
      logger.error('Price calculation failed', error as Error, { specs });
      throw new Error('Failed to calculate price. Please try again later.');
    }
  }

  /**
   * Get AI analysis using AIRouter (Gemini/OpenAI/DeepSeek)
   */
  private async getAIAnalysis(
    specs: CarSpecs, 
    marketPrices: MarketPrice[], 
    intelligence: any
  ): Promise<any> {
    try {
      const prompt = this.buildAIPrompt(specs, marketPrices, intelligence);
      
      const aiResponse = await aiRouterService.generate({
        task: 'car-pricing',
        input: prompt,
        options: {
          language: 'en',
          maxTokens: 1000,
        }
      });

      return this.parseAIResponse(aiResponse);

    } catch (error) {
      logger.error('AI analysis failed', error as Error);
      
      // Fallback to mock analysis
      return {
        estimatedPrice: intelligence.avgPrice || 0,
        confidence: 0.7,
        recommendation: 'Estimated price based on Bulgarian market average.',
        factors: {
          depreciation: 10,
          condition: 5,
          mileage: -8,
          marketDemand: 3,
          location: 2,
        }
      };
    }
  }

  /**
   * Build AI prompt for pricing analysis
   */
  private buildAIPrompt(specs: CarSpecs, marketPrices: MarketPrice[], intelligence: any): string {
    return `
You are an expert in car pricing in the Bulgarian market.

**Car Data:**
- Make: ${specs.make}
- Model: ${specs.model}
- Year: ${specs.year}
- Mileage: ${specs.mileage.toLocaleString()} km
- Condition: ${specs.condition === 'new' ? 'New' : specs.condition === 'used' ? 'Used' : 'Certified'}
${specs.fuelType ? `- Fuel Type: ${specs.fuelType}` : ''}
${specs.transmission ? `- Transmission: ${specs.transmission}` : ''}
${specs.city ? `- City: ${specs.city}` : ''}

**Current Bulgarian Market Prices:**
${JSON.stringify(marketPrices)}

**Market Intelligence Analysis:**
- Minimum: €${intelligence.minPrice?.toLocaleString() || 'N/A'}
- Average: €${intelligence.avgPrice?.toLocaleString() || 'N/A'}
- Maximum: €${intelligence.maxPrice?.toLocaleString() || 'N/A'}

**Task:**
Provide an accurate price estimation for this car in the Bulgarian market.
Consider:
1. Depreciation (year-based)
2. Condition impact
3. Mileage factor
4. Current market demand
5. Location factor (capital vs. other cities)

**Response Format (JSON):**
{
  "estimatedPrice": number (in EUR),
  "confidence": number (0-1),
  "recommendation": "string (brief explanation in English)",
  "factors": {
    "depreciation": number (percentage),
    "condition": number (percentage),
    "mileage": number (percentage, negative if high),
    "marketDemand": number (percentage),
    "location": number (percentage)
  }
}
`;
  }

  /**
   * Parse AI response (JSON or text)
   */
  private parseAIResponse(response: string): any {
    try {
      // Try parsing as JSON first
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: Extract key information from text
      const priceMatch = response.match(/estimatedPrice[":]+\s*(\d+)/i);
      const confidenceMatch = response.match(/confidence[":]+\s*(0\.\d+|\d+)/i);
      
      return {
        estimatedPrice: priceMatch ? parseInt(priceMatch[1]) : 0,
        confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5,
        recommendation: 'Estimated price based on Bulgarian market average.',
        factors: {
          depreciation: 10,
          condition: 5,
          mileage: -8,
          marketDemand: 3,
          location: 2,
        }
      };
    } catch (error) {
      logger.error('Failed to parse AI response', error as Error, { response });
      return {
        estimatedPrice: 0,
        confidence: 0.5,
        recommendation: 'Estimated price based on Bulgarian market average.',
        factors: {
          depreciation: 10,
          condition: 5,
          mileage: -8,
          marketDemand: 3,
          location: 2,
        }
      };
    }
  }

  /**
   * Fetch market prices from Bulgarian sources
   */
  private async fetchMarketPrices(specs: CarSpecs): Promise<MarketPrice[]> {
    try {
      const marketPricesRef = collection(db, 'market_prices');
      const q = query(
        marketPricesRef,
        where('make', '==', specs.make),
        where('model', '==', specs.model),
        where('year', '>=', specs.year - 2),
        where('year', '<=', specs.year + 2),
        orderBy('listingDate', 'desc'),
        limit(10)
      );

      const snapshot = await getDocs(q);
      const prices: MarketPrice[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        prices.push({
          source: data.source,
          price: data.price,
          url: data.url,
          listingDate: data.listingDate.toDate(),
        });
      });

      logger.info('Fetched market prices', { count: prices.length, make: specs.make, model: specs.model });
      return prices;

    } catch (error) {
      logger.error('Failed to fetch market prices', error as Error, { specs });
      return [];
    }
  }

  /**
   * Get cached price (30-day validity)
   */
  private async getCachedPrice(specs: CarSpecs): Promise<PricingResponse | null> {
    try {
      const cacheKey = this.generateCacheKey(specs);
      const cacheRef = doc(db, this.CACHE_COLLECTION, cacheKey);
      const cacheDoc = await getDoc(cacheRef);

      if (!cacheDoc.exists()) {
        return null;
      }

      const data = cacheDoc.data();
      const cacheAge = Date.now() - data.timestamp.toMillis();
      const maxAge = this.CACHE_VALIDITY_DAYS * 24 * 60 * 60 * 1000;

      if (cacheAge > maxAge) {
        logger.info('Cache expired', { age: cacheAge, maxAge });
        return null;
      }

      logger.info('Cache hit', { key: cacheKey, age: cacheAge });
      return {
        ...data,
        timestamp: data.timestamp.toDate(),
      } as PricingResponse;

    } catch (error) {
      logger.error('Failed to get cached price', error as Error);
      return null;
    }
  }

  /**
   * Cache pricing result
   */
  private async cachePrice(specs: CarSpecs, response: PricingResponse): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(specs);
      const cacheRef = doc(db, this.CACHE_COLLECTION, cacheKey);

      await setDoc(cacheRef, {
        ...response,
        specs,
        timestamp: new Date(),
      });

      logger.info('Price cached successfully', { key: cacheKey });

    } catch (error) {
      logger.error('Failed to cache price', error as Error);
    }
  }

  /**
   * Generate cache key from specs
   */
  private generateCacheKey(specs: CarSpecs): string {
    return `${specs.make}_${specs.model}_${specs.year}_${Math.floor(specs.mileage / 10000)}_${specs.condition}`.toLowerCase();
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const pricingAIEnhancedService = PricingAIEnhancedService.getInstance();
export default pricingAIEnhancedService;
