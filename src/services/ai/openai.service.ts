/**
 * OpenAI GPT-4 Integration Service
 * OpenAI GPT-4 خدمة التكامل
 */

import OpenAI from 'openai';
import { logger } from '@/services/logger-service';

interface GPT4Response {
  message: string;
  model: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost: number;
}

interface PriceEstimate {
  minPrice: number;
  avgPrice: number;
  maxPrice: number;
  currency: string;
  confidence: number;
  reasoning: string;
}

interface CarAnalysis {
  marketValue: PriceEstimate;
  rarity: 'common' | 'uncommon' | 'rare' | 'very_rare';
  demand: 'high' | 'medium' | 'low';
  recommendations: string[];
  bestSaleTime: string;
}

class OpenAIGPT4Service {
  private static instance: OpenAIGPT4Service;
  private openai: OpenAI | null = null;
  private model = 'gpt-4-turbo-preview';
  private costPer1kTokens = {
    input: 0.03,
    output: 0.06
  };
  private isConfigured: boolean = false;

  private constructor() {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      logger.warn('⚠️ OpenAI API Key not configured - AI features will be disabled');
      this.isConfigured = false;
    } else {
      try {
        this.openai = new OpenAI({ 
          apiKey,
          dangerouslyAllowBrowser: true 
        });
        this.isConfigured = true;
        logger.info('✅ OpenAI service initialized');
      } catch (error) {
        logger.error('Failed to initialize OpenAI', error as Error);
        this.isConfigured = false;
      }
    }
  }

  static getInstance(): OpenAIGPT4Service {
    if (!this.instance) {
      this.instance = new OpenAIGPT4Service();
    }
    return this.instance;
  }

  /**
   * Check if OpenAI is available
   */
  isAvailable(): boolean {
    return this.isConfigured && this.openai !== null;
  }

  /**
   * Chat with GPT-4
   */
  async chat(message: string, systemPrompt?: string): Promise<GPT4Response> {
    if (!this.isAvailable()) {
      throw new Error('OpenAI service not available - API key not configured');
    }

    try {
      logger.info('GPT-4 Chat started', { messageLength: message.length });

      const messages: OpenAI.Messages.MessageParam[] = [
        {
          role: 'user',
          content: message
        }
      ];

      if (systemPrompt) {
        messages.unshift({
          role: 'user',
          content: systemPrompt
        });
      }

      const response = await this.openai.messages.create({
        model: this.model,
        max_tokens: 1024,
        messages: messages.map(m => ({
          ...m,
          role: m.role as 'user' | 'assistant'
        }))
      });

      const textContent = response.content.find(c => c.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in response');
      }

      const cost = this.calculateCost(
        response.usage?.input_tokens || 0,
        response.usage?.output_tokens || 0
      );

      logger.info('GPT-4 Chat completed', {
        tokens: response.usage?.total_tokens,
        cost
      });

      return {
        message: textContent.text,
        model: this.model,
        tokens: {
          prompt: response.usage?.input_tokens || 0,
          completion: response.usage?.output_tokens || 0,
          total: response.usage?.total_tokens || 0
        },
        cost
      };
    } catch (error) {
      logger.error('GPT-4 chat failed', error as Error, { message });
      throw error;
    }
  }

  /**
   * Analyze car for sale
   */
  async analyzeCarForSale(carData: any): Promise<CarAnalysis> {
    try {
      logger.info('Analyzing car with GPT-4', { make: carData.make, model: carData.model });

      const prompt = `
        You are an expert Bulgarian car market analyst. Analyze this car for sale:
        
        Make: ${carData.make}
        Model: ${carData.model}
        Year: ${carData.year}
        Mileage: ${carData.mileage} km
        Condition: ${carData.condition}
        Location: ${carData.location}
        Current Price: ${carData.currentPrice} ${carData.currency}
        
        Provide analysis in JSON format with:
        1. Market value estimate (min, avg, max prices in EUR)
        2. Rarity assessment (common, uncommon, rare, very_rare)
        3. Demand level (high, medium, low)
        4. Selling recommendations
        5. Best time to sell (immediate, 1-3 months, 3-6 months, 6+ months)
        
        Return ONLY valid JSON, no other text.
      `;

      const response = await this.chat(prompt);
      const analysisText = response.message;

      // Parse JSON response
      try {
        const analysis = JSON.parse(analysisText);
        return {
          marketValue: {
            minPrice: analysis.minPrice || carData.currentPrice * 0.9,
            avgPrice: analysis.avgPrice || carData.currentPrice,
            maxPrice: analysis.maxPrice || carData.currentPrice * 1.1,
            currency: 'EUR',
            confidence: analysis.confidence || 75,
            reasoning: analysis.reasoning || 'Based on market analysis'
          },
          rarity: analysis.rarity || 'common',
          demand: analysis.demand || 'medium',
          recommendations: analysis.recommendations || [],
          bestSaleTime: analysis.bestSaleTime || 'immediate'
        };
      } catch {
        // If JSON parsing fails, return safe defaults
        return {
          marketValue: {
            minPrice: carData.currentPrice * 0.9,
            avgPrice: carData.currentPrice,
            maxPrice: carData.currentPrice * 1.1,
            currency: 'EUR',
            confidence: 50,
            reasoning: response.message
          },
          rarity: 'common',
          demand: 'medium',
          recommendations: ['Market analysis completed', 'Consider current market conditions'],
          bestSaleTime: 'immediate'
        };
      }
    } catch (error) {
      logger.error('Car analysis failed', error as Error, { carData });
      throw error;
    }
  }

  /**
   * Suggest negotiation strategy
   */
  async suggestNegotiationStrategy(carData: any, buyerMessage: string): Promise<string> {
    try {
      const prompt = `
        You are a car sales expert in Bulgaria. A buyer is interested in:
        
        Car: ${carData.make} ${carData.model} ${carData.year}
        Current Price: ${carData.currentPrice} EUR
        
        Buyer's message: "${buyerMessage}"
        
        Suggest a negotiation strategy for the seller. Be professional and market-aware.
      `;

      const response = await this.chat(prompt);
      return response.message;
    } catch (error) {
      logger.error('Negotiation strategy failed', error as Error);
      throw error;
    }
  }

  /**
   * Generate listing description
   */
  async generateListingDescription(carData: any): Promise<string> {
    try {
      const prompt = `
        Create a compelling car listing description in Bulgarian for:
        
        ${carData.make} ${carData.model} ${carData.year}
        Mileage: ${carData.mileage} km
        Condition: ${carData.condition}
        Features: ${carData.equipment?.join(', ') || 'Standard'}
        Price: ${carData.price} EUR
        
        Make it attractive to buyers while being honest about the car's condition.
      `;

      const response = await this.chat(prompt);
      return response.message;
    } catch (error) {
      logger.error('Description generation failed', error as Error);
      throw error;
    }
  }

  /**
   * Detect potential issues in listing
   */
  async detectListingIssues(
    carData: any,
    listingText: string
  ): Promise<{
    issues: string[];
    warnings: string[];
    suggestions: string[];
  }> {
    try {
      const prompt = `
        Review this car listing for potential issues or red flags:
        
        Car: ${carData.make} ${carData.model} ${carData.year}
        Listing Text: "${listingText}"
        
        Return JSON with arrays:
        {
          "issues": ["critical problems"],
          "warnings": ["potential concerns"],
          "suggestions": ["improvements"]
        }
      `;

      const response = await this.chat(prompt);
      
      try {
        return JSON.parse(response.message);
      } catch {
        return {
          issues: [],
          warnings: [response.message],
          suggestions: []
        };
      }
    } catch (error) {
      logger.error('Issue detection failed', error as Error);
      throw error;
    }
  }

  /**
   * Compare with similar cars
   */
  async compareWithSimilarCars(
    carData: any,
    marketPrices: number[]
  ): Promise<{
    priceComparison: 'underpriced' | 'fair' | 'overpriced';
    recommendation: string;
    analysis: string;
  }> {
    try {
      const avgMarketPrice = marketPrices.reduce((a, b) => a + b) / marketPrices.length;
      const priceDiff = carData.currentPrice - avgMarketPrice;
      const percentDiff = (priceDiff / avgMarketPrice) * 100;

      const prompt = `
        This car is listed at ${carData.currentPrice} EUR
        Market average for similar cars: ${avgMarketPrice.toFixed(2)} EUR
        Difference: ${percentDiff > 0 ? '+' : ''}${percentDiff.toFixed(1)}%
        
        Car specs: ${carData.make} ${carData.model} ${carData.year}, ${carData.mileage} km
        
        Is this price competitive? Provide recommendation.
      `;

      const response = await this.chat(prompt);

      let priceComparison: 'underpriced' | 'fair' | 'overpriced' = 'fair';
      if (percentDiff < -10) priceComparison = 'underpriced';
      else if (percentDiff > 10) priceComparison = 'overpriced';

      return {
        priceComparison,
        recommendation: percentDiff < -5 ? 'Consider slightly increasing the price' : 
                       percentDiff > 5 ? 'Consider reducing the price to be more competitive' :
                       'Price is competitive',
        analysis: response.message
      };
    } catch (error) {
      logger.error('Comparison failed', error as Error);
      throw error;
    }
  }

  /**
   * Calculate cost of API call
   */
  private calculateCost(inputTokens: number, outputTokens: number): number {
    const inputCost = (inputTokens / 1000) * this.costPer1kTokens.input;
    const outputCost = (outputTokens / 1000) * this.costPer1kTokens.output;
    return inputCost + outputCost;
  }

  /**
   * Get cost estimate for operation
   */
  getCostEstimate(operationType: string): number {
    const estimates: { [key: string]: number } = {
      'chat': 0.05,
      'analysis': 0.10,
      'comparison': 0.08,
      'description': 0.07,
      'negotiation': 0.06
    };
    return estimates[operationType] || 0.05;
  }
}

export const openAIService = OpenAIGPT4Service.getInstance();
