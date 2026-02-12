/**
 * AI Router Service - Smart Selection Between Gemini & DeepSeek
 * Constitutional Compliance: Numeric ID System ✅
 * Location: Bulgaria | Languages: BG/EN | Currency: EUR
 */

import { geminiChatService } from './gemini-chat.service';
import { deepSeekService } from './DeepSeekService';
import { logger } from '../logger-service';

export type AIProvider = 'gemini' | 'deepseek';
export type OperationType = 'single' | 'bulk' | 'analysis' | 'image' | 'chat' | 'market-insights';
export type UserType = 'private' | 'dealer' | 'company';

interface VehicleData {
  make: string;
  model: string;
  year: number;
  fuelType?: string;
  transmission?: string;
  mileage?: number;
  power?: number;
  equipment?: string[];
  region?: string;
}

interface GenerationOptions {
  language?: 'bg' | 'en';
  userType?: UserType;
  forceProvider?: AIProvider;
}

interface RoutingDecision {
  provider: AIProvider;
  reason: string;
  estimatedCost: number;
}

class AIRouterService {
  private static instance: AIRouterService;

  private constructor() {}

  static getInstance(): AIRouterService {
    if (!this.instance) {
      this.instance = new AIRouterService();
    }
    return this.instance;
  }

  /**
   * Smart AI selection based on operation type and context
   */
  private async selectProvider(
    operationType: OperationType,
    userType: UserType,
    bulkSize?: number
  ): Promise<RoutingDecision> {
    // Force Gemini for image operations (DeepSeek doesn't support vision)
    if (operationType === 'image') {
      return {
        provider: 'gemini',
        reason: 'Image analysis requires Gemini Vision API',
        estimatedCost: 0.002
      };
    }

    // Bulk operations → DeepSeek (cost-effective)
    if (operationType === 'bulk' || (bulkSize && bulkSize > 5)) {
      return {
        provider: 'deepseek',
        reason: 'Bulk operations optimized for cost with DeepSeek',
        estimatedCost: 0.0003 * (bulkSize || 1)
      };
    }

    // Market insights & data analysis → DeepSeek (faster, cheaper)
    if (operationType === 'market-insights' || operationType === 'analysis') {
      return {
        provider: 'deepseek',
        reason: 'Data analysis optimized with DeepSeek',
        estimatedCost: 0.0005
      };
    }

    // Single premium operations for companies → Gemini (higher quality)
    if (operationType === 'single' && userType === 'company') {
      return {
        provider: 'gemini',
        reason: 'Premium quality for company accounts',
        estimatedCost: 0.002
      };
    }

    // Default for chat & single operations → DeepSeek (balanced)
    return {
      provider: 'deepseek',
      reason: 'Standard operations with optimal cost/performance',
      estimatedCost: 0.0004
    };
  }

  /**
   * Generate single vehicle description with smart routing
   */
  async generateDescription(
    vehicleData: VehicleData,
    options: GenerationOptions = {}
  ): Promise<{
    description: string;
    provider: AIProvider;
    cost: number;
    generatedBy: 'ai' | 'template';
  }> {
    const userType = options.userType || 'private';
    const language = options.language || 'bg';

    try {
      // Force provider if specified
      if (options.forceProvider) {
        logger.info('Using forced AI provider', { provider: options.forceProvider });
        return await this.callProvider(options.forceProvider, vehicleData, options);
      }

      // Smart selection
      const decision = await this.selectProvider('single', userType);
      logger.info('AI Provider selected', decision);

      return await this.callProvider(decision.provider, vehicleData, options);

    } catch (error) {
      logger.error('AI description generation failed', error as Error, { vehicleData });
      
      // Fallback to template
      return {
        description: this.getFallbackTemplate(vehicleData, language),
        provider: 'deepseek',
        cost: 0,
        generatedBy: 'template'
      };
    }
  }

  /**
   * Bulk generate descriptions (optimized for DeepSeek)
   */
  async bulkGenerateDescriptions(
    vehicles: Array<VehicleData & { id: string }>,
    options: GenerationOptions = {}
  ): Promise<{
    descriptions: Array<{
      vehicleId: string;
      description: string;
      provider: AIProvider;
      success: boolean;
      error?: string;
    }>;
    totalCost: number;
    provider: AIProvider;
    processedCount: number;
  }> {
    const language = options.language || 'bg';
    const batchSize = 10;
    const results: any[] = [];
    let totalCost = 0;

    try {
      const decision = await this.selectProvider('bulk', options.userType || 'dealer', vehicles.length);
      logger.info('Bulk processing with AI provider', { ...decision, count: vehicles.length });

      // Process in batches
      for (let i = 0; i < vehicles.length; i += batchSize) {
        const batch = vehicles.slice(i, i + batchSize);
        
        const batchResults = await Promise.allSettled(
          batch.map(async (vehicle) => {
            const result = await this.callProvider(decision.provider, vehicle, options);
            return {
              vehicleId: vehicle.id,
              description: result.description,
              provider: result.provider,
              success: true
            };
          })
        );

        batchResults.forEach((result) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
            totalCost += decision.estimatedCost / vehicles.length;
          } else {
            results.push({
              vehicleId: 'unknown',
              description: '',
              provider: decision.provider,
              success: false,
              error: result.reason?.message || 'Unknown error'
            });
          }
        });

        // Rate limiting delay
        if (i + batchSize < vehicles.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      return {
        descriptions: results,
        totalCost,
        provider: decision.provider,
        processedCount: results.filter(r => r.success).length
      };

    } catch (error) {
      logger.error('Bulk generation failed', error as Error);
      throw error;
    }
  }

