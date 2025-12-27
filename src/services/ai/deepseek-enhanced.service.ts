/**
 * Enhanced DeepSeek Service with Advanced Features
 * Implements the complete AI integration plan
 * Location: Bulgaria | Languages: BG/EN | Currency: EUR
 */

import { deepSeekService } from './DeepSeekService';
import { logger } from '../logger-service';

interface PriceSuggestion {
  suggestedPrice: number;
  priceRange: { min: number; max: number };
  reasoning: string;
  confidence: number;
}

interface SearchFilters {
  make?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  priceFrom?: number;
  priceTo?: number;
  fuelType?: string;
  city?: string;
}

interface ListingQuality {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

interface FraudDetection {
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
  warnings: string[];
  reasoning: string;
}

class DeepSeekEnhancedService {
  private static instance: DeepSeekEnhancedService;

  static getInstance(): DeepSeekEnhancedService {
    if (!this.instance) {
      this.instance = new DeepSeekEnhancedService();
    }
    return this.instance;
  }

  /**
   * 🎯 Feature 1: Smart Price Suggestion
   */
  async suggestPrice(carData: {
    make: string;
    model: string;
    year: number;
    mileage: number;
    condition: string;
    city: string;
    equipment?: string[];
  }, language: 'bg' | 'en' = 'bg'): Promise<PriceSuggestion> {
    try {
      const prompt = language === 'bg'
        ? `Анализирай пазара на автомобили в България и предложи цена за:
Марка: ${carData.make}
Модел: ${carData.model}
Година: ${carData.year}
Пробег: ${carData.mileage} км
Състояние: ${carData.condition}
Град: ${carData.city}
${carData.equipment ? `Оборудване: ${carData.equipment.join(', ')}` : ''}

Върни отговор в JSON формат:
{
  "suggestedPrice": [препоръчителна цена в EUR],
  "priceRange": { "min": [минимална цена], "max": [максимална цена] },
  "reasoning": "[обяснение на български]",
  "confidence": [ниво на увереност 0-1]
}`
        : `Analyze Bulgarian car market and suggest price for:
Make: ${carData.make}, Model: ${carData.model}, Year: ${carData.year}
Mileage: ${carData.mileage} km, Condition: ${carData.condition}, City: ${carData.city}

Return JSON: {"suggestedPrice": number, "priceRange": {"min": number, "max": number}, "reasoning": "string", "confidence": number}`;

      const response = await deepSeekService.generateText({
        prompt,
        model: 'deepseek-chat',
        temperature: 0.3,
        language
      });

      if (!response.success) {
        throw new Error('AI price suggestion failed');
      }

      const result = JSON.parse(response.content);
      logger.info('AI price suggestion generated', { carData, result });
      
      return result;
    } catch (error) {
      logger.error('Price suggestion failed', error as Error);
      throw error;
    }
  }

  /**
   * 🎯 Feature 2: Smart Search Assistant
   */
  async searchAssistant(userQuery: string, language: 'bg' | 'en' = 'bg'): Promise<{
    interpretation: string;
    suggestedFilters: SearchFilters;
    additionalQuestions: string[];
  }> {
    try {
      const prompt = language === 'bg'
        ? `Анализирай заявка за търсене на автомобил: "${userQuery}"
Върни JSON: {"interpretation": "string", "suggestedFilters": {...}, "additionalQuestions": ["string"]}`
        : `Analyze car search query: "${userQuery}"
Return JSON: {"interpretation": "string", "suggestedFilters": {...}, "additionalQuestions": ["string"]}`;

      const response = await deepSeekService.generateText({
        prompt,
        model: 'deepseek-chat',
        temperature: 0.5,
        language
      });

      if (!response.success) {
        throw new Error('Search assistant failed');
      }

      const result = JSON.parse(response.content);
      logger.info('Search assistant completed', { userQuery, result });
      
      return result;
    } catch (error) {
      logger.error('Search assistant failed', error as Error);
      throw error;
    }
  }

