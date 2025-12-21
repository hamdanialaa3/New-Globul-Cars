import { Timestamp } from 'firebase/firestore';

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