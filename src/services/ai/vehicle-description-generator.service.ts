/**
 * Vehicle Description Generator Service
 * AI-powered vehicle description generation for Bulgarian marketplace
 * 
 * Uses Gemini AI with fallback to template-based generation
 */

import { geminiChatService } from './gemini-chat.service';
import { deepSeekService } from './DeepSeekService';
import { aiRouterService } from './ai-router.service';
import { logger } from '../logger-service';

interface VehicleData {
  make: string;
  model: string;
  year: number;
  fuelType?: string;
  transmission?: string;
  mileage?: number;
  engineSize?: string;
  power?: number;
  equipment?: string[];
  condition?: 'excellent' | 'good' | 'fair';
  color?: string;
}

interface DescriptionOptions {
  language: 'bg' | 'en';
  tone?: 'professional' | 'casual' | 'luxury';
  maxLength?: number;
  userType?: 'private' | 'dealer' | 'company';
  forceProvider?: 'gemini' | 'deepseek';
}

interface GenerationResult {
  description: string;
  generatedBy: 'ai' | 'template';
  provider?: 'gemini' | 'deepseek';
  cost?: number;
  language: string;
  characterCount: number;
}

class VehicleDescriptionGeneratorService {
  private static instance: VehicleDescriptionGeneratorService;

  private constructor() {
    // Use exported aiRouterService instance
  }

  static getInstance(): VehicleDescriptionGeneratorService {
    if (!this.instance) {
      this.instance = new VehicleDescriptionGeneratorService();
    }
    return this.instance;
  }

  /**
   * Generate AI-powered vehicle description (ENHANCED with AI Router)
   */
  async generateDescription(
    vehicleData: VehicleData,
    options: DescriptionOptions = { language: 'bg' }
  ): Promise<GenerationResult> {
    try {
      logger.info('Generating vehicle description with AI Router', {
        make: vehicleData.make,
        model: vehicleData.model,
        language: options.language,
        userType: options.userType
      });

      // Use AI Router for smart provider selection
      const result = await aiRouterService.generateDescription(vehicleData, {
        language: options.language,
        userType: options.userType,
        forceProvider: options.forceProvider
      });

      return {
        description: result.description,
        generatedBy: result.generatedBy,
        provider: result.provider,
        cost: result.cost,
        language: options.language,
        characterCount: result.description.length
      };

    } catch (error) {
      logger.error('AI Router generation failed, using fallback', error as Error, { vehicleData });

      // Fallback to template
      const templateDescription = this.generateWithTemplate(vehicleData, options);

      return {
        description: templateDescription,
        generatedBy: 'template',
        language: options.language,
        characterCount: templateDescription.length
      };
    }
  }

  /**
   * Generate description using DeepSeek AI
   */
  private async generateWithAI(
    vehicleData: VehicleData,
    options: DescriptionOptions
  ): Promise<string | null> {
    try {
      const prompt = this.buildPrompt(vehicleData, options);

      const response = await deepSeekService.generateText({
        prompt: prompt,
        model: 'deepseek-chat',
        temperature: 0.7,
        systemMessage: options.language === 'bg'
          ? 'Вие сте експерт в продажбата на автомобили в България.'
          : 'You are an expert car sales consultant.'
      });

      if (response && response.success && response.content) {
        return this.cleanAIResponse(response.content);
      }

      logger.warn('DeepSeek response invalid', { response });
      return null;

    } catch (error) {
      logger.error('DeepSeek AI call failed', error as Error);
      return null;
    }
  }

  /**
   * Build AI prompt based on vehicle data and language
   */
  private buildPrompt(vehicleData: VehicleData, options: DescriptionOptions): string {
    const { make, model, year, fuelType, transmission, mileage, equipment } = vehicleData;
    const maxLength = options.maxLength || 500;

    if (options.language === 'bg') {
      return `Ти си експерт автомобилен дилър в България с дългогодишен опит в писането на привлекателни обяви.

Напиши професионално и убедително описание за следния автомобил:

ХАРАКТЕРИСТИКИ:
• Марка и модел: ${make} ${model}
• Година: ${year}
• Гориво: ${fuelType || 'не е посочено'}
• Скоростна кутия: ${transmission === 'automatic' ? 'Автоматична' : transmission === 'manual' ? 'Ръчна' : 'не е посочено'}
• Пробег: ${mileage ? `${mileage.toLocaleString()} км` : 'не е посочен'}
${equipment && equipment.length > 0 ? `• Оборудване: ${equipment.join(', ')}` : ''}

ИЗИСКВАНИЯ:
1. Дължина: между 300 и ${maxLength} символа
2. Език: само български (кирилица)
3. Тон: ${this.getToneBulgarian(options.tone)}
4. Структура:
   - Започни с кратко представяне на автомобила
   - Подчертай най-важните предимства
   - Спомени ключовото оборудване (ако има)
   - Завърши с призив към действие
5. НЕ измисляй факти - използвай САМО дадената информация
6. Избягвай клишета като "уникална възможност", "не се колебайте"
7. Без заглавие, само текст на описанието

Генерирай само текста на описанието, без допълнителни коментари:`;
    } else {
      return `You are an expert automotive dealer with years of experience in writing compelling car listings.

Write a professional and persuasive description for the following vehicle:

SPECIFICATIONS:
• Make and Model: ${make} ${model}
• Year: ${year}
• Fuel Type: ${fuelType || 'not specified'}
• Transmission: ${transmission || 'not specified'}
• Mileage: ${mileage ? `${mileage.toLocaleString()} km` : 'not specified'}
${equipment && equipment.length > 0 ? `• Equipment: ${equipment.join(', ')}` : ''}

REQUIREMENTS:
1. Length: between 300 and ${maxLength} characters
2. Language: English only
3. Tone: ${options.tone || 'professional'}
4. Structure:
   - Start with a brief introduction
   - Highlight key advantages
   - Mention important equipment (if available)
   - End with a call to action
5. DO NOT invent facts - use ONLY the provided information
6. Avoid clichés
7. No title, just the description text

Generate only the description text without any additional comments:`;
    }
  }

