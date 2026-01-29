// Gemini Chat Service - Uses Cloud Function for server-side calls
// Supports Bulgarian and English only

import { AIChatContext, PriceSuggestion, ProfileAnalysis } from '../../types/ai.types';
import { logger } from '../logger-service';
import { aiQuotaService } from './ai-quota.service';
import { projectKnowledgeService } from './project-knowledge.service';
import { functions } from '../../firebase/firebase-config';
import { httpsCallable } from 'firebase/functions';

class GeminiChatService {
  private isInitialized = true; // Using callables only

  async chat(message: string, context: AIChatContext = {}, userId?: string): Promise<string> {
    // Server-side quota checks happen in the callable
    try {
      // Add project knowledge to context
      let enhancedContext = { ...context };
      
      // If question is about project, search knowledge base
      if (this.isProjectRelatedQuery(message)) {
        await projectKnowledgeService.loadKnowledgeBase();
        
        if (projectKnowledgeService.isReady()) {
          const searchResult = await projectKnowledgeService.intelligentSearch(message);
          
          if (searchResult.results.length > 0) {
            logger.info('Found project knowledge for query', { 
              query: message, 
              results: searchResult.results.length 
            });
            
            // Add context to message
            enhancedContext.projectContext = searchResult.context;
          }
        }
      }
      
      const systemPrompt = this.buildSystemPrompt(enhancedContext);
      const call = httpsCallable<any, { message: string; quotaRemaining: number }>(functions, 'geminiChat');
      const res = await call({ message, context: { ...(enhancedContext || {}), systemPrompt } });
      const reply = res.data?.message ?? '';

      return reply;

    } catch (error) {
      logger.error('Gemini Chat error (callable)', error as Error);
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
    // Server callable

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
      
      const call = httpsCallable<typeof carDetails, any>(functions, 'suggestPriceAI');
      const res = await call(carDetails);
      const suggestion = res.data;
      
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
    // Server callable

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
      
      const call = httpsCallable<{ profileData: any }, any>(functions, 'analyzeProfileAI');
      const res = await call({ profileData });
      const analysis = res.data;
      
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
      en: 'English'
    };
    
    const language = languageMap[context.language || 'en'];
    
    let prompt = `
      You are an expert AI assistant for the Koli One project.
      
      Context:
      - Page: ${context.page || 'general'}
      - Language: ${language}
      - User type: ${context.userType || 'visitor'}
      
      Guidelines:
      - Respond in ${language}
      - Be concise and helpful
      - Focus on car-related topics
      - Provide accurate Bulgarian market information
      - If asked about code/technical details, use the project knowledge provided
    `;
    
    // Add project context if available
    if ((context as any).projectContext) {
      prompt += `\n\n--- Project Knowledge Context ---\n${(context as any).projectContext}\n--- End Context ---\n`;
      prompt += `\nNote: Use the above project information to answer technical questions accurately.`;
    }
    
    return prompt;
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

  /**
   * Check if question is related to project
   */
  private isProjectRelatedQuery(message: string): boolean {
    const messageLower = message.toLowerCase();
    const projectKeywords = [
      'code', 'file', 'function', 'service',
      'component', 'how does', 'where is', 'what is',
      'explain', 'show me', 'find',
      'carservice', 'authprovider', 'firebase', 'react', 'typescript',
      'project', 'system', 'database'
    ];
    
    return projectKeywords.some(keyword => messageLower.includes(keyword));
  }
}

export const geminiChatService = new GeminiChatService();
export default geminiChatService;
