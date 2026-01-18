/**
 * Hook للاستعلام عن سعر السيارة
 * usePricing Hook
 */

import { useState, useCallback } from 'react';
import { CarSpecs, PricingResponse, MarketPrice } from '../types/pricing.types';
import { pricingAIService } from '../services/pricing-ai.service';
import { marketScraperService } from '../services/market-scraper.service';
import { priceCalculatorService } from '../services/price-calculator.service';

interface UsePricingReturn {
  calculatePrice: (specs: CarSpecs) => Promise<PricingResponse | null>;
  isLoading: boolean;
  error: string | null;
  result: PricingResponse | null;
}

export const usePricing = (): UsePricingReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PricingResponse | null>(null);

  const calculatePrice = useCallback(async (specs: CarSpecs): Promise<PricingResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. البحث في السوق البلغاري
      const scrapingResults = await marketScraperService.scrapeAllSources(specs);
      const marketPrices: MarketPrice[] = [];
      
      scrapingResults.forEach(result => {
        if (result.success) {
          marketPrices.push(...result.prices);
        }
      });

      // 2. تحليل AI
      const aiAnalysis = await pricingAIService.analyzePrice(specs, marketPrices);

      // 3. تحسين السعر بناءً على بيانات السوق
      const refinedAnalysis = await pricingAIService.refinePriceWithMarketData(
        aiAnalysis,
        marketPrices
      );

      // 4. حساب السعر النهائي
      const priceRange = priceCalculatorService.calculateFinalPrice(
        refinedAnalysis,
        marketPrices
      );

      // 5. بناء Response
      const response: PricingResponse = {
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        specs,
        aiAnalysis: refinedAnalysis,
        marketData: marketPrices,
        priceRange,
        sources: scrapingResults.map(r => ({
          name: r.source,
          url: '',
          enabled: r.success,
          lastScraped: new Date(),
          successRate: r.success ? 100 : 0,
        })),
        cached: false,
        timestamp: new Date(),
      };

      setResult(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error calculating price:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    calculatePrice,
    isLoading,
    error,
    result,
  };
};
