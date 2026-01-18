/**
 * أنواع TypeScript لنظام تسعير السيارات
 * AI-Powered Car Pricing System - Type Definitions
 */

export interface CarSpecs {
  brand: string;
  model: string;
  category: 'sedan' | 'suv' | 'coupe' | 'hatchback' | 'wagon' | 'convertible' | 'van' | 'truck' | 'motorcycle';
  year: number;
  mileage: number; // بالكيلومتر
  fuelType?: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'lpg';
  transmission?: 'manual' | 'automatic';
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface MarketPrice {
  source: string;
  url: string;
  price: number;
  currency: 'EUR' | 'BGN';
  mileage?: number;
  year?: number;
  condition?: string;
  scrapedAt: Date;
}

export interface PriceRange {
  low: number;
  average: number;
  high: number;
  currency: 'EUR' | 'BGN';
}

export interface AIAnalysis {
  estimatedPrice: PriceRange;
  confidence: number; // 0-100
  reasoning: string;
  marketTrend: 'increasing' | 'stable' | 'decreasing';
  factors: string[];
  similarCars: SimilarCar[];
}

export interface SimilarCar {
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  source: string;
  similarity: number; // 0-100
}

export interface PricingRequest {
  specs: CarSpecs;
  includeMarketData?: boolean;
  language?: 'bg' | 'en';
}

export interface PricingResponse {
  requestId: string;
  specs: CarSpecs;
  aiAnalysis: AIAnalysis;
  marketData: MarketPrice[];
  priceRange: PriceRange;
  sources: MarketSource[];
  cached: boolean;
  timestamp: Date;
}

export interface MarketSource {
  name: string;
  url: string;
  enabled: boolean;
  lastScraped?: Date;
  successRate: number; // 0-100
}

export interface PricingCache {
  carId: string;
  specs: CarSpecs;
  response: PricingResponse;
  createdAt: Date;
  expiresAt: Date;
}

export interface ScrapingResult {
  success: boolean;
  source: string;
  prices: MarketPrice[];
  error?: string;
  duration: number; // milliseconds
}
