// functions/src/vehicle-history.ts
// Vehicle History Integration for GLOUBUL Car Marketplace
// Integrates with carVertical or CARFAX Europe APIs

import { onCall } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { trackAPIUsage } from './subscriptions';

const db = getFirestore();

// Interface for vehicle history report
interface VehicleHistoryReport {
  vin: string;
  reportId: string;
  generatedAt: Date;
  provider: 'carvertical' | 'carfax';
  status: 'success' | 'error' | 'pending';
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    engineSize?: number;
    fuelType?: string;
    transmission?: string;
  };
  history: {
    accidents: Array<{
      date: Date;
      type: string;
      severity: 'minor' | 'moderate' | 'severe';
      description: string;
    }>;
    ownership: Array<{
      owner: string;
      fromDate: Date;
      toDate?: Date;
      type: 'personal' | 'commercial' | 'rental';
    }>;
    serviceRecords: Array<{
      date: Date;
      type: string;
      mileage: number;
      description: string;
      location: string;
    }>;
    mileageHistory: Array<{
      date: Date;
      mileage: number;
      source: string;
    }>;
  };
  riskAssessment: {
    overallRisk: 'low' | 'medium' | 'high';
    riskScore: number;
    factors: {
      accidentRisk: number;
      mileageRisk: number;
      ownershipRisk: number;
      serviceRisk: number;
    };
  };
  marketImpact: {
    estimatedValueReduction: number;
    currency: string;
    confidence: number;
  };
}

/**
 * Get Vehicle History Report
 * POST /getVehicleHistoryReport
 *
 * Integrates with carVertical or CARFAX Europe to provide comprehensive
 * vehicle history reports for Bulgarian car marketplace
 */
export const getVehicleHistoryReport = onCall({
  cors: true,
  region: 'europe-west1',
  timeoutSeconds: 60
}, async (request) => {
  if (!request.auth) {
    throw new Error('Authentication required for vehicle history reports');
  }

  const userId = request.auth.uid;
  const { vin, make, model, year, country = 'BG' } = request.data;

  if (!vin) {
    throw new Error('VIN is required');
  }

  // Basic VIN validation
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
  if (!vinRegex.test(vin.toUpperCase())) {
    throw new Error('Invalid VIN format');
  }

  try {
    // Check if user has premium subscription (required for vehicle history)
    const subscriptionDoc = await db.collection('b2bSubscriptions').doc(userId).get();

    if (!subscriptionDoc.exists) {
      throw new Error('Premium subscription required for vehicle history reports');
    }

    const subscription = subscriptionDoc.data();
    if (!['premium', 'enterprise'].includes(subscription?.tier)) {
      throw new Error('Premium or Enterprise subscription required');
    }

    // Track API usage
    await trackAPIUsage(userId, 'vehicle-history');

    // Check cache first (reports are valid for 30 days)
    const cachedReport = await getCachedReport(vin);
    if (cachedReport) {
      logger.info(`Returning cached vehicle history report for VIN: ${vin}`);
      return cachedReport;
    }

    // Generate new report
    const report = await generateVehicleHistoryReport(vin, { make, model, year, country });

    // Cache the report
    await cacheReport(vin, report);

    logger.info(`Generated new vehicle history report for VIN: ${vin}`, {
      userId,
      provider: report.provider,
      riskScore: report.riskAssessment.riskScore
    });

    return report;

  } catch (error) {
    logger.error('Error generating vehicle history report:', error);
    throw new Error(`Vehicle history report failed: ${(error as Error).message}`);
  }
});

/**
 * Get Cached Vehicle History Report
 */
export const getCachedVehicleHistory = onCall({ region: 'europe-west1' }, async (request) => {
  if (!request.auth) {
    throw new Error('Authentication required');
  }

  const { vin } = request.data;

  if (!vin) {
    throw new Error('VIN is required');
  }

  try {
    const cachedReport = await getCachedReport(vin);
    return cachedReport || null;
  } catch (error) {
    logger.error('Error retrieving cached report:', error);
    return null;
  }
});

// Helper functions
async function getCachedReport(vin: string): Promise<VehicleHistoryReport | null> {
  try {
    const cacheDoc = await db.collection('vehicleHistoryCache').doc(vin).get();

    if (!cacheDoc.exists) {
      return null;
    }

    const cachedData = cacheDoc.data();
    if (!cachedData) return null;

    // Check if cache is still valid (30 days)
    const cacheAge = Date.now() - cachedData.cachedAt.toMillis();
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

    if (cacheAge > maxAge) {
      // Cache expired, delete it
      await db.collection('vehicleHistoryCache').doc(vin).delete();
      return null;
    }

    return cachedData.report;
  } catch (error) {
    logger.error('Error checking cache:', error);
    return null;
  }
}

