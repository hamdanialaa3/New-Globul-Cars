/**
 * AI Learning System
 * نظام التعلم الآلي - يجمع التغذية الراجعة ويحسن القوالب تلقائياً
 * 
 * @module learning-system
 * @description يتعلم من تقييمات المستخدمين ويحسن جودة الذكاء الاصطناعي
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
   * جمع التغذية الراجعة من المستخدم
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

      // إذا كان التقييم منخفض، حاول التحسين فوراً
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
   * الحصول على جميع التغذيات الراجعة لميزة معينة
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
   * تحسين القوالب بناءً على التغذية الراجعة
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

      // جمع تغذيات مشابهة
      const similarFeedback = await this.getFeedbackByFeature(
        feedback.featureType,
        undefined,
        50
      );

      // تحليل المشاكل الشائعة
      const commonIssues = this.analyzeCommonIssues(similarFeedback);

      // توليد قالب محسّن
      const optimizedTemplate = await this.generateOptimizedTemplate(
        feedback.featureType,
        feedback.prompt,
        feedback.response,
        feedback.feedback,
        commonIssues
      );

      // حفظ التحسين
      await this.saveOptimization({
        templateId: `${feedback.featureType}_optimized`,
        originalTemplate: feedback.prompt,
        optimizedTemplate: optimizedTemplate,
        improvementScore: 0, // سيتم حسابه لاحقاً
        appliedAt: new Date(),
        feedbackCount: similarFeedback.length,
        averageRating: this.calculateAverageRating(similarFeedback)
      });

      // تحديث حالة التغذية
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
   * توليد قالب محسّن باستخدام AI
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
أنت خبير في تحسين قوالب الذكاء الاصطناعي. لديك القالب التالي الذي حصل على تقييم منخفض:

**نوع الميزة:** ${featureType}

**القالب الأصلي:**
\`\`\`
${originalPrompt}
\`\`\`

**الرد المُولد:**
\`\`\`
${originalResponse}
\`\`\`

**تعليقات المستخدم:**
"${userFeedback}"

**المشاكل الشائعة المكتشفة:**
${commonIssues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

**المطلوب:**
قم بتحسين القالب الأصلي بناءً على:
1. تعليقات المستخدم
2. المشاكل الشائعة
3. أفضل الممارسات للغة البلغارية
4. تحسين الوضوح والدقة
5. إضافة قيود واضحة لتجنب الأخطاء

**تعليمات التحسين:**
- احتفظ بالهيكل العام للقالب
- أضف تعليمات أكثر وضوحاً
- حسّن جودة اللغة البلغارية
- تجنب الأخطاء السابقة
- أضف أمثلة إذا لزم الأمر

أخرج القالب المحسّن فقط، بدون شرح إضافي.
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
   * حفظ التحسين في قاعدة البيانات
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
   * تحليل المشاكل الشائعة
   */
  private analyzeCommonIssues(feedbacks: AIFeedback[]): string[] {
    const lowRatedFeedback = feedbacks.filter(f => f.rating <= 2);
    
    if (lowRatedFeedback.length === 0) {
      return [];
    }

    // استخراج الكلمات المفتاحية من التعليقات
    const keywords: Record<string, number> = {};
    const commonPhrases: string[] = [];

    lowRatedFeedback.forEach(feedback => {
      const words = feedback.feedback.toLowerCase().split(/\s+/);
      
      // البحث عن كلمات شائعة
      const negativeWords = ['грешка', 'неточен', 'лош', 'проблем', 'не', 'слаб'];
      words.forEach(word => {
        if (negativeWords.some(neg => word.includes(neg))) {
          keywords[word] = (keywords[word] || 0) + 1;
        }
      });

      // جمل شائعة
      if (feedback.feedback.length > 20) {
        commonPhrases.push(feedback.feedback);
      }
    });

    // ترتيب حسب التكرار
    const sortedIssues = Object.entries(keywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, count]) => `"${word}" ظهرت ${count} مرة`);

    return sortedIssues;
  }

  /**
   * حساب متوسط التقييم
   */
  private calculateAverageRating(feedbacks: AIFeedback[]): number {
    if (feedbacks.length === 0) return 0;

    const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0);
    return sum / feedbacks.length;
  }

  /**
   * الحصول على رؤى التعلم
   */
  async getLearningInsights(featureType: string): Promise<LearningInsight> {
    try {
      const feedbacks = await this.getFeedbackByFeature(featureType);

      const totalFeedback = feedbacks.length;
      const averageRating = this.calculateAverageRating(feedbacks);
      const commonIssues = this.analyzeCommonIssues(feedbacks);

      // أنماط النجاح (تقييمات عالية)
      const successPatterns = feedbacks
        .filter(f => f.rating >= 4)
        .slice(0, 5)
        .map(f => f.feedback);

      // اقتراحات التحسين
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
   * توليد اقتراحات التحسين
   */
  private async generateImprovementSuggestions(
    featureType: string,
    feedbacks: AIFeedback[]
  ): Promise<string[]> {
    if (feedbacks.length < 5) {
      return ['جمع المزيد من التغذية الراجعة لتوليد اقتراحات'];
    }

    const lowRated = feedbacks.filter(f => f.rating <= 2);
    const highRated = feedbacks.filter(f => f.rating >= 4);

    const suggestions: string[] = [];

    // مقارنة الأنماط
    if (lowRated.length > 0) {
      suggestions.push(`تحسين جودة الردود - ${lowRated.length} تقييم منخفض`);
    }

    if (highRated.length > 0) {
      suggestions.push(`الاستفادة من الأنماط الناجحة - ${highRated.length} تقييم عالٍ`);
    }

    // معدل الاستجابة
    const avgResponseLength = feedbacks.reduce((acc, f) => 
      acc + f.response.length, 0) / feedbacks.length;

    if (avgResponseLength < 100) {
      suggestions.push('زيادة طول الردود لمزيد من التفاصيل');
    } else if (avgResponseLength > 500) {
      suggestions.push('اختصار الردود لتكون أكثر وضوحاً');
    }

    return suggestions;
  }

  // ================ Statistics ================

  /**
   * الحصول على إحصائيات شاملة
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

      // حساب التقييم العام
      const averageRating = feedbacks.length > 0
        ? feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length
        : 0;

      // أفضل الميزات
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
   * تشغيل التعلم التلقائي (يُنفذ دورياً)
   */
  async runAutoLearning(): Promise<void> {
    try {
      logger.info('Starting auto-learning cycle');

      // الحصول على التغذيات غير المعالجة
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
