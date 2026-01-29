/**
 * Sentiment Analysis Service
 * خدمة تحليل المشاعر
 */

import { logger } from '@/services/logger-service';

interface SentimentScore {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number; // -1 to 1
  confidence: number; // 0 to 100
}

interface DetailedSentimentAnalysis extends SentimentScore {
  emotion: string;
  keywords: string[];
  summary: string;
  subjectivity: number; // 0 to 1 (0 = objective, 1 = subjective)
  language: string;
}

interface UserInteractionSentiment {
  userId: string;
  carId: string;
  sentiment: SentimentScore;
  messagePreview: string;
  timestamp: number;
}

class SentimentAnalysisService {
  private static instance: SentimentAnalysisService;

  private sentimentKeywords = {
    positive: [
      'excellent', 'great', 'amazing', 'wonderful', 'perfect', 'beautiful',
      'clean', 'reliable', 'comfortable', 'safe', 'good', 'love', 'best',
      'happy', 'impressed', 'satisfied', 'glad', 'delighted', 'outstanding',
      'superb', 'fantastic', 'gorgeous', 'immaculate', 'pristine', 'stunning',
      'perfect condition', 'well maintained', 'like new', 'runs great'
    ],
    negative: [
      'terrible', 'awful', 'horrible', 'bad', 'poor', 'cheap', 'broken',
      'damaged', 'rusty', 'noisy', 'uncomfortable', 'unsafe', 'hate',
      'disappointed', 'problems', 'issues', 'defects', 'scratch', 'dent',
      'rust', 'leak', 'needs repair', 'problem', 'fail', 'waste', 'regret',
      'scam', 'ripoff', 'lemon', 'junk', 'piece of junk', 'total loss'
    ],
    neutral: [
      'car', 'vehicle', 'model', 'year', 'mileage', 'price', 'condition',
      'color', 'engine', 'transmission', 'features', 'location'
    ]
  };

  private emotionKeywords = {
    happy: ['happy', 'joyful', 'delighted', 'pleased', 'satisfied', 'love'],
    angry: ['angry', 'furious', 'mad', 'frustrated', 'upset', 'hate'],
    sad: ['sad', 'disappointed', 'unhappy', 'depressed', 'upset'],
    confident: ['confident', 'sure', 'certain', 'trust', 'reliable'],
    skeptical: ['doubt', 'skeptical', 'suspicious', 'uncertain', 'question'],
    excited: ['excited', 'thrilled', 'enthusiastic', 'eager', 'interested']
  };

  private constructor() {}

  static getInstance(): SentimentAnalysisService {
    if (!this.instance) {
      this.instance = new SentimentAnalysisService();
    }
    return this.instance;
  }

  /**
   * Analyze sentiment of text
   */
  async analyzeSentiment(text: string, language = 'en'): Promise<DetailedSentimentAnalysis> {
    try {
      logger.info('Analyzing sentiment', { textLength: text.length, language });

      const lowerText = text.toLowerCase();

      // Count keyword occurrences
      const positiveCount = this.sentimentKeywords.positive.filter(
        keyword => lowerText.includes(keyword)
      ).length;

      const negativeCount = this.sentimentKeywords.negative.filter(
        keyword => lowerText.includes(keyword)
      ).length;

      // Calculate basic sentiment score
      let score = 0;
      let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';

      if (positiveCount > negativeCount) {
        score = Math.min(positiveCount / 10, 1);
        sentiment = 'positive';
      } else if (negativeCount > positiveCount) {
        score = -Math.min(negativeCount / 10, 1);
        sentiment = 'negative';
      } else if (positiveCount > 0 || negativeCount > 0) {
        // Equal counts
        score = 0;
        sentiment = 'neutral';
      }

      // Detect emotion
      const emotion = this.detectEmotion(lowerText);

      // Extract keywords
      const keywords = this.extractKeywords(text);

      // Calculate subjectivity
      const subjectivity = this.calculateSubjectivity(text);

      // Generate summary
      const summary = this.generateSummary(sentiment, positiveCount, negativeCount, emotion);

      const confidence = this.calculateConfidence(positiveCount, negativeCount, text.length);

      return {
        sentiment,
        score,
        confidence,
        emotion,
        keywords,
        summary,
        subjectivity,
        language
      };
    } catch (error) {
      logger.error('Sentiment analysis failed', error as Error);
      throw error;
    }
  }

