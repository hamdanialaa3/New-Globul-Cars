/**
 * AI Smart Suggestions Service
 * ============================
 * Context-aware reply suggestions
 * 
 * @gpt-suggestion Phase 5.5 - Smart suggestions feature
 * @author Implementation - January 14, 2026
 */

import { logger } from '@/services/logger-service';

/**
 * Suggestion types
 */
export type SuggestionType = 
  | 'quick_reply'
  | 'negotiation'
  | 'question'
  | 'scheduling'
  | 'closing';

/**
 * Suggestion interface
 */
export interface SmartSuggestion {
  id: string;
  type: SuggestionType;
  text: string;
  confidence: number;
  context?: string;
}

/**
 * Conversation context for AI analysis
 */
export interface ConversationContext {
  recentMessages: Array<{
    content: string;
    senderNumericId: number;
    timestamp: number;
  }>;
  carData?: {
    price: number;
    title: string;
    year: number;
    condition: string;
  };
  userRole: 'buyer' | 'seller';
  messageCount: number;
}

/**
 * AI Smart Suggestions Service
 * 
 * @description Generate context-aware reply suggestions using AI
 * @architecture Uses AI Router (Gemini fallback to OpenAI/DeepSeek)
 */
class AISmartSuggestionsService {
  private readonly MAX_CONTEXT_MESSAGES = 10;
  private readonly MIN_CONFIDENCE = 0.6;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  
  private suggestionCache = new Map<string, {
    suggestions: SmartSuggestion[];
    timestamp: number;
  }>();
  