  /**
   * 🎯 Feature 3: Listing Quality Checker
   */
  async checkListingQuality(listing: {
    title: string;
    description: string;
    price: number;
    images: number;
    equipment: string[];
  }, language: 'bg' | 'en' = 'bg'): Promise<ListingQuality> {
    try {
      const prompt = language === 'bg'
        ? `Анализирай качеството на обява: Заглавие: ${listing.title}, Описание: ${listing.description}, Цена: €${listing.price}, Снимки: ${listing.images}
Върни JSON: {"score": number, "strengths": ["string"], "weaknesses": ["string"], "suggestions": ["string"]}`
        : `Analyze listing quality: Title: ${listing.title}, Description: ${listing.description}, Price: €${listing.price}, Images: ${listing.images}
Return JSON: {"score": number, "strengths": ["string"], "weaknesses": ["string"], "suggestions": ["string"]}`;

      const response = await deepSeekService.generateText({
        prompt,
        model: 'deepseek-chat',
        temperature: 0.4,
        language
      });

      if (!response.success) {
        throw new Error('Quality check failed');
      }

      const result = JSON.parse(response.content);
      logger.info('Listing quality checked', { listing, result });
      
      return result;
    } catch (error) {
      logger.error('Quality check failed', error as Error);
      throw error;
    }
  }

  /**
   * 🎯 Feature 4: Fraud Detection
   */
  async detectFraud(listing: {
    title: string;
    description: string;
    price: number;
    year: number;
    mileage: number;
    sellerType: 'private' | 'dealer' | 'company';
    images: number;
  }, language: 'bg' | 'en' = 'bg'): Promise<FraudDetection> {
    try {
      const prompt = language === 'bg'
        ? `Анализирай за измама: Заглавие: ${listing.title}, Цена: €${listing.price}, Година: ${listing.year}, Пробег: ${listing.mileage}км, Снимки: ${listing.images}
Върни JSON: {"riskLevel": "low|medium|high", "confidence": number, "warnings": ["string"], "reasoning": "string"}`
        : `Analyze for fraud: Title: ${listing.title}, Price: €${listing.price}, Year: ${listing.year}, Mileage: ${listing.mileage}km, Images: ${listing.images}
Return JSON: {"riskLevel": "low|medium|high", "confidence": number, "warnings": ["string"], "reasoning": "string"}`;

      const response = await deepSeekService.generateText({
        prompt,
        model: 'deepseek-chat',
        temperature: 0.2,
        language
      });

      if (!response.success) {
        throw new Error('Fraud detection failed');
      }

      const result = JSON.parse(response.content);
      logger.info('Fraud detection completed', { listing, result });
      
      return result;
    } catch (error) {
      logger.error('Fraud detection failed', error as Error);
      throw error;
    }
  }

  /**
   * 🎯 Feature 5: Chatbot Assistant
   */
  async chatbot(
    message: string,
    context: 'general' | 'listing' | 'search' | 'support',
    language: 'bg' | 'en' = 'bg'
  ): Promise<string> {
    try {
      const systemPrompts = {
        bg: {
          general: 'Ти си полезен асистент за автомобилна борса Bulgarski Mobili.',
          listing: 'Ти си експерт в създаването на обяви за автомобили.',
          search: 'Ти си експерт в намирането на подходящи автомобили.',
          support: 'Ти си служител на поддръжката за Bulgarski Mobili.'
        },
        en: {
          general: 'You are a helpful assistant for Bulgarski Mobili car marketplace.',
          listing: 'You are an expert in creating car listings.',
          search: 'You are an expert in finding suitable cars.',
          support: 'You are a support agent for Bulgarski Mobili.'
        }
      };

      const response = await deepSeekService.generateText({
        prompt: message,
        model: 'deepseek-chat',
        temperature: 0.7,
        systemMessage: systemPrompts[language][context],
        language
      });

      if (!response.success) {
        throw new Error('Chatbot failed');
      }

      logger.info('Chatbot response generated', { message, context, language });
      
      return response.content;
    } catch (error) {
      logger.error('Chatbot failed', error as Error);
      throw error;
    }
  }
}

export const deepSeekEnhancedService = DeepSeekEnhancedService.getInstance();
export default deepSeekEnhancedService;