  /**
   * Analyze listing quality through sentiment
   */
  async analyzeListingQuality(
    listingText: string,
    listingTitle: string
  ): Promise<{
    overallSentiment: DetailedSentimentAnalysis;
    titleSentiment: DetailedSentimentAnalysis;
    qualityScore: number; // 0 to 100
    issues: string[];
    strengths: string[];
    recommendations: string[];
  }> {
    try {
      const titleAnalysis = await this.analyzeSentiment(listingTitle);
      const textAnalysis = await this.analyzeSentiment(listingText);

      // Combine for overall analysis
      const overallScore = (titleAnalysis.score + textAnalysis.score) / 2;

      // Quality assessment
      let qualityScore = 50;

      if (textAnalysis.confidence > 80 && titleAnalysis.sentiment === 'positive') {
        qualityScore = Math.min(90, qualityScore + 40);
      } else if (textAnalysis.sentiment === 'positive') {
        qualityScore = Math.min(85, qualityScore + 30);
      } else if (textAnalysis.sentiment === 'negative') {
        qualityScore = Math.max(30, qualityScore - 30);
      }

      // Check for specific issues
      const issues = this.detectListingIssues(listingText);
      const strengths = this.detectListingStrengths(listingText);

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        issues,
        strengths,
        textAnalysis.sentiment
      );

      return {
        overallSentiment: {
          ...textAnalysis,
          score: overallScore,
          confidence: Math.max(titleAnalysis.confidence, textAnalysis.confidence)
        },
        titleSentiment: titleAnalysis,
        qualityScore: Math.max(0, Math.min(100, qualityScore)),
        issues,
        strengths,
        recommendations
      };
    } catch (error) {
      logger.error('Listing quality analysis failed', error as Error);
      throw error;
    }
  }

  /**
   * Monitor user interaction sentiment
   */
  async analyzeUserInteraction(
    messageText: string,
    userId: string,
    carId: string
  ): Promise<UserInteractionSentiment> {
    try {
      const sentiment = await this.analyzeSentiment(messageText);

      return {
        userId,
        carId,
        sentiment: {
          sentiment: sentiment.sentiment,
          score: sentiment.score,
          confidence: sentiment.confidence
        },
        messagePreview: messageText.substring(0, 100),
        timestamp: Date.now()
      };
    } catch (error) {
      logger.error('User interaction analysis failed', error as Error);
      throw error;
    }
  }

  /**
   * Detect emotion in text
   */
  private detectEmotion(text: string): string {
    let maxMatches = 0;
    let dominantEmotion = 'neutral';

    for (const [emotion, keywords] of Object.entries(this.emotionKeywords)) {
      const matches = keywords.filter(keyword => text.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        dominantEmotion = emotion;
      }
    }

    return dominantEmotion;
  }

  /**
   * Extract important keywords
   */
  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'is', 'was', 'are', 'been', 'be', 'have', 'has', 'had', 'do', 'does',
      'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can'
    ]);

    const keywords = words
      .filter(word => word.length > 3 && !stopWords.has(word))
      .slice(0, 10);

    return [...new Set(keywords)];
  }

  /**
   * Calculate text subjectivity
   */
  private calculateSubjectivity(text: string): number {
    const subjectiveWords = [
      'think', 'feel', 'believe', 'opinion', 'my', 'our', 'i', 'we',
      'should', 'must', 'amazing', 'terrible', 'beautiful', 'horrible'
    ];

    const words = text.toLowerCase().split(/\s+/);
    const matches = words.filter(word =>
      subjectiveWords.some(sw => word.includes(sw))
    ).length;

    return Math.min(matches / words.length, 1);
  }

  /**
   * Calculate confidence of sentiment
   */
  private calculateConfidence(
    positiveCount: number,
    negativeCount: number,
    textLength: number
  ): number {
    const totalSentimentWords = positiveCount + negativeCount;
    const wordCount = textLength / 5; // Approximate

    if (totalSentimentWords === 0) return 20;
    if (totalSentimentWords > wordCount * 0.3) return 95;
    if (totalSentimentWords > wordCount * 0.2) return 85;
    if (totalSentimentWords > wordCount * 0.1) return 70;
    return 50;
  }

  /**
   * Generate sentiment summary
   */
  private generateSummary(
    sentiment: string,
    positive: number,
    negative: number,
    emotion: string
  ): string {
    if (sentiment === 'positive') {
      return `Positive sentiment detected. ${emotion} emotion. ${positive} positive indicators found.`;
    } else if (sentiment === 'negative') {
      return `Negative sentiment detected. ${emotion} emotion. ${negative} negative indicators found.`;
    } else {
      return `Neutral sentiment. ${emotion} emotion. Balanced positive and negative indicators.`;
    }
  }

  /**
   * Detect listing issues
   */
  private detectListingIssues(text: string): string[] {
    const issues: string[] = [];
    const lowerText = text.toLowerCase();

    const issuePatterns = {
      'needs_repair': /needs repair|broken|not working|defective/i,
      'poor_condition': /poor condition|bad condition|terrible condition/i,
      'rust': /rust|rusty|corrosion/i,
      'damage': /damaged|dent|scratch|damage/i,
      'service_issues': /service|maintenance|repair|problem/i,
      'mileage_concerns': /high mileage|lots of mileage/i,
      'unclear_listing': text.length < 50
    };

    for (const [issue, pattern] of Object.entries(issuePatterns)) {
      if (pattern instanceof RegExp && pattern.test(lowerText)) {
        issues.push(issue);
      }
    }

    return issues;
  }

  /**
   * Detect listing strengths
   */
  private detectListingStrengths(text: string): string[] {
    const strengths: string[] = [];
    const lowerText = text.toLowerCase();

    const strengthPatterns = {
      'excellent_condition': /excellent condition|like new|pristine|immaculate/i,
      'well_maintained': /well maintained|well kept|perfect condition/i,
      'low_mileage': /low mileage|few miles|minimal use/i,
      'recent_service': /recently serviced|new battery|new tires|new brakes/i,
      'detailed_description': text.length > 500,
      'multiple_images': /image|photo|picture/i
    };

    for (const [strength, pattern] of Object.entries(strengthPatterns)) {
      if (pattern instanceof RegExp && pattern.test(lowerText)) {
        strengths.push(strength);
      }
    }

    return strengths;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    issues: string[],
    strengths: string[],
    sentiment: string
  ): string[] {
    const recommendations: string[] = [];

    if (sentiment === 'negative') {
      recommendations.push('Add more positive aspects of the car');
      recommendations.push('Be transparent about any known issues');
      recommendations.push('Consider professional photography');
    }

    if (issues.includes('needs_repair')) {
      recommendations.push('Fix the issues and update the listing');
    }

    if (issues.includes('unclear_listing')) {
      recommendations.push('Provide a more detailed description');
      recommendations.push('Add more information about features and condition');
    }

    if (strengths.length < 2) {
      recommendations.push('Highlight more positive aspects of the vehicle');
    }

    if (!strengths.includes('detailed_description')) {
      recommendations.push('Add more detailed description of the car');
    }

    return recommendations;
  }

  /**
   * Get sentiment trend for user
   */
  async getUserSentimentTrend(userId: string, days = 30): Promise<{
    averageSentiment: number;
    trend: 'improving' | 'declining' | 'stable';
    recentSentiments: SentimentScore[];
  }> {
    try {
      // This would fetch from database in real implementation
      return {
        averageSentiment: 0.5,
        trend: 'stable',
        recentSentiments: []
      };
    } catch (error) {
      logger.error('Sentiment trend analysis failed', error as Error);
      throw error;
    }
  }
}

export const sentimentAnalysisService = SentimentAnalysisService.getInstance();