  /**
   * Get market insights (DeepSeek optimized)
   */
  async getMarketInsights(
    region: string,
    make: string,
    model?: string
  ): Promise<{
    insights: string;
    provider: AIProvider;
    cost: number;
  }> {
    try {
      const decision = await this.selectProvider('market-insights', 'company');
      
      const prompt = model
        ? `Provide market insights for ${make} ${model} in ${region}, Bulgaria. Include average prices, demand trends, and buyer preferences. Response in Bulgarian.`
        : `Provide market insights for ${make} vehicles in ${region}, Bulgaria. Include popular models, average prices, and market trends. Response in Bulgarian.`;

      const response = await deepSeekService.generateText({
        prompt,
        model: 'deepseek-chat',
        temperature: 0.3,
        language: 'bg',
        systemMessage: 'You are a Bulgarian automotive market analyst with deep knowledge of local trends.'
      });

      return {
        insights: response.content || 'No insights available',
        provider: 'deepseek',
        cost: decision.estimatedCost
      };

    } catch (error) {
      logger.error('Market insights generation failed', error as Error);
      throw error;
    }
  }

  /**
   * Call specific AI provider
   */
  private async callProvider(
    provider: AIProvider,
    vehicleData: VehicleData,
    options: GenerationOptions
  ): Promise<{
    description: string;
    provider: AIProvider;
    cost: number;
    generatedBy: 'ai' | 'template';
  }> {
    const language = options.language || 'bg';
    const estimatedCost = provider === 'gemini' ? 0.002 : 0.0004;

    try {
      if (provider === 'gemini') {
        const context = { vehicleListing: vehicleData };
        const prompt = this.buildPrompt(vehicleData, language);
        const response = await geminiChatService.chat(prompt, context);

        return {
          description: response,
          provider: 'gemini',
          cost: estimatedCost,
          generatedBy: 'ai'
        };
      } else {
        const prompt = this.buildPrompt(vehicleData, language);
        const response = await deepSeekService.generateText({
          prompt,
          model: 'deepseek-chat',
          temperature: 0.7,
          language,
          systemMessage: language === 'bg' 
            ? 'Вие сте експерт в продажбата на автомобили в България.'
            : 'You are an expert car sales consultant.'
        });

        return {
          description: response.content || this.getFallbackTemplate(vehicleData, language),
          provider: 'deepseek',
          cost: estimatedCost,
          generatedBy: response.success ? 'ai' : 'template'
        };
      }
    } catch (error) {
      logger.error(`${provider} API call failed`, error as Error);
      throw error;
    }
  }

  /**
   * Build AI prompt
   */
  private buildPrompt(vehicleData: VehicleData, language: 'bg' | 'en'): string {
    const { make, model, year, fuelType, transmission, mileage, equipment } = vehicleData;

    if (language === 'bg') {
      return `Напиши професионално описание за автомобил:

Марка: ${make}
Модел: ${model}
Година: ${year}
${fuelType ? `Гориво: ${fuelType}` : ''}
${transmission ? `Скоростна кутия: ${transmission}` : ''}
${mileage ? `Пробег: ${mileage} км` : ''}
${equipment?.length ? `Оборудване: ${equipment.join(', ')}` : ''}

Изисквания:
- Дължина: 150-400 думи
- Професионален тон
- Акцент върху предимствата
- Привлекателно за български купувачи`;
    }

    return `Write a professional car description:

Make: ${make}
Model: ${model}
Year: ${year}
${fuelType ? `Fuel: ${fuelType}` : ''}
${transmission ? `Transmission: ${transmission}` : ''}
${mileage ? `Mileage: ${mileage} km` : ''}
${equipment?.length ? `Features: ${equipment.join(', ')}` : ''}

Requirements:
- Length: 150-400 words
- Professional tone
- Highlight advantages
- Appeal to Bulgarian buyers`;
  }

  /**
   * Fallback template
   */
  private getFallbackTemplate(vehicleData: VehicleData, language: 'bg' | 'en'): string {
    const { make, model, year, mileage, fuelType } = vehicleData;

    if (language === 'bg') {
      return `Предлагаме ${make} ${model} от ${year} година${mileage ? ` с пробег ${mileage} км` : ''}. ${fuelType ? `${fuelType} двигател. ` : ''}Отлично състояние, редовна поддръжка. За повече информация, моля свържете се с нас.`;
    }

    return `We offer ${make} ${model} from ${year}${mileage ? ` with ${mileage} km mileage` : ''}. ${fuelType ? `${fuelType} engine. ` : ''}Excellent condition, regular maintenance. Contact us for more information.`;
  }
}

export const aiRouterService = AIRouterService.getInstance();
export default aiRouterService;
