// AI Price Valuation Cloud Function
// دالة سحابية لتقييم أسعار السيارات بالذكاء الاصطناعي

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';
import { CarValuationRequest, CarValuationResponse } from './types';

const db = getFirestore();

/**
 * تقييم سعر السيارة باستخدام الذكاء الاصطناعي
 * استخدام خوارزمية متقدمة لتحليل السوق البلغاري
 */
export const getAIPriceValuation = onCall<CarValuationRequest>(
  { region: 'europe-west1' },
  async (request) => {
    try {
      const { data, auth } = request;

      // Validate required fields
      if (!data.make || !data.model || !data.year) {
        throw new HttpsError('invalid-argument', 'Missing required fields: make, model, year');
      }

      logger.info('AI Price Valuation Request', {
        make: data.make,
        model: data.model,
        year: data.year,
        userId: auth?.uid
      });

      // Get market data from Firestore
      const marketData = await getMarketData(data.make, data.model, data.year);

      // Calculate price using AI algorithm
      const valuation = calculateAIPrice(data, marketData);

      // Track usage if user is logged in
      if (auth?.uid) {
        await trackAIUsage(auth.uid, 'price_valuation', valuation);
      }

      logger.info('AI Price Valuation Success', {
        price: valuation.predictedPrice,
        confidence: valuation.confidence
      });

      return valuation;

    } catch (error) {
      logger.error('AI Price Valuation Error', error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError('internal', 'Failed to calculate price valuation');
    }
  }
);

/**
 * الحصول على بيانات السوق من Firestore
 */
async function getMarketData(make: string, model: string, year: number) {
  try {
    // البحث عن سيارات مشابهة في آخر 6 أشهر
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const carsRef = db.collection('cars');
    const snapshot = await carsRef
      .where('make', '==', make)
      .where('model', '==', model)
      .where('year', '>=', year - 2)
      .where('year', '<=', year + 2)
      .where('createdAt', '>=', sixMonthsAgo)
      .limit(100)
      .get();

    const prices: number[] = [];
    const mileages: number[] = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.price && data.price > 0) {
        prices.push(data.price);
        if (data.mileage) mileages.push(data.mileage);
      }
    });

    return {
      prices,
      mileages,
      sampleSize: prices.length,
      avgPrice: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
      avgMileage: mileages.length > 0 ? mileages.reduce((a, b) => a + b, 0) / mileages.length : 0
    };

  } catch (error) {
    logger.error('Failed to get market data', error);
    return { prices: [], mileages: [], sampleSize: 0, avgPrice: 0, avgMileage: 0 };
  }
}

/**
 * حساب السعر باستخدام خوارزمية الذكاء الاصطناعي
 */
function calculateAIPrice(
  car: CarValuationRequest,
  marketData: any
): CarValuationResponse {
  // Base price calculation
  const currentYear = new Date().getFullYear();
  const age = currentYear - car.year;
  
  // Start with market average or estimated base price
  let basePrice = marketData.avgPrice > 0 
    ? marketData.avgPrice 
    : estimateBasePrice(car.make, car.model, car.year);

  // Age depreciation (8-12% per year)
  const depreciationRate = 0.10;
  const ageAdjustment = Math.pow(1 - depreciationRate, age);
  let adjustedPrice = basePrice * ageAdjustment;

  // Mileage adjustment
  const avgMileagePerYear = 15000;
  const expectedMileage = age * avgMileagePerYear;
  const mileageDiff = car.mileage - expectedMileage;
  const mileageAdjustment = mileageDiff * 0.05; // 5 cents per km difference
  adjustedPrice -= mileageAdjustment;

  // Condition adjustment
  const conditionMultipliers = {
    excellent: 1.15,
    good: 1.0,
    fair: 0.85,
    poor: 0.65
  };
  adjustedPrice *= conditionMultipliers[car.condition] || 1.0;

  // Fuel type adjustment
  const fuelMultipliers: Record<string, number> = {
    'Electric': 1.3,
    'Hybrid': 1.2,
    'Diesel': 1.1,
    'Gasoline': 1.0,
    'LPG': 0.9
  };
  adjustedPrice *= fuelMultipliers[car.fuelType] || 1.0;

  // Transmission adjustment
  if (car.transmission === 'Automatic') {
    adjustedPrice *= 1.1;
  }

  // Location adjustment (Sofia = premium)
  const locationMultipliers: Record<string, number> = {
    'Sofia': 1.15,
    'Plovdiv': 1.05,
    'Varna': 1.05,
    'Burgas': 1.05,
    'Ruse': 0.95,
    'Stara Zagora': 0.95,
    'Pleven': 0.90,
    'Sliven': 0.90
  };
  adjustedPrice *= locationMultipliers[car.location] || 1.0;

  // Registration status
  if (car.registeredInBulgaria === false) {
    adjustedPrice *= 0.85; // 15% discount for non-registered
  }

  // Calculate confidence based on market data
  const confidence = calculateConfidence(marketData.sampleSize);

  // Calculate price range (±10-15%)
  const variance = 0.12;
  const minPrice = Math.round(adjustedPrice * (1 - variance));
  const maxPrice = Math.round(adjustedPrice * (1 + variance));
  const predictedPrice = Math.round(adjustedPrice);

  // Determine market trend
  const marketTrend = determineMarketTrend(predictedPrice, marketData.avgPrice);

  // Generate reasoning
  const reasoning = generateReasoning(car, marketData, predictedPrice);

  return {
    predictedPrice,
    minPrice,
    maxPrice,
    confidence,
    marketTrend,
    reasoning,
    comparableListings: marketData.sampleSize,
    currency: 'EUR',
    market: 'Bulgaria'
  };
}

