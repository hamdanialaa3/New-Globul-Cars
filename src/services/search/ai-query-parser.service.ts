/**
 * AI Query Parser Service - تحليل استعلامات البحث بالذكاء الاصطناعي
 * Uses OpenAI GPT-4 to understand natural language car search queries
 * 
 * Examples:
 * - "سيارة عائلية رخيصة في صوفيا" → { bodyType: "Estate", priceMax: 5000, city: "Sofia" }
 * - "бмв дизел автоматик" → { make: "BMW", fuelType: "Diesel", transmission: "Automatic" }
 * - "new electric SUV under 30k" → { yearMin: 2024, fuelType: "Electric", bodyType: "SUV", priceMax: 30000 }
 * 
 * @since December 2025
 */

import { openAIService } from '../ai/openai.service';
import { logger } from '../logger-service';

export interface ParsedAIQuery {
  make?: string[];
  model?: string[];
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  city?: string;
  features?: string[];
  condition?: string;
}

class AIQueryParserService {
  private static instance: AIQueryParserService;

  private constructor() {
    // Lazy initialization - check availability when needed
    logger.info('AI Query Parser service created');
  }

  static getInstance(): AIQueryParserService {
    if (!this.instance) {
      this.instance = new AIQueryParserService();
    }
    return this.instance;
  }

  /**
   * Check if AI parsing is available
   */
  isServiceAvailable(): boolean {
    try {
      return openAIService.isAvailable();
    } catch (error) {
      logger.warn('OpenAI service check failed', { error });
      return false;
    }
  }

  /**
   * Parse natural language query using OpenAI GPT-4
   * تحليل طلب البحث باللغة الطبيعية
   */
  async parseQuery(userQuery: string): Promise<ParsedAIQuery> {
    if (!this.isServiceAvailable()) {
      logger.warn('AI Query Parser not available, returning empty filters');
      return {};
    }

    try {
      const currentYear = new Date().getFullYear();
      
      const systemPrompt = `
You are a Bulgarian car marketplace search assistant.
Convert the user's natural language query into structured search filters.

Context Rules (Bulgarian Market):
- "евтина" or "cheap" (cheap) → priceMax: 5000 (EUR)
- "средна цена" (medium price) → priceMin: 5000, priceMax: 15000
- "скъпа" (expensive) → priceMin: 15000
- "семейна" or "family car" → bodyType: "Estate" OR "SUV" OR "Minivan"
- "германска" or "German" → make: ["BMW", "Mercedes", "Audi", "VW", "Opel", "Porsche"]
- "японска" or "Japanese" → make: ["Toyota", "Honda", "Mazda", "Nissan", "Subaru"]
- "София" or "Sofia" → city: "Sofia"
- "Пловдив" or "Plovdiv" → city: "Plovdiv"
- "Варна" or "Varna" → city: "Varna"
- "нова" or "new" → yearMin: ${currentYear - 1}
- "стара" or "old" → yearMax: 2010
- "под X хиляди" or "under Xk" → priceMax: X * 1000

Bulgarian to English mappings (already covered by synonyms service):
- "дизел" → Diesel
- "бензин" → Petrol
- "автоматик" → Automatic
- "ръчна" → Manual
- "джип" → SUV

Output ONLY valid JSON matching this exact schema (no explanations):
{
  "make": ["BMW", "Mercedes"] | undefined,
  "model": ["X5", "A4"] | undefined,
  "yearMin": 2020 | undefined,
  "yearMax": 2023 | undefined,
  "priceMin": 10000 | undefined,
  "priceMax": 25000 | undefined,
  "fuelType": "Diesel" | "Petrol" | "Electric" | "Hybrid" | undefined,
  "transmission": "Automatic" | "Manual" | undefined,
  "bodyType": "SUV" | "Sedan" | "Hatchback" | "Estate" | undefined,
  "city": "Sofia" | "Plovdiv" | "Varna" | "Burgas" | undefined,
  "features": ["Navigation", "Leather", "Sunroof"] | undefined,
  "condition": "New" | "Used" | "Excellent" | undefined
}

Important: 
- All prices in EUR
- City names in English (Sofia, not София)
- Use canonical English terms (BMW not бмв, Diesel not дизел)
- If unclear, omit the field (don't guess)
`;

      logger.debug('🤖 Parsing query with AI', { userQuery });

      const response = await openAIService.chat(userQuery, systemPrompt);
      const parsed = JSON.parse(response.message);
      logger.info('✅ AI Query Parsed', { userQuery, parsed });
      
      return parsed;

    } catch (error) {
      logger.error('❌ AI Query parsing failed', error as Error, { userQuery });
      return {}; // Fallback to empty filters
    }
  }

  /**
   * Parse query with fallback to keyword-based parsing
   */
  async parseQueryWithFallback(userQuery: string): Promise<ParsedAIQuery> {
    try {
      return await this.parseQuery(userQuery);
    } catch (error) {
      // Fallback to simple keyword extraction
      logger.warn('AI parsing failed, using fallback keyword extraction');
      return this.fallbackKeywordParsing(userQuery);
    }
  }

  /**
   * Simple keyword-based parsing (fallback when AI not available)
   */
  private fallbackKeywordParsing(query: string): ParsedAIQuery {
    const lower = query.toLowerCase();
    const result: ParsedAIQuery = {};

    // Simple price detection
    const priceMatch = lower.match(/under\s+(\d+)k?|под\s+(\d+)/);
    if (priceMatch) {
      const amount = parseInt(priceMatch[1] || priceMatch[2]);
      result.priceMax = amount * (priceMatch[0].includes('k') ? 1000 : 1);
    }

    // Simple year detection
    const yearMatch = lower.match(/20\d{2}/);
    if (yearMatch) {
      result.yearMin = parseInt(yearMatch[0]);
    }

    return result;
  }
}

export const aiQueryParserService = AIQueryParserService.getInstance();
export default aiQueryParserService;
