/**
 * AI Learning System
 * Collects feedback and automatically improves templates
 * 
 * @module learning-system
 * @description Learns from user ratings and improves AI quality
 */

import { db } from '../../firebase/firebase-config';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit, 
  Timestamp 
} from 'firebase/firestore';
import { deepSeekService } from './DeepSeekService';
import { logger } from '../logger-service';

// ================ Interfaces ================

export interface AIFeedback {
  id?: string;
  userId: string;
  requestId: string;
  featureType: 'car_description' | 'smart_reply' | 'price_analysis' | 'image_analysis';
  rating: 1 | 2 | 3 | 4 | 5;
  feedback: string;
  prompt: string;
  response: string;
  model: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface TemplateOptimization {
  templateId: string;
  originalTemplate: string;
  optimizedTemplate: string;
  improvementScore: number;
  appliedAt: Date;
  feedbackCount: number;
  averageRating: number;
}

export interface LearningInsight {
  featureType: string;
  totalFeedback: number;
  averageRating: number;
  commonIssues: string[];
  successPatterns: string[];
  improvementSuggestions: string[];
}

// ================ Learning System Class ================

class AILearningSystem {
  private static instance: AILearningSystem;
  private readonly FEEDBACK_COLLECTION = 'ai_feedback';
  private readonly TEMPLATES_COLLECTION = 'ai_templates';
  private readonly OPTIMIZATIONS_COLLECTION = 'ai_template_optimizations';

  private constructor() {
    logger.info('AI Learning System initialized');
  }

  static getInstance(): AILearningSystem {
    if (!this.instance) {
      this.instance = new AILearningSystem();
    }
    return this.instance;
  }

  // ================ Feedback Collection ================

  /**
   * Collect user feedback
   */
  async collectFeedback(feedback: Omit<AIFeedback, 'id' | 'timestamp'>): Promise<string> {
    try {
      const feedbackRef = await addDoc(collection(db, this.FEEDBACK_COLLECTION), {
        ...feedback,
        timestamp: Timestamp.now(),
        processed: false
      });

      logger.info('Feedback collected', {
        feedbackId: feedbackRef.id,
        userId: feedback.userId,
        rating: feedback.rating,
        featureType: feedback.featureType
      });

      // If rating is low, try to optimize immediately
      if (feedback.rating <= 2) {
        await this.triggerOptimization(feedbackRef.id, feedback);
      }

      return feedbackRef.id;

    } catch (error) {
      logger.error('Failed to collect feedback', error as Error);
      throw error;
    }
  }

