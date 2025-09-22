// functions/src/business-apis.ts
// GLOUBUL Business API Suite - Enterprise APIs for Bulgarian Car Marketplace

import { onCall } from 'firebase-functions/v2/https';
import { BigQuery } from '@google-cloud/bigquery';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { trackAPIUsage } from './subscriptions';

const bigquery = new BigQuery();
const db = getFirestore();

// Interface for B2B subscription with tier info
interface B2BSubscription {
  dealerId: string;
  tier: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'cancelled';
  expiresAt: FirebaseFirestore.Timestamp;
  apiUsage: {
    requestsThisMonth: number;
    lastReset: FirebaseFirestore.Timestamp;
  };
}

// Check B2B subscription and return tier info
async function getB2BSubscriptionTier(userId: string): Promise<{ hasAccess: boolean; tier: string; usage: any }> {
  try {
    const subscriptionDoc = await db.collection('b2bSubscriptions').doc(userId).get();

    if (!subscriptionDoc.exists) {
      return { hasAccess: false, tier: 'none', usage: null };
    }

    const subscription = subscriptionDoc.data() as B2BSubscription;

    // Check if subscription is active and not expired
    const now = new Date();
    const expiresAt = subscription.expiresAt.toDate();

    if (subscription.status !== 'active' || expiresAt <= now) {
      return { hasAccess: false, tier: 'none', usage: null };
    }

    return {
      hasAccess: true,
      tier: subscription.tier,
      usage: subscription.apiUsage || { requestsThisMonth: 0 }
    };
  } catch (error) {
    logger.error('Error checking B2B subscription:', error);
    return { hasAccess: false, tier: 'none', usage: null };
  }
}

// Check API limits based on tier
function checkAPILimits(tier: string, usage: any, endpoint: string): boolean {
  const limits = {
    basic: { requests_per_month: 1000 },
    premium: { requests_per_month: 10000 },
    enterprise: { requests_per_month: 100000 }
  };

  const limit = limits[tier as keyof typeof limits]?.requests_per_month || 0;
  return usage.requestsThisMonth < limit;
}

// ==========================================
// VALUATION API - Enterprise Car Valuation
// ==========================================

/**
 * GLOUBUL Valuation API
 * POST /api/b2b/v1/valuate
 *
 * Advanced AI-powered car valuation for insurance companies, banks, and dealers
 * Uses Vertex AI model trained on Bulgarian market data
 */