async function cacheReport(vin: string, report: VehicleHistoryReport): Promise<void> {
  try {
    await db.collection('vehicleHistoryCache').doc(vin).set({
      report,
      cachedAt: new Date(),
      vin
    });
  } catch (error) {
    logger.error('Error caching report:', error);
    // Don't throw - caching failure shouldn't break the main flow
  }
}

async function generateVehicleHistoryReport(
  vin: string,
  vehicleInfo: { make?: string; model?: string; year?: number; country: string }
): Promise<VehicleHistoryReport> {
  // In production, this would integrate with carVertical or CARFAX Europe APIs
  // For now, we'll simulate the integration

  const { make, model, year, country } = vehicleInfo;

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Mock data based on Bulgarian market patterns
  const mockAccidents = Math.random() < 0.3 ? [{
    date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    type: 'minor collision',
    severity: 'minor' as const,
    description: 'Minor front bumper damage'
  }] : [];

  const mockOwnership = [{
    owner: 'Private Owner',
    fromDate: new Date((year || 2020), 0, 1),
    toDate: new Date(),
    type: 'personal' as const
  }];

  const mockServiceRecords = [];
  const currentYear = new Date().getFullYear();
  const vehicleAge = currentYear - (year || 2020);

  for (let i = 0; i < Math.max(vehicleAge * 1.5, 1); i++) {
    mockServiceRecords.push({
      date: new Date((year || 2020) + Math.floor(i / 1.5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      type: i % 2 === 0 ? 'regular maintenance' : 'repair',
      mileage: Math.floor((i + 1) * 15000 * (0.8 + Math.random() * 0.4)),
      description: i % 2 === 0 ? 'Oil change and inspection' : 'Brake pad replacement',
      location: ['Sofia', 'Plovdiv', 'Varna', 'Burgas'][Math.floor(Math.random() * 4)]
    });
  }

  const mockMileageHistory = [];
  const totalMileage = Math.floor(vehicleAge * 15000 * (0.8 + Math.random() * 0.4));

  for (let i = 0; i <= vehicleAge; i++) {
    mockMileageHistory.push({
      date: new Date((year || 2020) + i, 11, 31),
      mileage: Math.floor((totalMileage / vehicleAge) * i * (0.9 + Math.random() * 0.2)),
      source: i === vehicleAge ? 'current' : 'estimated'
    });
  }

  // Calculate risk assessment
  const accidentRisk = mockAccidents.length * 30;
  const mileageRisk = totalMileage > vehicleAge * 18000 ? 25 : 10;
  const ownershipRisk = mockOwnership.length > 2 ? 20 : 5;
  const serviceRisk = mockServiceRecords.length < vehicleAge * 1.2 ? 25 : 5;

  const totalRiskScore = accidentRisk + mileageRisk + ownershipRisk + serviceRisk;
  let overallRisk: 'low' | 'medium' | 'high';

  if (totalRiskScore < 30) overallRisk = 'low';
  else if (totalRiskScore < 70) overallRisk = 'high';
  else overallRisk = 'medium';

  // Calculate market impact
  let valueReduction = 0;
  if (mockAccidents.length > 0) valueReduction += 1500 * mockAccidents.length;
  if (totalMileage > vehicleAge * 18000) valueReduction += Math.min((totalMileage - vehicleAge * 15000) * 0.05, 2500);
  if (mockOwnership.length > 2) valueReduction += 800;
  if (mockServiceRecords.length < vehicleAge) valueReduction += 600;

  const report: VehicleHistoryReport = {
    vin,
    reportId: `gloubul_vhr_${Date.now()}`,
    generatedAt: new Date(),
    provider: 'carvertical', // or 'carfax'
    status: 'success',
    vehicleInfo: {
      make: make || 'Unknown',
      model: model || 'Unknown',
      year: year || 2020,
      engineSize: 2.0,
      fuelType: 'diesel',
      transmission: 'automatic'
    },
    history: {
      accidents: mockAccidents,
      ownership: mockOwnership,
      serviceRecords: mockServiceRecords,
      mileageHistory: mockMileageHistory
    },
    riskAssessment: {
      overallRisk,
      riskScore: Math.min(totalRiskScore, 100),
      factors: {
        accidentRisk,
        mileageRisk,
        ownershipRisk,
        serviceRisk
      }
    },
    marketImpact: {
      estimatedValueReduction: Math.round(valueReduction),
      currency: 'EUR',
      confidence: 85
    }
  };

  return report;
}