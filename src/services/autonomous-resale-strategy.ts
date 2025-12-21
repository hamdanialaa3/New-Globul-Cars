import { collection, doc, setDoc, updateDoc, getDoc, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-service';
import { AutonomousSaleStrategy, SaleOffer } from './autonomous-resale-types';
import { calculateStrategyPrices } from './autonomous-resale-analysis';

/**
 * Autonomous Sale Strategy Manager
 * Handles creation and management of autonomous sale strategies
 */
export class AutonomousSaleStrategyManager {
  private static instance: AutonomousSaleStrategyManager;

  private constructor() {}

  static getInstance(): AutonomousSaleStrategyManager {
    if (!AutonomousSaleStrategyManager.instance) {
      AutonomousSaleStrategyManager.instance = new AutonomousSaleStrategyManager();
    }
    return AutonomousSaleStrategyManager.instance;
  }

  /**
   * Create autonomous sale strategy for a car
   */
  async createAutonomousSaleStrategy(
    vin: string,
    userId: string,
    marketValue: number,
    strategy: 'aggressive' | 'conservative' | 'balanced'
  ): Promise<string> {
    try {
      serviceLogger.info('Creating autonomous sale strategy', { vin, userId, strategy });

      // Calculate strategy prices
      const prices = calculateStrategyPrices({ marketValue } as any, strategy);

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

      // Update car with strategy reference
      await updateDoc(doc(db, 'cars', vin), {
        saleStrategy: saleStrategy.strategyId,
        autonomousSale: true,
        lastMarketAnalysis: Timestamp.now()
      });

      serviceLogger.info('Autonomous sale strategy created', {
        strategyId: saleStrategy.strategyId,
        vin,
        targetPrice: prices.target
      });

      return saleStrategy.strategyId;

    } catch (error) {
      serviceLogger.error('Sale strategy creation failed', error as Error, { vin, userId, strategy });
      throw new Error('فشل في إنشاء استراتيجية البيع');
    }
  }

  /**
   * Process sale offer using strategy logic
   */
  async processSaleOffer(strategyId: string, offer: Omit<SaleOffer, 'offerId' | 'timestamp'>): Promise<void> {
    try {
      serviceLogger.info('Processing sale offer', { strategyId, buyerId: offer.buyerId });

      // Get strategy
      const strategyDoc = await getDoc(doc(db, 'saleStrategies', strategyId));
      if (!strategyDoc.exists()) {
        throw new Error('استراتيجية البيع غير موجودة');
      }

      const strategy = strategyDoc.data() as AutonomousSaleStrategy;

      // Create offer data
      const offerData: SaleOffer = {
        ...offer,
        offerId: `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Timestamp.now()
      };

      // Apply strategy logic
      const decision = await this.applyStrategyLogic(strategy, offerData);

      // Update offer status
      offerData.status = decision.status;
      if (decision.counterOffer) {
        offerData.counterOffer = decision.counterOffer;
        offerData.status = 'counter_offered';
      }

      // Save offer
      await setDoc(doc(db, 'saleOffers', offerData.offerId), offerData);

      // Update strategy
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

      // Notify user if needed
      if (decision.notifyUser) {
        await this.notifyUserOfOffer(strategy.userId, offerData, decision);
      }

      serviceLogger.info('Sale offer processed', {
        strategyId,
        offerId: offerData.offerId,
        decision: decision.status
      });

    } catch (error) {
      serviceLogger.error('Purchase offer processing failed', error as Error, { strategyId });
      throw new Error('فشل في معالجة عرض الشراء');
    }
  }

  /**
   * Get strategy by ID
   */
  async getStrategy(strategyId: string): Promise<AutonomousSaleStrategy | null> {
    try {
      const strategyDoc = await getDoc(doc(db, 'saleStrategies', strategyId));
      if (!strategyDoc.exists()) return null;

      return strategyDoc.data() as AutonomousSaleStrategy;
    } catch (error) {
      serviceLogger.error('Strategy retrieval failed', error as Error, { strategyId });
      return null;
    }
  }

  /**
   * Update strategy status
   */
  async updateStrategyStatus(strategyId: string, status: AutonomousSaleStrategy['status']): Promise<void> {
    try {
      await updateDoc(doc(db, 'saleStrategies', strategyId), {
        status,
        ...(status === 'completed' || status === 'cancelled' ? { endDate: Timestamp.now() } : {})
      });

      serviceLogger.info('Strategy status updated', { strategyId, status });
    } catch (error) {
      serviceLogger.error('Strategy status update failed', error as Error, { strategyId, status });
      throw error;
    }
  }

  /**
   * Get user strategies
   */
  async getUserStrategies(userId: string): Promise<AutonomousSaleStrategy[]> {
    try {
      const strategiesQuery = query(
        collection(db, 'saleStrategies'),
        where('userId', '==', userId),
        orderBy('startDate', 'desc')
      );

      const strategiesSnapshot = await getDocs(strategiesQuery);
      const strategies: AutonomousSaleStrategy[] = [];

      strategiesSnapshot.forEach((doc) => {
        strategies.push(doc.data() as AutonomousSaleStrategy);
      });

      return strategies;
    } catch (error) {
      serviceLogger.error('User strategies retrieval failed', error as Error, { userId });
      return [];
    }
  }

  /**
   * Apply strategy logic to offer
   */
  private async applyStrategyLogic(strategy: AutonomousSaleStrategy, offer: SaleOffer): Promise<{
    status: 'pending' | 'accepted' | 'declined' | 'counter_offered';
    counterOffer?: number;
    notifyUser: boolean;
  }> {
    const amount = offer.amount;

    // Accept if above threshold
    if (amount >= strategy.rules.acceptOffersAbove) {
      return { status: 'accepted', notifyUser: true };
    }

    // Decline if below minimum
    if (amount < strategy.rules.declineOffersBelow) {
      return { status: 'declined', notifyUser: false };
    }

    // Auto-negotiate if enabled and rounds available
    if (strategy.rules.autoNegotiate && strategy.performance.negotiationRounds < strategy.rules.maxNegotiationRounds) {
      const counterOffer = Math.min(strategy.targetPrice * 0.95, amount * 1.08);
      return {
        status: 'counter_offered',
        counterOffer,
        notifyUser: amount > strategy.targetPrice * 0.90
      };
    }

    // Default to pending
    return { status: 'pending', notifyUser: true };
  }

  /**
   * Notify user of offer
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

      serviceLogger.info('User notified of offer', { userId, offerId: offer.offerId });
    } catch (error) {
      serviceLogger.error('User notification failed', error as Error, { userId, offerId: offer.offerId });
    }
  }
}

// Export singleton instance
export const autonomousSaleStrategyManager = AutonomousSaleStrategyManager.getInstance();