/**
 * تقدير السعر الأساسي بناءً على الماركة والموديل
 */
function estimateBasePrice(make: string, model: string, year: number): number {
  // Premium brands base prices (EUR)
  const brandBasePrices: Record<string, number> = {
    'BMW': 35000,
    'Mercedes': 38000,
    'Audi': 33000,
    'Volkswagen': 22000,
    'Toyota': 20000,
    'Honda': 19000,
    'Ford': 18000,
    'Opel': 15000,
    'Renault': 14000,
    'Peugeot': 14000
  };

  const basePrice = brandBasePrices[make] || 15000;
  const currentYear = new Date().getFullYear();
  const yearAdjustment = (year - 2020) * 2000; // €2000 per year from 2020

  return Math.max(basePrice + yearAdjustment, 5000);
}

/**
 * حساب مستوى الثقة بناءً على حجم العينة
 */
function calculateConfidence(sampleSize: number): number {
  if (sampleSize >= 20) return 95;
  if (sampleSize >= 10) return 85;
  if (sampleSize >= 5) return 75;
  if (sampleSize >= 2) return 65;
  return 50; // Low confidence for no market data
}

/**
 * تحديد اتجاه السوق
 */
function determineMarketTrend(predictedPrice: number, avgMarketPrice: number): 'high' | 'average' | 'low' {
  if (avgMarketPrice === 0) return 'average';
  
  const ratio = predictedPrice / avgMarketPrice;
  if (ratio > 1.1) return 'high';
  if (ratio < 0.9) return 'low';
  return 'average';
}

/**
 * توليد التفسير النصي
 */
function generateReasoning(car: CarValuationRequest, marketData: any, price: number): string {
  const parts: string[] = [];
  
  parts.push(`Based on ${marketData.sampleSize} similar listings`);
  
  const age = new Date().getFullYear() - car.year;
  if (age <= 2) {
    parts.push('almost new vehicle');
  } else if (age <= 5) {
    parts.push('relatively new vehicle');
  }

  if (car.mileage < 50000) {
    parts.push('low mileage');
  } else if (car.mileage > 150000) {
    parts.push('high mileage');
  }

  parts.push(`${car.condition} condition`);
  
  if (car.location === 'Sofia') {
    parts.push('Sofia market premium');
  }

  return parts.join(', ') + '.';
}

/**
 * تتبع استخدام AI
 */
async function trackAIUsage(userId: string, feature: string, result: any) {
  try {
    await db.collection('ai_usage_logs').add({
      userId,
      feature,
      timestamp: new Date(),
      success: true,
      result: {
        price: result.predictedPrice,
        confidence: result.confidence
      }
    });
  } catch (error) {
    logger.error('Failed to track AI usage', error);
  }
}