export const b2bValuationAPI = onCall({
  cors: true,
  region: 'europe-west1'
}, async (request) => {
  // Check authentication
  if (!request.auth) {
    throw new Error('Authentication required for GLOUBUL Valuation API');
  }

  const userId = request.auth.uid;
  const subscription = await getB2BSubscriptionTier(userId);

  if (!subscription.hasAccess) {
    throw new Error('Active GLOUBUL B2B subscription required');
  }

  // Check API limits
  if (!checkAPILimits(subscription.tier, subscription.usage, 'valuation')) {
    throw new Error('Monthly API limit exceeded. Upgrade your subscription.');
  }

  const {
    vin,
    make,
    model,
    year,
    mileage,
    condition,
    fuelType,
    transmission,
    engineSize,
    power,
    location,
    features,
    purpose // 'insurance_claim', 'loan_valuation', 'dealer_inventory', 'market_analysis'
  } = request.data;

  try {
    // Track API usage
    await trackAPIUsage(userId, 'valuation');

    // Simple valuation algorithm (in production, this would call Vertex AI)
    // For now, we'll use BigQuery data for market-based valuation
    let query = `
      SELECT
        AVG(price) as avgPrice,
        COUNT(*) as sampleSize,
        STDDEV(price) as priceStdDev,
        PERCENTILE_CONT(price, 0.5) OVER() as medianPrice
      FROM \`globul-cars.globul_cars_analytics.cars\`
      WHERE price > 0
        AND make = @make
        AND model = @model
        AND year BETWEEN @year - 2 AND @year + 2
        AND condition = @condition
    `;

    const params: any = {
      make,
      model,
      year: parseInt(year),
      condition
    };

    if (location) {
      query += ' AND location = @location';
      params.location = location;
    }

    const options = {
      query: query,
      params: params,
    };

    const [rows] = await bigquery.query(options);

    if (!rows[0]) {
      throw new Error('Insufficient market data for valuation');
    }

    const marketData = rows[0];
    const basePrice = marketData.avgPrice;

    // Apply adjustments based on car specifications
    let adjustedPrice = basePrice;

    // Mileage adjustment (cars with lower mileage are worth more)
    if (mileage) {
      const mileageAdjustment = Math.max(0, (200000 - mileage) / 200000); // Max 200k km
      adjustedPrice *= (0.8 + 0.4 * mileageAdjustment); // 80%-120% of base price
    }

    // Year adjustment
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    const depreciationRate = 0.85; // 15% annual depreciation
    adjustedPrice *= Math.pow(depreciationRate, age);

    // Condition adjustment
    const conditionMultipliers = {
      'excellent': 1.1,
      'very_good': 1.0,
      'good': 0.9,
      'fair': 0.75,
      'poor': 0.6
    };
    adjustedPrice *= conditionMultipliers[condition as keyof typeof conditionMultipliers] || 1.0;

    // Fuel type adjustment (diesel typically worth more in Bulgaria)
    if (fuelType === 'diesel') {
      adjustedPrice *= 1.05;
    }

    // Engine size adjustment
    if (engineSize) {
      if (engineSize > 3.0) adjustedPrice *= 1.1; // Large engines
      else if (engineSize < 1.2) adjustedPrice *= 0.95; // Small engines
    }

    // Calculate confidence based on sample size
    const confidence = Math.min(95, Math.max(10, marketData.sampleSize * 2));

    // Calculate price range
    const priceRange = {
      min: Math.round(adjustedPrice * 0.85),
      max: Math.round(adjustedPrice * 1.15)
    };

    // Market comparison
    const marketComparison = {
      averagePrice: Math.round(marketData.avgPrice),
      percentile: Math.round((adjustedPrice / marketData.medianPrice) * 100),
      sampleSize: marketData.sampleSize,
      marketVolatility: Math.round((marketData.priceStdDev / marketData.avgPrice) * 100)
    };

    // Valuation factors
    const factors = {
      positive: [],
      negative: []
    };

    if (mileage && mileage < 50000) factors.positive.push('Low mileage');
    if (condition === 'excellent') factors.positive.push('Excellent condition');
    if (age < 3) factors.positive.push('Recent model year');
    if (fuelType === 'diesel') factors.positive.push('Fuel efficient (diesel)');

    if (mileage && mileage > 150000) factors.negative.push('High mileage');
    if (age > 10) factors.negative.push('Older vehicle');
    if (condition === 'poor') factors.negative.push('Poor condition');

    const valuation = {
      vin: vin || null,
      estimatedValue: Math.round(adjustedPrice),
      currency: 'EUR',
      confidence: confidence,
      priceRange: priceRange,
      marketComparison: marketComparison,
      factors: factors,
      valuationDate: new Date().toISOString(),
      purpose: purpose || 'general',
      tier: subscription.tier,
      apiVersion: 'v1.0',
      provider: 'GLOUBUL Business API Suite'
    };

    logger.info(`Valuation completed for ${make} ${model} ${year}`, {
      userId,
      vin,
      estimatedValue: valuation.estimatedValue,
      confidence: valuation.confidence
    });

    return valuation;

  } catch (error) {
    logger.error('Error in GLOUBUL Valuation API:', error);
    throw new Error(`Valuation failed: ${error.message}`);
  }
});

// ==========================================
// MARKET INSIGHTS API - Advanced Analytics
// ==========================================