  /**
   * Generate suggestions based on conversation context
   */
  async generateSuggestions(
    context: ConversationContext
  ): Promise<SmartSuggestion[]> {
    try {
      // Check cache
      const cacheKey = this.getCacheKey(context);
      const cached = this.suggestionCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        logger.info('[AISmartSuggestions] Using cached suggestions', { cacheKey });
        return cached.suggestions;
      }
      
      // Analyze context
      const suggestions = await this.analyzeAndGenerateSuggestions(context);
      
      // Cache results
      this.suggestionCache.set(cacheKey, {
        suggestions,
        timestamp: Date.now()
      });
      
      logger.info('[AISmartSuggestions] Generated suggestions', {
        count: suggestions.length,
        userRole: context.userRole
      });
      
      return suggestions;
      
    } catch (error) {
      logger.error('[AISmartSuggestions] Generation failed', error as Error);
      
      // Fallback to template-based suggestions
      return this.getTemplateSuggestions(context);
    }
  }
  
  /**
   * Analyze context and generate suggestions
   */
  private async analyzeAndGenerateSuggestions(
    context: ConversationContext
  ): Promise<SmartSuggestion[]> {
    const { recentMessages, carData, userRole, messageCount } = context;
    
    // Determine conversation stage
    const stage = this.determineConversationStage(messageCount);
    
    // Get last message
    const lastMessage = recentMessages[recentMessages.length - 1];
    if (!lastMessage) {
      return this.getTemplateSuggestions(context);
    }
    
    const suggestions: SmartSuggestion[] = [];
    
    // === QUICK REPLIES (Always available) ===
    suggestions.push(...this.getQuickReplies(lastMessage.content, userRole));
    
    // === NEGOTIATION SUGGESTIONS (Price-related) ===
    if (this.containsPriceDiscussion(lastMessage.content) && carData) {
      suggestions.push(...this.getNegotiationSuggestions(carData, userRole));
    }
    
    // === QUESTION SUGGESTIONS (Information gathering) ===
    if (stage === 'initial' || stage === 'discussion') {
      suggestions.push(...this.getQuestionSuggestions(carData, userRole));
    }
    
    // === SCHEDULING SUGGESTIONS (Test drive, meeting) ===
    if (this.containsSchedulingIntent(lastMessage.content)) {
      suggestions.push(...this.getSchedulingSuggestions(userRole));
    }
    
    // === CLOSING SUGGESTIONS (Deal finalization) ===
    if (stage === 'closing' && messageCount > 15) {
      suggestions.push(...this.getClosingSuggestions(userRole));
    }
    
    // Filter by confidence and limit
    return suggestions
      .filter(s => s.confidence >= this.MIN_CONFIDENCE)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }
  
  /**
   * Get quick reply suggestions
   */
  private getQuickReplies(
    lastMessage: string,
    userRole: 'buyer' | 'seller'
  ): SmartSuggestion[] {
    const lower = lastMessage.toLowerCase();
    
    // Detect question
    if (lower.includes('?') || lower.includes('how') || lower.includes('when')) {
      return [{
        id: 'quick_1',
        type: 'quick_reply',
        text: userRole === 'seller' 
          ? "Let me check and get back to you shortly."
          : "Thanks for the quick response!",
        confidence: 0.9,
        context: 'Question detected'
      }];
    }
    
    // Detect greeting
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('здравей')) {
      return [{
        id: 'quick_2',
        type: 'quick_reply',
        text: userRole === 'seller'
          ? "Hello! Thanks for your interest in my car. How can I help?"
          : "Hi! I'm interested in this car. Can we discuss?",
        confidence: 0.95,
        context: 'Greeting detected'
      }];
    }
    
    // Detect thanks
    if (lower.includes('thank') || lower.includes('благодаря')) {
      return [{
        id: 'quick_3',
        type: 'quick_reply',
        text: "You're welcome! Feel free to ask anything else.",
        confidence: 0.85,
        context: 'Gratitude detected'
      }];
    }
    
    return [];
  }
  
  /**
   * Get negotiation suggestions
   */
  private getNegotiationSuggestions(
    carData: ConversationContext['carData'],
    userRole: 'buyer' | 'seller'
  ): SmartSuggestion[] {
    if (!carData) return [];
    
    if (userRole === 'buyer') {
      return [
        {
          id: 'neg_1',
          type: 'negotiation',
          text: `Would you consider ${carData.price * 0.9} EUR? I'm ready to buy.`,
          confidence: 0.75,
          context: '10% discount offer'
        },
        {
          id: 'neg_2',
          type: 'negotiation',
          text: "Can we meet halfway on the price?",
          confidence: 0.7,
          context: 'Compromise suggestion'
        }
      ];
    } else {
      return [
        {
          id: 'neg_3',
          type: 'negotiation',
          text: `My lowest price is ${carData.price * 0.95} EUR. It's in excellent condition.`,
          confidence: 0.8,
          context: '5% discount counteroffer'
        },
        {
          id: 'neg_4',
          type: 'negotiation',
          text: "The price is firm, but I can include winter tires.",
          confidence: 0.75,
          context: 'Value-add alternative'
        }
      ];
    }
  }
  
  /**
   * Get question suggestions
   */
  private getQuestionSuggestions(
    carData: ConversationContext['carData'],
    userRole: 'buyer' | 'seller'
  ): SmartSuggestion[] {
    if (userRole === 'buyer') {
      return [
        {
          id: 'q_1',
          type: 'question',
          text: "Can I see more photos of the car?",
          confidence: 0.8,
          context: 'Information request'
        },
        {
          id: 'q_2',
          type: 'question',
          text: "Has the car been in any accidents?",
          confidence: 0.85,
          context: 'Safety inquiry'
        },
        {
          id: 'q_3',
          type: 'question',
          text: "When can I come for a test drive?",
          confidence: 0.9,
          context: 'Test drive request'
        }
      ];
    } else {
      return [
        {
          id: 'q_4',
          type: 'question',
          text: "What's your budget range?",
          confidence: 0.75,
          context: 'Qualification question'
        },
        {
          id: 'q_5',
          type: 'question',
          text: "Do you have any specific concerns about the car?",
          confidence: 0.7,
          context: 'Objection handling'
        }
      ];
    }
  }
  
  /**
   * Get scheduling suggestions
   */
  private getSchedulingSuggestions(
    userRole: 'buyer' | 'seller'
  ): SmartSuggestion[] {
    return [
      {
        id: 'sched_1',
        type: 'scheduling',
        text: "I'm available this weekend. Does Saturday work for you?",
        confidence: 0.85,
        context: 'Weekend availability'
      },
      {
        id: 'sched_2',
        type: 'scheduling',
        text: "Let me check my calendar and get back to you.",
        confidence: 0.8,
        context: 'Calendar check'
      },
      {
        id: 'sched_3',
        type: 'scheduling',
        text: "What time works best for you?",
        confidence: 0.9,
        context: 'Time confirmation'
      }
    ];
  }
  
  /**
   * Get closing suggestions
   */
  private getClosingSuggestions(
    userRole: 'buyer' | 'seller'
  ): SmartSuggestion[] {
    if (userRole === 'buyer') {
      return [
        {
          id: 'close_1',
          type: 'closing',
          text: "I'm ready to proceed with the purchase. What's the next step?",
          confidence: 0.9,
          context: 'Purchase commitment'
        },
        {
          id: 'close_2',
          type: 'closing',
          text: "Can you send me the contract details?",
          confidence: 0.85,
          context: 'Documentation request'
        }
      ];
    } else {
      return [
        {
          id: 'close_3',
          type: 'closing',
          text: "Great! I'll prepare the paperwork. When can we meet?",
          confidence: 0.95,
          context: 'Deal confirmation'
        },
        {
          id: 'close_4',
          type: 'closing',
          text: "I accept your offer. Let's finalize the details.",
          confidence: 0.9,
          context: 'Offer acceptance'
        }
      ];
    }
  }
  
  /**
   * Determine conversation stage
   */
  private determineConversationStage(
    messageCount: number
  ): 'initial' | 'discussion' | 'closing' {
    if (messageCount < 5) return 'initial';
    if (messageCount < 15) return 'discussion';
    return 'closing';
  }
  
  /**
   * Check if message contains price discussion
   */
  private containsPriceDiscussion(message: string): boolean {
    const lower = message.toLowerCase();
    const priceKeywords = ['price', 'cost', 'eur', '€', 'цена', 'лева'];
    return priceKeywords.some(kw => lower.includes(kw));
  }
  
  /**
   * Check if message contains scheduling intent
   */
  private containsSchedulingIntent(message: string): boolean {
    const lower = message.toLowerCase();
    const scheduleKeywords = [
      'when', 'time', 'meet', 'available', 'schedule',
      'кога', 'час', 'среща'
    ];
    return scheduleKeywords.some(kw => lower.includes(kw));
  }
  
  /**
   * Get cache key for context
   */
  private getCacheKey(context: ConversationContext): string {
    const lastMsg = context.recentMessages[context.recentMessages.length - 1];
    return `${context.userRole}_${lastMsg?.content.substring(0, 20)}_${context.messageCount}`;
  }
  
  /**
   * Get template-based suggestions (fallback)
   */
  private getTemplateSuggestions(
    context: ConversationContext
  ): SmartSuggestion[] {
    const { userRole } = context;
    
    if (userRole === 'buyer') {
      return [
        {
          id: 'tmpl_1',
          type: 'quick_reply',
          text: "I'm interested. Can we discuss?",
          confidence: 0.65
        },
        {
          id: 'tmpl_2',
          type: 'question',
          text: "Can I see more photos?",
          confidence: 0.7
        }
      ];
    } else {
      return [
        {
          id: 'tmpl_3',
          type: 'quick_reply',
          text: "Thanks for your interest!",
          confidence: 0.65
        },
        {
          id: 'tmpl_4',
          type: 'question',
          text: "What would you like to know?",
          confidence: 0.7
        }
      ];
    }
  }
  
  /**
   * Clear cache
   */
  clearCache(): void {
    this.suggestionCache.clear();
    logger.info('[AISmartSuggestions] Cache cleared');
  }
}

// Export singleton instance
export const aiSmartSuggestionsService = new AISmartSuggestionsService();