  /**
   * Get tone description in Bulgarian
   */
  private getToneBulgarian(tone?: string): string {
    switch (tone) {
      case 'luxury':
        return 'елегантен и престижен';
      case 'casual':
        return 'приятелски и лек';
      default:
        return 'професионален но достъпен';
    }
  }

  /**
   * Clean AI response (remove quotes, extra whitespace)
   */
  private cleanAIResponse(response: string): string {
    return response
      .trim()
      .replace(/^["']|["']$/g, '') // Remove leading/trailing quotes
      .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive line breaks
      .replace(/\s{2,}/g, ' '); // Remove multiple spaces
  }

  /**
   * Generate description using template (fallback)
   */
  private generateWithTemplate(
    vehicleData: VehicleData,
    options: DescriptionOptions
  ): string {
    const { make, model, year, fuelType, transmission, mileage, equipment } = vehicleData;

    if (options.language === 'bg') {
      const parts: string[] = [];

      // Introduction
      parts.push(`${year} ${make} ${model} в ${this.getConditionBulgarian(vehicleData.condition)}.`);

      // Technical details
      if (transmission) {
        parts.push(`${transmission === 'automatic' ? 'Автоматична' : 'Ръчна'} скоростна кутия.`);
      }
      if (fuelType) {
        parts.push(`${this.getFuelTypeBulgarian(fuelType)} двигател.`);
      }
      if (mileage) {
        parts.push(`Пробег: ${mileage.toLocaleString()} км.`);
      }

      // Equipment
      if (equipment && equipment.length > 0) {
        parts.push(`Оборудване: ${equipment.slice(0, 5).join(', ')}.`);
      }

      // Call to action
      parts.push('Свържете се с нас за повече информация и огледи!');

      return parts.join(' ');

    } else {
      const parts: string[] = [];

      parts.push(`${year} ${make} ${model} in ${vehicleData.condition || 'good'} condition.`);

      if (transmission) {
        parts.push(`${transmission} transmission.`);
      }
      if (fuelType) {
        parts.push(`${fuelType} engine.`);
      }
      if (mileage) {
        parts.push(`Mileage: ${mileage.toLocaleString()} km.`);
      }

      if (equipment && equipment.length > 0) {
        parts.push(`Equipment includes: ${equipment.slice(0, 5).join(', ')}.`);
      }

      parts.push('Contact us for more information and to schedule a viewing!');

      return parts.join(' ');
    }
  }

  /**
   * Get minimal template (emergency fallback)
   */
  private getMinimalTemplate(vehicleData: VehicleData, language: string): string {
    const { make, model, year } = vehicleData;

    if (language === 'bg') {
      return `${year} ${make} ${model}. Свържете се с нас за повече информация.`;
    } else {
      return `${year} ${make} ${model}. Contact us for more information.`;
    }
  }

  /**
   * Helper: Get condition in Bulgarian
   */
  private getConditionBulgarian(condition?: string): string {
    switch (condition) {
      case 'excellent':
        return 'отлично състояние';
      case 'good':
        return 'добро състояние';
      case 'fair':
        return 'задоволително състояние';
      default:
        return 'добро състояние';
    }
  }

  /**
   * Helper: Get fuel type in Bulgarian
   */
  private getFuelTypeBulgarian(fuelType: string): string {
    const fuelMap: Record<string, string> = {
      'petrol': 'бензинов',
      'diesel': 'дизелов',
      'electric': 'електрически',
      'hybrid': 'хибриден',
      'lpg': 'газов (LPG)',
      'cng': 'газов (CNG)'
    };
    return fuelMap[fuelType.toLowerCase()] || fuelType;
  }
}

// Export singleton instance
export const vehicleDescriptionGenerator = VehicleDescriptionGeneratorService.getInstance();
export default vehicleDescriptionGenerator;
