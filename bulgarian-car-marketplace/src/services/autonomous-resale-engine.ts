import { collection, doc, setDoc, updateDoc, getDoc, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-wrapper';

export interface MarketAnalysis {
  vin: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  marketValue: number;
  confidence: number; // 0-100
  comparableSales: MarketComparable[];
  priceRange: {
    min: number;
    max: number;
    recommended: number;
  };
  marketTrend: 'increasing' | 'stable' | 'decreasing';
  demandLevel: 'high' | 'medium' | 'low';
  analysisDate: Timestamp;
}

export interface MarketComparable {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  saleDate: Timestamp;
  location: string;
  condition: string;
  similarity: number; // 0-100
}

export interface AutonomousSaleStrategy {
  strategyId: string;
  vin: string;
  userId: string;
  targetPrice: number;
  minimumPrice: number;
  startDate: Timestamp;
  endDate?: Timestamp;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  currentOffers: SaleOffer[];
  bestOffer: SaleOffer | null;
  strategy: 'aggressive' | 'conservative' | 'balanced';
  rules: {
    acceptOffersAbove: number;
    declineOffersBelow: number;
    autoNegotiate: boolean;
    maxNegotiationRounds: number;
    notifyUserForHighOffers: boolean;
  };
  performance: {
    totalOffers: number;
    averageOffer: number;
    highestOffer: number;
    negotiationRounds: number;
  };
}

export interface SaleOffer {
  offerId: string;
  buyerId: string;
  buyerName: string;
  amount: number;
  currency: 'EUR';
  status: 'pending' | 'accepted' | 'declined' | 'counter_offered';
  counterOffer?: number;
  message: string;
  timestamp: Timestamp;
  buyerRating: number;
  buyerHistory: number; // عدد الصفقات السابقة
}

export interface ResaleRecommendation {
  vin: string;
  recommendation: 'sell_now' | 'wait' | 'hold';
  confidence: number;
  reasoning: string[];
  optimalTiming: {
    bestMonth: string;
    expectedPriceIncrease: number;
  };
  marketConditions: {
    demand: number;
    inventory: number;
    seasonalFactor: number;
  };
  alternativeActions: string[];
}

export class AutonomousResaleEngine {
  private readonly BULGARIAN_MARKET_DATA = {
    // (Comment removed - was in Arabic)
    depreciation: {
      '1_year': 0.15,  // 15% في السنة الأولى
      '2_years': 0.22, // 22% في السنتين
      '3_years': 0.28, // 28% في الثلاث سنوات
      '4_years': 0.33, // 33% في الأربع سنوات
      '5+_years': 0.40 // 40% بعد خمس سنوات
    },
    seasonalFactors: {
      'January': 0.95,
      'February': 0.98,
      'March': 1.05,
      'April': 1.08,
      'May': 1.12,
      'June': 1.10,
      'July': 1.02,
      'August': 0.95,
      'September': 1.03,
      'October': 1.08,
      'November': 1.05,
      'December': 0.98
    }
  };

  /**
   * (Comment removed - was in Arabic)
   */
  async analyzeMarketValue(vin: string): Promise<MarketAnalysis> {
    try {
      // (Comment removed - was in Arabic)
      const carDoc = await getDoc(doc(db, 'cars', vin));
      if (!carDoc.exists()) {
        throw new Error('السيارة غير موجودة');
      }

      const car = carDoc.data();

      // (Comment removed - was in Arabic)
      const comparableSales = await this.findComparableSales(car);

      // (Comment removed - was in Arabic)
      const marketValue = this.calculateMarketValue(car, comparableSales);

      // (Comment removed - was in Arabic)
      const marketTrend = await this.analyzeMarketTrends(car.make, car.model);

      // (Comment removed - was in Arabic)
      const demandLevel = this.calculateDemandLevel(comparableSales);

      const analysis: MarketAnalysis = {
        vin,
        make: car.make,
        model: car.model,
        year: car.year,
        mileage: car.mileage,
        condition: this.assessCondition(car),
        marketValue,
        confidence: this.calculateConfidence(comparableSales),
        comparableSales,
        priceRange: {
          min: marketValue * 0.85,
          max: marketValue * 1.15,
          recommended: marketValue
        },
        marketTrend,
        demandLevel,
        analysisDate: Timestamp.now()
      };

      // (Comment removed - was in Arabic)
      await setDoc(doc(db, 'marketAnalysis', vin), analysis);

      return analysis;

    } catch (error) {
      serviceLogger.error('Market analysis failed', error as Error, { vin });
      throw new Error('فشل في تحليل السوق');
    }
  }

  /**
   * (Comment removed - was in Arabic)
   */
  async createAutonomousSaleStrategy(
    vin: string,
    userId: string,
    strategy: 'aggressive' | 'conservative' | 'balanced'
  ): Promise<string> {
    try {
      // (Comment removed - was in Arabic)
      const marketAnalysis = await this.analyzeMarketValue(vin);

      // (Comment removed - was in Arabic)
      const prices = this.calculateStrategyPrices(marketAnalysis, strategy);

      const saleStrategy: AutonomousSaleStrategy = {
        strategyId: `strategy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        vin,
        userId,
        targetPrice: prices.target,
        minimumPrice: prices.minimum,
        startDate: Timestamp.now(),
        status: 'active',
        currentOffers: [],
        bestOffer: null,
        strategy,
        rules: {
          acceptOffersAbove: prices.target * 0.95,
          declineOffersBelow: prices.minimum,
          autoNegotiate: strategy !== 'conservative',
          maxNegotiationRounds: strategy === 'aggressive' ? 5 : 3,
          notifyUserForHighOffers: true
        },
        performance: {
          totalOffers: 0,
          averageOffer: 0,
          highestOffer: 0,
          negotiationRounds: 0
        }
      };

      await setDoc(doc(db, 'saleStrategies', saleStrategy.strategyId), saleStrategy);

      // (Comment removed - was in Arabic)
      await updateDoc(doc(db, 'cars', vin), {
        saleStrategy: saleStrategy.strategyId,
        autonomousSale: true,
        lastMarketAnalysis: Timestamp.now()
      });
return saleStrategy.strategyId;

    } catch (error) {
      serviceLogger.error('Sale strategy creation failed', error as Error, { vin, userId, strategy });
      throw new Error('فشل في إنشاء استراتيجية البيع');
    }
  }

  /**
   * (Comment removed - was in Arabic)
   */
  async processSaleOffer(strategyId: string, offer: Omit<SaleOffer, 'offerId' | 'timestamp'>): Promise<void> {
    try {
      // (Comment removed - was in Arabic)
      const strategyDoc = await getDoc(doc(db, 'saleStrategies', strategyId));
      if (!strategyDoc.exists()) {
        throw new Error('استراتيجية البيع غير موجودة');
      }

      const strategy = strategyDoc.data() as AutonomousSaleStrategy;

      // (Comment removed - was in Arabic)
      const offerData: SaleOffer = {
        ...offer,
        offerId: `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Timestamp.now()
      };

      // (Comment removed - was in Arabic)
      const decision = await this.applyStrategyLogic(strategy, offerData);

      // (Comment removed - was in Arabic)
      offerData.status = decision.status;
      if (decision.counterOffer) {
        offerData.counterOffer = decision.counterOffer;
        offerData.status = 'counter_offered';
      };

      // (Comment removed - was in Arabic)
      await setDoc(doc(db, 'saleOffers', offerData.offerId), offerData);

      // (Comment removed - was in Arabic)
      strategy.currentOffers.push(offerData);
      strategy.performance.totalOffers++;
      strategy.performance.averageOffer =
        (strategy.performance.averageOffer * (strategy.performance.totalOffers - 1) + offerData.amount) /
        strategy.performance.totalOffers;
      strategy.performance.highestOffer = Math.max(strategy.performance.highestOffer, offerData.amount);

      if (decision.status === 'accepted') {
        strategy.bestOffer = offerData;
        strategy.status = 'completed';
        strategy.endDate = Timestamp.now();
      }

      await updateDoc(strategyDoc.ref, {
        currentOffers: strategy.currentOffers,
        bestOffer: strategy.bestOffer,
        status: strategy.status,
        endDate: strategy.endDate,
        performance: strategy.performance
      });

      // (Comment removed - was in Arabic)
      if (decision.notifyUser) {
        await this.notifyUserOfOffer(strategy.userId, offerData, decision);
      }
} catch (error) {
      serviceLogger.error('Purchase offer processing failed', error as Error, { strategyId });
      throw new Error('فشل في معالجة عرض الشراء');
    }
  }

  /**
   * (Comment removed - was in Arabic)
   */
  async getResaleRecommendation(vin: string): Promise<ResaleRecommendation> {
    try {
      // (Comment removed - was in Arabic)
      const marketAnalysis = await this.analyzeMarketValue(vin);

      // (Comment removed - was in Arabic)
      const optimalTiming = await this.analyzeOptimalTiming(marketAnalysis);

      // (Comment removed - was in Arabic)
      const marketConditions = await this.analyzeMarketConditions(marketAnalysis);

      // (Comment removed - was in Arabic)
      const recommendation = this.generateRecommendation(marketAnalysis, optimalTiming, marketConditions);

      return {
        vin,
        recommendation: recommendation.action,
        confidence: recommendation.confidence,
        reasoning: recommendation.reasoning,
        optimalTiming,
        marketConditions,
        alternativeActions: recommendation.alternatives
      };

    } catch (error) {
      serviceLogger.error('Recommendation retrieval failed', error as Error, { vin });
      throw new Error('فشل في الحصول على التوصية');
    }
  }

  /**
   * (Comment removed - was in Arabic)
   */
  private async findComparableSales(car: { make: string; model: string; year: number; mileage: number; price?: number }): Promise<MarketComparable[]> {
    try {
      // (Comment removed - was in Arabic)
      const comparableQuery = query(
        collection(db, 'soldCars'),
        where('make', '==', car.make),
        where('model', '==', car.model),
        orderBy('saleDate', 'desc'),
        limit(20)
      );

      const comparableSnapshot = await getDocs(comparableQuery);
      const comparables: MarketComparable[] = [];

      comparableSnapshot.forEach((doc) => {
        const soldCar = doc.data();
        const similarity = this.calculateSimilarity(car, soldCar);

        if (similarity > 60) { // فقط السيارات المشابهة جداً
          comparables.push({
            id: doc.id,
            make: soldCar.make,
            model: soldCar.model,
            year: soldCar.year,
            mileage: soldCar.mileage,
            price: soldCar.salePrice,
            saleDate: soldCar.saleDate,
            location: soldCar.location || 'Bulgaria',
            condition: soldCar.condition,
            similarity
          });
        }
      });

      return comparables.sort((a, b) => b.similarity - a.similarity).slice(0, 5);

    } catch (error) {
      serviceLogger.error('Market comparables search failed', error as Error);
      return [];
    }
  }

  /**
   * (Comment removed - was in Arabic)
   */
  private calculateMarketValue(car: { year: number; mileage: number }, comparables: MarketComparable[]): number {
    if (comparables.length === 0) {
      // (Comment removed - was in Arabic)
      return this.calculateBaseMarketValue(car);
    }

    // (Comment removed - was in Arabic)
    let totalWeightedPrice = 0;
    let totalWeight = 0;

    comparables.forEach(comp => {
      const weight = comp.similarity / 100;
      totalWeightedPrice += comp.price * weight;
      totalWeight += weight;
    });

    const averagePrice = totalWeightedPrice / totalWeight;

    // (Comment removed - was in Arabic)
    const ageAdjustment = this.calculateAgeAdjustment(car.year);
    const mileageAdjustment = this.calculateMileageAdjustment(car.mileage);

    return averagePrice * ageAdjustment * mileageAdjustment;
  }

  /**
   * (Comment removed - was in Arabic)
   */
  private calculateBaseMarketValue(car: { make: string; model: string; year: number }): number {
    // (Comment removed - was in Arabic)
    const baseValues: { [key: string]: number } = {
      'VW Golf': 15000,
      'BMW 3 Series': 25000,
      'Mercedes C-Class': 28000,
      'Audi A4': 22000,
      'Skoda Octavia': 12000,
      'Opel Astra': 10000,
      'Ford Focus': 11000,
      'Toyota Corolla': 13000
    };

    const key = `${car.make} ${car.model}`;
    const baseValue = baseValues[key] || 15000; // قيمة افتراضية

    const currentYear = new Date().getFullYear();
    const age = currentYear - car.year;

    // (Comment removed - was in Arabic)
    let depreciation = 0;
    if (age <= 1) depreciation = this.BULGARIAN_MARKET_DATA.depreciation['1_year'];
    else if (age <= 2) depreciation = this.BULGARIAN_MARKET_DATA.depreciation['2_years'];
    else if (age <= 3) depreciation = this.BULGARIAN_MARKET_DATA.depreciation['3_years'];
    else if (age <= 4) depreciation = this.BULGARIAN_MARKET_DATA.depreciation['4_years'];
    else depreciation = this.BULGARIAN_MARKET_DATA.depreciation['5+_years'];

    return baseValue * (1 - depreciation);
  }

  /**
   * (Comment removed - was in Arabic)
   */
  private calculateSimilarity(
    car1: { year: number; mileage: number; price?: number },
    car2: { year: number; mileage: number; price?: number }
  ): number {
    let similarity = 100;

    // (Comment removed - was in Arabic)
    const yearDiff = Math.abs(car1.year - car2.year);
    similarity -= yearDiff * 10;

    // (Comment removed - was in Arabic)
    const mileageDiff = Math.abs(car1.mileage - car2.mileage) / 10000;
    similarity -= mileageDiff * 5;

    // (Comment removed - was in Arabic)
    if (car2.price) {
      const priceDiff = Math.abs(car1.price - car2.price) / 1000;
      similarity -= priceDiff * 2;
    }

    return Math.max(0, Math.min(100, similarity));
  }

  /**
   * (Comment removed - was in Arabic)
   */
  private assessCondition(car: { year: number; mileage: number }): 'excellent' | 'good' | 'fair' | 'poor' {
    const currentYear = new Date().getFullYear();
    const age = currentYear - car.year;

    if (age <= 2 && car.mileage < 30000) return 'excellent';
    if (age <= 4 && car.mileage < 60000) return 'good';
    if (age <= 6 && car.mileage < 100000) return 'fair';
    return 'poor';
  }

  /**
   * (Comment removed - was in Arabic)
   */
  private calculateConfidence(comparables: MarketComparable[]): number {
    if (comparables.length === 0) return 30;
    if (comparables.length < 3) return 50;
    if (comparables.length < 5) return 70;
    return 85;
  }

  /**
   * (Comment removed - was in Arabic)
   */
  private async analyzeMarketTrends(make: string, model: string): Promise<'increasing' | 'stable' | 'decreasing'> {
    try {
      // (Comment removed - was in Arabic)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const trendQuery = query(
        collection(db, 'soldCars'),
        where('make', '==', make),
        where('model', '==', model),
        where('saleDate', '>=', Timestamp.fromDate(sixMonthsAgo)),
        orderBy('saleDate', 'asc')
      );

      const trendSnapshot = await getDocs(trendQuery);

      if (trendSnapshot.size < 5) return 'stable';

      const prices = trendSnapshot.docs.map(doc => doc.data().salePrice);
      const recentAvg = prices.slice(-3).reduce((a, b) => a + b, 0) / 3;
      const olderAvg = prices.slice(0, 3).reduce((a, b) => a + b, 0) / 3;

      const change = (recentAvg - olderAvg) / olderAvg;

      if (change > 0.05) return 'increasing';
      if (change < -0.05) return 'decreasing';
      return 'stable';

    } catch (error) {
      serviceLogger.error('Market trend analysis failed', error as Error, { make, model });
      return 'stable';
    }
  }

  /**
   * (Comment removed - was in Arabic)
   */
  private calculateDemandLevel(comparables: MarketComparable[]): 'high' | 'medium' | 'low' {
    const recentComparables = comparables.filter(comp =>
      comp.saleDate.toDate() > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    if (recentComparables.length >= 3) return 'high';
    if (recentComparables.length >= 1) return 'medium';
    return 'low';
  }

  /**
   * (Comment removed - was in Arabic)
   */
  private calculateStrategyPrices(analysis: MarketAnalysis, strategy: string): { target: number; minimum: number } {
    const basePrice = analysis.marketValue;

    switch (strategy) {
      case 'aggressive':
        return {
          target: basePrice * 1.05,
          minimum: basePrice * 0.90
        };
      case 'conservative':
        return {
          target: basePrice * 0.95,
          minimum: basePrice * 0.85
        };
      case 'balanced':
      default:
        return {
          target: basePrice,
          minimum: basePrice * 0.88
        };
    }
  }

  /**
   * (Comment removed - was in Arabic)
   */
  private async applyStrategyLogic(strategy: AutonomousSaleStrategy, offer: SaleOffer): Promise<{
    status: 'pending' | 'accepted' | 'declined' | 'counter_offered';
    counterOffer?: number;
    notifyUser: boolean;
  }> {
    const amount = offer.amount;

    // (Comment removed - was in Arabic)
    if (amount >= strategy.rules.acceptOffersAbove) {
      return { status: 'accepted', notifyUser: true };
    }

    // (Comment removed - was in Arabic)
    if (amount < strategy.rules.declineOffersBelow) {
      return { status: 'declined', notifyUser: false };
    }

    // (Comment removed - was in Arabic)
    if (strategy.rules.autoNegotiate && strategy.performance.negotiationRounds < strategy.rules.maxNegotiationRounds) {
      const counterOffer = Math.min(strategy.targetPrice * 0.95, amount * 1.08);
      return {
        status: 'counter_offered',
        counterOffer,
        notifyUser: amount > strategy.targetPrice * 0.90
      };
    }

    // (Comment removed - was in Arabic)
    return { status: 'pending', notifyUser: true };
  }

  /**
   * (Comment removed - was in Arabic)
   */
  private async notifyUserOfOffer(userId: string, offer: SaleOffer, decision: { status: string }): Promise<void> {
    try {
      await setDoc(doc(collection(db, 'notifications')), {
        userId,
        type: 'sale_offer',
        title: 'عرض شراء جديد',
        message: `عرض شراء بقيمة ${offer.amount} EUR من ${offer.buyerName}`,
        data: { offerId: offer.offerId, decision: decision.status },
        read: false,
        timestamp: Timestamp.now()
      });

    } catch (error) {
      serviceLogger.error('User notification failed', error as Error, { userId, offerId: offer.offerId });
    }
  }

  /**
   * (Comment removed - was in Arabic)
   */
  private async analyzeOptimalTiming(analysis: MarketAnalysis): Promise<{ bestMonth: string; expectedPriceIncrease: number }> {
    const currentMonth = new Date().toLocaleString('en', { month: 'long' });

    // (Comment removed - was in Arabic)
    let bestMonth = currentMonth;
    let maxIncrease = 0;

    Object.entries(this.BULGARIAN_MARKET_DATA.seasonalFactors).forEach(([month, factor]) => {
      const increase = (factor - 1) * 100;
      if (increase > maxIncrease) {
        maxIncrease = increase;
        bestMonth = month;
      }
    });

    return {
      bestMonth,
      expectedPriceIncrease: maxIncrease
    };
  }

  /**
   * (Comment removed - was in Arabic)
   */
  private async analyzeMarketConditions(analysis: MarketAnalysis): Promise<{ demand: number; inventory: number; seasonalFactor: number }> {
    // (Comment removed - was in Arabic)
    const currentMonth = new Date().toLocaleString('en', { month: 'long' });
    const seasonalFactors = this.BULGARIAN_MARKET_DATA.seasonalFactors as Record<string, number>;
    const seasonalFactor = (seasonalFactors[currentMonth] || 1) * 100;
    
    return {
      demand: analysis.demandLevel === 'high' ? 80 : analysis.demandLevel === 'medium' ? 50 : 20,
      inventory: 60, // نسبة مئوية
      seasonalFactor
    };
  }

  /**
   * (Comment removed - was in Arabic)
   */
  private generateRecommendation(
    analysis: MarketAnalysis,
    timing: { bestMonth: string; expectedPriceIncrease: number },
    conditions: { demand: number; inventory: number; seasonalFactor: number }
  ): ResaleRecommendation {
    const reasons = [];
    let action: 'sell_now' | 'wait' | 'hold' = 'hold';
    let confidence = 50;

    // (Comment removed - was in Arabic)
    if (conditions.demand > 70 && analysis.marketTrend === 'increasing') {
      action = 'sell_now';
      confidence = 80;
      reasons.push('الطلب مرتفع والسوق في ارتفاع');
    } else if (conditions.seasonalFactor < 95) {
      action = 'wait';
      confidence = 70;
      reasons.push('التوقيت غير مثالي - انتظار موسم أفضل');
    } else {
      action = 'hold';
      confidence = 60;
      reasons.push('السوق مستقر - الاحتفاظ بالسيارة');
    }

    return {
      action,
      confidence,
      reasoning: reasons,
      alternatives: [
        'تحسين حالة السيارة لزيادة القيمة',
        'إضافة ميزات إضافية',
        'انتظار انخفاض المخزون'
      ]
    };
  }

  /**
   * (Comment removed - was in Arabic)
   */
  private calculateAgeAdjustment(year: number): number {
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;

    if (age <= 1) return 0.95;
    if (age <= 2) return 0.88;
    if (age <= 3) return 0.82;
    if (age <= 4) return 0.75;
    return 0.68;
  }

  /**
   * (Comment removed - was in Arabic)
   */
  private calculateMileageAdjustment(mileage: number): number {
    if (mileage < 20000) return 1.05;
    if (mileage < 50000) return 1.00;
    if (mileage < 80000) return 0.95;
    if (mileage < 120000) return 0.90;
    return 0.85;
  }
}

export const autonomousResaleEngine = new AutonomousResaleEngine();