/**
 * GLOUBUL Market Insights API
 * GET /api/b2b/v1/market-insights
 *
 * Real-time market analytics for dealers, importers, and financial institutions
 */
export const b2bMarketInsightsAPI = onCall({
  cors: true,
  region: 'europe-west1'
}, async (request) => {
  if (!request.auth) {
    throw new Error('Authentication required for GLOUBUL Market Insights API');
  }

  const userId = request.auth.uid;
  const subscription = await getB2BSubscriptionTier(userId);

  if (!subscription.hasAccess) {
    throw new Error('Active GLOUBUL B2B subscription required');
  }

  // Only Premium and Enterprise tiers can access market insights
  if (!['premium', 'enterprise'].includes(subscription.tier)) {
    throw new Error('Premium or Enterprise subscription required for Market Insights');
  }

  // Check API limits
  if (!checkAPILimits(subscription.tier, subscription.usage, 'market-insights')) {
    throw new Error('Monthly API limit exceeded. Upgrade your subscription.');
  }

  const {
    region, // 'sofia', 'plovdiv', 'varna', 'burgas', 'all'
    category, // 'luxury', 'economy', 'suv', 'sedan', 'hatchback'
    timeframe, // '7d', '30d', '90d', '1y'
    metrics // array of metrics to include
  } = request.data;

  try {
    // Track API usage
    await trackAPIUsage(userId, 'market-insights');

    // Build dynamic query based on parameters
    let whereClause = 'WHERE price > 0';
    const params: any = {};

    if (region && region !== 'all') {
      whereClause += ' AND location = @region';
      params.region = region;
    }

    if (category) {
      // Map categories to price ranges or specific criteria
      const categoryFilters = {
        luxury: 'price > 30000',
        economy: 'price BETWEEN 5000 AND 15000',
        suv: "category = 'SUV'",
        sedan: "category = 'Sedan'",
        hatchback: "category = 'Hatchback'"
      };

      if (categoryFilters[category as keyof typeof categoryFilters]) {
        whereClause += ` AND ${categoryFilters[category as keyof typeof categoryFilters]}`;
      }
    }

    // Time filter
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365;
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    whereClause += ' AND created_at >= @dateThreshold';
    params.dateThreshold = dateThreshold.toISOString().split('T')[0];

    // Main market insights query
    const insightsQuery = `
      SELECT
        COUNT(*) as totalListings,
        AVG(price) as averagePrice,
        MIN(price) as minPrice,
        MAX(price) as maxPrice,
        STDDEV(price) as priceVolatility,
        COUNT(DISTINCT make) as uniqueMakes,
        COUNT(DISTINCT model) as uniqueModels
      FROM \`globul-cars.globul_cars_analytics.cars\`
      ${whereClause}
    `;

    // Popular makes query
    const popularMakesQuery = `
      SELECT
        make,
        COUNT(*) as count,
        AVG(price) as avgPrice,
        MIN(price) as minPrice,
        MAX(price) as maxPrice
      FROM \`globul-cars.globul_cars_analytics.cars\`
      ${whereClause}
      GROUP BY make
      ORDER BY count DESC
      LIMIT 10
    `;

    // Price trends query
    const trendsQuery = `
      SELECT
        DATE(created_at) as date,
        AVG(price) as avgPrice,
        COUNT(*) as dailyListings
      FROM \`globul-cars.globul_cars_analytics.cars\`
      ${whereClause}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `;

    // Location analysis
    const locationQuery = `
      SELECT
        location,
        COUNT(*) as count,
        AVG(price) as avgPrice
      FROM \`globul-cars.globul_cars_analytics.cars\`
      ${whereClause}
      GROUP BY location
      ORDER BY count DESC
      LIMIT 10
    `;

    // Execute all queries in parallel
    const [insightsResult, makesResult, trendsResult, locationResult] = await Promise.all([
      bigquery.query({ query: insightsQuery, params }),
      bigquery.query({ query: popularMakesQuery, params }),
      bigquery.query({ query: trendsQuery, params }),
      bigquery.query({ query: locationQuery, params })
    ]);

    const insights = insightsResult[0][0];
    const popularMakes = makesResult[0];
    const priceTrends = trendsResult[0];
    const locationStats = locationResult[0];

    // Calculate market health indicators
    const marketHealth = {
      growth: calculateGrowthRate(priceTrends),
      volatility: (insights.priceVolatility / insights.averagePrice) * 100,
      liquidity: insights.totalListings / 30, // listings per day
      diversity: insights.uniqueMakes / insights.uniqueModels
    };

    // Generate insights and recommendations
    const recommendations = generateMarketRecommendations(insights, marketHealth, category);

    const marketInsights = {
      summary: {
        totalListings: insights.totalListings,
        averagePrice: Math.round(insights.averagePrice),
        priceRange: {
          min: Math.round(insights.minPrice),
          max: Math.round(insights.maxPrice)
        },
        marketVolatility: Math.round(marketHealth.volatility),
        timeFrame: timeframe,
        region: region || 'all',
        category: category || 'all'
      },
      popularMakes: popularMakes.map((make: any) => ({
        make: make.make,
        count: make.count,
        averagePrice: Math.round(make.avgPrice),
        priceRange: {
          min: Math.round(make.minPrice),
          max: Math.round(make.maxPrice)
        }
      })),
      priceTrends: priceTrends.map((trend: any) => ({
        date: trend.date.value,
        averagePrice: Math.round(trend.avgPrice),
        dailyListings: trend.dailyListings
      })),
      locationStats: locationStats.map((loc: any) => ({
        location: loc.location,
        count: loc.count,
        averagePrice: Math.round(loc.avgPrice)
      })),
      marketHealth: {
        growthRate: Math.round(marketHealth.growth * 100) / 100,
        volatilityPercent: Math.round(marketHealth.volatility * 100) / 100,
        dailyLiquidity: Math.round(marketHealth.liquidity),
        brandDiversity: Math.round(marketHealth.diversity * 100) / 100
      },
      recommendations: recommendations,
      generatedAt: new Date().toISOString(),
      tier: subscription.tier,
      apiVersion: 'v1.0',
      provider: 'GLOUBUL Business API Suite'
    };

    logger.info(`Market insights generated for ${region || 'all regions'}`, {
      userId,
      totalListings: insights.totalListings,
      tier: subscription.tier
    });

    return marketInsights;

  } catch (error) {
    logger.error('Error in GLOUBUL Market Insights API:', error);
    throw new Error(`Market insights failed: ${error.message}`);
  }
});

// Helper functions
function calculateGrowthRate(trends: any[]): number {
  if (trends.length < 2) return 0;

  const recent = trends.slice(0, 7); // Last 7 days
  const previous = trends.slice(7, 14); // Previous 7 days

  const recentAvg = recent.reduce((sum, t) => sum + t.avgPrice, 0) / recent.length;
  const previousAvg = previous.reduce((sum, t) => sum + t.avgPrice, 0) / previous.length;

  return ((recentAvg - previousAvg) / previousAvg) * 100;
}

function generateMarketRecommendations(insights: any, health: any, category?: string): string[] {
  const recommendations = [];

  if (health.growth > 5) {
    recommendations.push('Market is growing rapidly - consider increasing inventory');
  } else if (health.growth < -5) {
    recommendations.push('Market is declining - focus on quick sales and discounts');
  }

  if (health.volatility > 20) {
    recommendations.push('High market volatility - implement dynamic pricing strategies');
  }

  if (health.liquidity < 10) {
    recommendations.push('Low market liquidity - focus on marketing to attract more sellers');
  }

  if (category === 'luxury' && insights.averagePrice > 40000) {
    recommendations.push('Luxury segment is strong - prioritize premium vehicle acquisitions');
  }

  return recommendations;
}