  /**
   * Get all feedback for a specific feature
   */
  async getFeedbackByFeature(
    featureType: string,
    minRating?: number,
    maxResults: number = 100
  ): Promise<AIFeedback[]> {
    try {
      let q = query(
        collection(db, this.FEEDBACK_COLLECTION),
        where('featureType', '==', featureType),
        orderBy('timestamp', 'desc'),
        limit(maxResults)
      );

      if (minRating !== undefined) {
        q = query(q, where('rating', '>=', minRating));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      })) as AIFeedback[];

    } catch (error) {
      logger.error('Failed to get feedback', error as Error);
      return [];
    }
  }

  // ================ Template Optimization ================

  /**
   * Improve templates based on feedback
   */
  private async triggerOptimization(
    feedbackId: string,
    feedback: Omit<AIFeedback, 'id' | 'timestamp'>
  ): Promise<void> {
    try {
      logger.info('Triggering template optimization', {
        feedbackId,
        rating: feedback.rating
      });

      // Collect similar feedback
      const similarFeedback = await this.getFeedbackByFeature(
        feedback.featureType,
        undefined,
        50
      );

      // Analyze common issues
      const commonIssues = this.analyzeCommonIssues(similarFeedback);

      // Generate optimized template
      const optimizedTemplate = await this.generateOptimizedTemplate(
        feedback.featureType,
        feedback.prompt,
        feedback.response,
        feedback.feedback,
        commonIssues
      );

      // Save optimization
      await this.saveOptimization({
        templateId: `${feedback.featureType}_optimized`,
        originalTemplate: feedback.prompt,
        optimizedTemplate: optimizedTemplate,
        improvementScore: 0, // will be calculated later
        appliedAt: new Date(),
        feedbackCount: similarFeedback.length,
        averageRating: this.calculateAverageRating(similarFeedback)
      });

      // Update feedback status
      await updateDoc(doc(db, this.FEEDBACK_COLLECTION, feedbackId), {
        processed: true,
        optimizationApplied: true,
        processedAt: Timestamp.now()
      });

      logger.info('Template optimization completed', {
        feedbackId,
        featureType: feedback.featureType
      });

    } catch (error) {
      logger.error('Template optimization failed', error as Error);
    }
  }

  /**
   * Generate optimized template using AI
   */
  private async generateOptimizedTemplate(
    featureType: string,
    originalPrompt: string,
    originalResponse: string,
    userFeedback: string,
    commonIssues: string[]
  ): Promise<string> {
    try {
      const optimizationPrompt = `
You are an expert in improving AI templates. You have the following template that received a low rating:

**Feature type:** ${featureType}

**Original template:**
\`\`\`
${originalPrompt}
\`\`\`

**Generated response:**
\`\`\`
${originalResponse}
\`\`\`

**User comments:**
"${userFeedback}"

**Common issues detected:**
${commonIssues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

**Required:**
Improve the original template based on:
1. User comments
2. Common issues
3. Best practices for Bulgarian language
4. Improve clarity and accuracy
5. Add clear constraints to avoid errors

**Improvement instructions:**
- Keep the overall structure of the template
- Add clearer instructions
- Improve Bulgarian language quality
- Avoid previous errors
- Add examples if necessary

Output only the improved template, without additional explanation.
      `.trim();

      const result = await deepSeekService.generate(optimizationPrompt, {
        model: 'deepseek-chat',
        maxTokens: 1500,
        temperature: 0.5
      });

      if (!result.success) {
        throw new Error('Failed to generate optimized template');
      }

      return result.content.trim();

    } catch (error) {
      logger.error('Failed to generate optimized template', error as Error);
      return originalPrompt; // Fallback to original
    }
  }

  /**
   * Save optimization to database
   */
  private async saveOptimization(optimization: TemplateOptimization): Promise<void> {
    try {
      await addDoc(collection(db, this.OPTIMIZATIONS_COLLECTION), {
        ...optimization,
        appliedAt: Timestamp.fromDate(optimization.appliedAt)
      });

      logger.info('Optimization saved', {
        templateId: optimization.templateId,
        improvementScore: optimization.improvementScore
      });

    } catch (error) {
      logger.error('Failed to save optimization', error as Error);
    }
  }

  // ================ Analysis Methods ================

  /**
   * Analyze common issues
   */
  private analyzeCommonIssues(feedbacks: AIFeedback[]): string[] {
    const lowRatedFeedback = feedbacks.filter(f => f.rating <= 2);
    
    if (lowRatedFeedback.length === 0) {
      return [];
    }

    // Extract keywords from comments
    const keywords: Record<string, number> = {};
    const commonPhrases: string[] = [];

    lowRatedFeedback.forEach(feedback => {
      const words = feedback.feedback.toLowerCase().split(/\s+/);
      
      // Search for common words
      const negativeWords = ['грешка', 'неточен', 'лош', 'проблем', 'не', 'слаб'];
      words.forEach(word => {
        if (negativeWords.some(neg => word.includes(neg))) {
          keywords[word] = (keywords[word] || 0) + 1;
        }
      });

      // Common phrases
      if (feedback.feedback.length > 20) {
        commonPhrases.push(feedback.feedback);
      }
    });

    // Sort by frequency
    const sortedIssues = Object.entries(keywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, count]) => `"${word}" appeared ${count} times`);

    return sortedIssues;
  }

  /**
   * Calculate average rating
   */
  private calculateAverageRating(feedbacks: AIFeedback[]): number {
    if (feedbacks.length === 0) return 0;

    const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0);
    return sum / feedbacks.length;
  }

  /**
   * Get learning insights
   */
  async getLearningInsights(featureType: string): Promise<LearningInsight> {
    try {
      const feedbacks = await this.getFeedbackByFeature(featureType);

      const totalFeedback = feedbacks.length;
      const averageRating = this.calculateAverageRating(feedbacks);
      const commonIssues = this.analyzeCommonIssues(feedbacks);

      // Success patterns (high ratings)
      const successPatterns = feedbacks
        .filter(f => f.rating >= 4)
        .slice(0, 5)
        .map(f => f.feedback);

      // Improvement suggestions
      const improvementSuggestions = await this.generateImprovementSuggestions(
        featureType,
        feedbacks
      );

      return {
        featureType,
        totalFeedback,
        averageRating,
        commonIssues,
        successPatterns,
        improvementSuggestions
      };

    } catch (error) {
      logger.error('Failed to get learning insights', error as Error);
      throw error;
    }
  }

  /**
   * Generate improvement suggestions
   */
  private async generateImprovementSuggestions(
    featureType: string,
    feedbacks: AIFeedback[]
  ): Promise<string[]> {
    if (feedbacks.length < 5) {
      return ['Collect more feedback to generate suggestions'];
    }

    const lowRated = feedbacks.filter(f => f.rating <= 2);
    const highRated = feedbacks.filter(f => f.rating >= 4);

    const suggestions: string[] = [];

    // Compare patterns
    if (lowRated.length > 0) {
      suggestions.push(`Improve response quality - ${lowRated.length} low ratings`);
    }

    if (highRated.length > 0) {
      suggestions.push(`Leverage successful patterns - ${highRated.length} high ratings`);
    }

    // Response rate
    const avgResponseLength = feedbacks.reduce((acc, f) => 
      acc + f.response.length, 0) / feedbacks.length;

    if (avgResponseLength < 100) {
      suggestions.push('Increase response length for more detail');
    } else if (avgResponseLength > 500) {
      suggestions.push('Shorten responses for more clarity');
    }

    return suggestions;
  }

  // ================ Statistics ================

  /**
   * Get comprehensive statistics
   */
  async getSystemStatistics(): Promise<{
    totalFeedback: number;
    averageRating: number;
    optimizationsApplied: number;
    topFeatures: Array<{ feature: string; rating: number }>;
  }> {
    try {
      const snapshot = await getDocs(collection(db, this.FEEDBACK_COLLECTION));
      const feedbacks = snapshot.docs.map((doc: any) => doc.data()) as AIFeedback[];

      const optimizationsSnapshot = await getDocs(
        collection(db, this.OPTIMIZATIONS_COLLECTION)
      );

      // Calculate overall rating
      const averageRating = feedbacks.length > 0
        ? feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length
        : 0;

      // Top features
      const featureRatings: Record<string, { total: number; count: number }> = {};
      feedbacks.forEach(f => {
        if (!featureRatings[f.featureType]) {
          featureRatings[f.featureType] = { total: 0, count: 0 };
        }
        featureRatings[f.featureType].total += f.rating;
        featureRatings[f.featureType].count += 1;
      });

      const topFeatures = Object.entries(featureRatings)
        .map(([feature, stats]) => ({
          feature,
          rating: stats.total / stats.count
        }))
        .sort((a, b) => b.rating - a.rating);

      return {
        totalFeedback: feedbacks.length,
        averageRating,
        optimizationsApplied: optimizationsSnapshot.size,
        topFeatures
      };

    } catch (error) {
      logger.error('Failed to get system statistics', error as Error);
      throw error;
    }
  }

  // ================ Auto-Learning ================

  /**
   * Run auto-learning (executed periodically)
   */
  async runAutoLearning(): Promise<void> {
    try {
      logger.info('Starting auto-learning cycle');

      // Get unprocessed feedback
      const unprocessedQuery = query(
        collection(db, this.FEEDBACK_COLLECTION),
        where('processed', '==', false),
        where('rating', '<=', 2),
        limit(10)
      );

      const snapshot = await getDocs(unprocessedQuery);

      for (const feedbackDoc of snapshot.docs) {
        const feedback = feedbackDoc.data() as AIFeedback;
        await this.triggerOptimization(feedbackDoc.id, feedback);
      }

      logger.info('Auto-learning cycle completed', {
        processedCount: snapshot.size
      });

    } catch (error) {
      logger.error('Auto-learning failed', error as Error);
    }
  }
}

// ================ Export ================

export const aiLearningSystem = AILearningSystem.getInstance();
export default aiLearningSystem;
