// Gemini Chat Service - FREE + PAID AI Assistant
// مجاني + مدفوع مع نظام الحصص

import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIChatContext, PriceSuggestion, ProfileAnalysis } from '@/types/ai.types';
import { logger } from '../logger-service';
import { aiQuotaService } from './ai-quota.service';

class GeminiChatService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private isInitialized = false;

  constructor() {
    const apiKey = process.env.REACT_APP_GEMINI_KEY;
    if (!apiKey) {
      logger.warn('Gemini API key not found');
      return;
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    this.isInitialized = true;
  }

  async chat(message: string, context: AIChatContext = {}, userId?: string): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Gemini service not initialized');
    }

    // Check quota
    if (userId) {
      const quotaCheck = await aiQuotaService.canUseFeature(userId, 'chat');
      if (!quotaCheck.allowed) {
        throw new Error(quotaCheck.reason || 'Chat quota exceeded');
      }
    }

    try {
      const systemPrompt = this.buildSystemPrompt(context);
      const fullPrompt = `${systemPrompt}\n\nUser: ${message}`;
      
      const result = await this.model.generateContent(fullPrompt);
      const response = result.response.text();
      
      // Track usage
      if (userId) {
        await aiQuotaService.trackUsage(userId, 'chat', true, { messageLength: message.length });
      }
      
      return response;
      
    } catch (error) {
      logger.error('Gemini Chat error', error as Error);
      
      if (userId) {
        await aiQuotaService.trackUsage(userId, 'chat', false);
      }
      
      throw error;
    }
  }

  async suggestPrice(carDetails: {
    make: string;
    model: string;
    year: number;
    mileage: number;
    condition: string;
    location: string;
  }, userId?: string): Promise<PriceSuggestion> {
    if (!this.isInitialized) {
      throw new Error('Gemini service not initialized');
    }

    // Check quota
    if (userId) {
      const quotaCheck = await aiQuotaService.canUseFeature(userId, 'price_suggestion');
      if (!quotaCheck.allowed) {
        throw new Error(quotaCheck.reason || 'Price suggestion quota exceeded');
      }
    }

    try {
      const prompt = `
        As a Bulgarian car market expert, suggest a fair price for:
        
        Car: ${carDetails.make} ${carDetails.model} ${carDetails.year}
        Mileage: ${carDetails.mileage} km
        Condition: ${carDetails.condition}
        Location: ${carDetails.location}
        
        Provide price range in EUR and reasoning.
        Return JSON: 
        {
          "minPrice": 15000,
          "avgPrice": 17500,
          "maxPrice": 20000,
          "reasoning": "explanation",
          "marketTrend": "average"
        }
      `;
      
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      const suggestion = this.extractJSON(text);
      
      // Track usage
      if (userId) {
        await aiQuotaService.trackUsage(userId, 'price_suggestion', true, {
          car: `${carDetails.make} ${carDetails.model}`,
          avgPrice: suggestion.avgPrice
        });
      }
      
      return suggestion;
      
    } catch (error) {
      logger.error('Price suggestion error', error as Error);
      
      if (userId) {
        await aiQuotaService.trackUsage(userId, 'price_suggestion', false);
      }
      
      throw error;
    }
  }

  async analyzeProfile(profileData: any, userId?: string): Promise<ProfileAnalysis> {
    if (!this.isInitialized) {
      throw new Error('Gemini service not initialized');
    }

    // Check quota
    if (userId) {
      const quotaCheck = await aiQuotaService.canUseFeature(userId, 'profile_analysis');
      if (!quotaCheck.allowed) {
        throw new Error(quotaCheck.reason || 'Profile analysis quota exceeded');
      }
    }

    try {
      const prompt = `
        Analyze this user profile for a car marketplace:
        ${JSON.stringify(profileData, null, 2)}
        
        Provide:
        {
          "completeness": 75,
          "trustScore": 60,
          "suggestions": ["add profile photo", "verify phone"],
          "missingFields": ["phoneNumber", "bio"]
        }
      `;
      
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      const analysis = this.extractJSON(text);
      
      // Track usage
      if (userId) {
        await aiQuotaService.trackUsage(userId, 'profile_analysis', true, {
          completeness: analysis.completeness
        });
      }
      
      return analysis;
      
    } catch (error) {
      logger.error('Profile analysis error', error as Error);
      
      if (userId) {
        await aiQuotaService.trackUsage(userId, 'profile_analysis', false);
      }
      
      throw error;
    }
  }

  private buildSystemPrompt(context: AIChatContext): string {
    const languageMap = {
      bg: 'Bulgarian',
      en: 'English',
      ar: 'Arabic',
      ru: 'Russian',
      tr: 'Turkish'
    };
    
    const language = languageMap[context.language || 'en'];
    
    return `
      You are a helpful AI assistant for a Bulgarian car marketplace.
      
      Context:
      - Page: ${context.page || 'general'}
      - Language: ${language}
      - User type: ${context.userType || 'visitor'}
      
      Guidelines:
      - Respond in ${language}
      - Be concise and helpful
      - Focus on car-related topics
      - Provide accurate Bulgarian market information
    `;
  }

  private extractJSON(text: string): any {
    try {
      return JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                       text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        return JSON.parse(jsonStr);
      }
      
      throw new Error('No valid JSON found');
    }
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}

export const geminiChatService = new GeminiChatService();
export default geminiChatService;
