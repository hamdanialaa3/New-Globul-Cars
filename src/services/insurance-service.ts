// src/services/insurance-service.ts
// Insurance Integration for Bulgarian Car Marketplace
// Connects with Bulgarian insurance companies for quotes and claims

import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase-config';

export interface InsuranceQuote {
  id: string;
  customerId: string;
  vehicleId: string;
  coverageType: 'basic' | 'comprehensive' | 'premium';
  provider: 'bulstrad' | 'uniqa' | 'allianz' | 'generali' | 'lev-ins';
  premium: number;
  currency: 'EUR';
  coverage: InsuranceCoverage;
  deductibles: { [key: string]: number };
  validUntil: Date;
  createdAt: Date;
}

export interface InsuranceCoverage {
  liability: {
    bodilyInjury: number;
    propertyDamage: number;
    uninsuredMotorist: number;
  };
  collision: {
    covered: boolean;
    deductible: number;
  };
  comprehensive: {
    covered: boolean;
    deductible: number;
    includes: string[];
  };
  roadsideAssistance: boolean;
  rentalReimbursement: boolean;
  newCarReplacement: boolean;
  gapInsurance: boolean;
}

export interface InsurancePolicy {
  id: string;
  policyNumber: string;
  customerId: string;
  vehicleId: string;
  provider: string;
  coverageType: string;
  premium: number;
  paymentFrequency: 'monthly' | 'quarterly' | 'annual';
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  coverage: InsuranceCoverage;
  documents: string[];
  claims: InsuranceClaim[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InsuranceClaim {
  id: string;
  policyId: string;
  claimNumber: string;
  incidentDate: Date;
  reportDate: Date;
  type: 'collision' | 'theft' | 'vandalism' | 'weather' | 'fire' | 'glass' | 'other';
  description: string;
  location: string;
  estimatedDamage: number;
  status: 'submitted' | 'under_review' | 'approved' | 'denied' | 'settled';
  payoutAmount?: number;
  adjusterNotes: string;
  photos: string[];
  repairShop?: string;
  settlementDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BulgarianInsuranceProvider {
  id: string;
  name: string;
  bulgarianName: string;
  logo: string;
  website: string;
  phone: string;
  coverage: string[];
  rating: number;
  reviewCount: number;
  specialties: string[];
  responseTime: number; // hours
  claimSettlementRatio: number;
}

class InsuranceService {
  private static instance: InsuranceService;

  static getInstance(): InsuranceService {
    if (!InsuranceService.instance) {
      InsuranceService.instance = new InsuranceService();
    }
    return InsuranceService.instance;
  }

  /**
   * Get insurance quotes from multiple Bulgarian providers
   */
  async getInsuranceQuotes(
    vehicleId: string,
    customerId: string,
    coverageType: 'basic' | 'comprehensive' | 'premium' = 'comprehensive'
  ): Promise<InsuranceQuote[]> {
    try {
      const getQuotes = httpsCallable(functions, 'getInsuranceQuotes');

      const result = await getQuotes({
        vehicleId,
        customerId,
        coverageType
      });

      return result.data as InsuranceQuote[];
    } catch (error: any) {
      console.error('Error getting insurance quotes:', error);
      throw new Error(`Failed to get insurance quotes: ${error.message}`);
    }
  }

  /**
   * Purchase insurance policy
   */
  async purchaseInsurancePolicy(
    quoteId: string,
    paymentMethod: 'card' | 'bank_transfer' | 'paypal',
    paymentFrequency: 'monthly' | 'quarterly' | 'annual' = 'annual'
  ): Promise<string> {
    try {
      const purchasePolicy = httpsCallable(functions, 'purchaseInsurancePolicy');

      const result = await purchasePolicy({
        quoteId,
        paymentMethod,
        paymentFrequency
      });

      return result.data as string; // Returns policy ID
    } catch (error: any) {
      console.error('Error purchasing insurance policy:', error);
      throw new Error(`Failed to purchase policy: ${error.message}`);
    }
  }

  /**
   * Get customer's insurance policies
   */
  async getCustomerPolicies(customerId: string): Promise<InsurancePolicy[]> {
    try {
      const getPolicies = httpsCallable(functions, 'getCustomerPolicies');

      const result = await getPolicies({ customerId });
      return result.data as InsurancePolicy[];
    } catch (error: any) {
      console.error('Error getting customer policies:', error);
      throw new Error(`Failed to get policies: ${error.message}`);
    }
  }

  /**
   * File an insurance claim
   */
  async fileInsuranceClaim(
    policyId: string,
    claim: Omit<InsuranceClaim, 'id' | 'claimNumber' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<string> {
    try {
      const fileClaim = httpsCallable(functions, 'fileInsuranceClaim');

      const result = await fileClaim({
        policyId,
        claim
      });

      return result.data as string; // Returns claim ID
    } catch (error: any) {
      console.error('Error filing insurance claim:', error);
      throw new Error(`Failed to file claim: ${error.message}`);
    }
  }

  /**
   * Get claim details and status
   */
  async getClaimDetails(claimId: string): Promise<InsuranceClaim> {
    try {
      const getClaim = httpsCallable(functions, 'getClaimDetails');

      const result = await getClaim({ claimId });
      return result.data as InsuranceClaim;
    } catch (error: any) {
      console.error('Error getting claim details:', error);
      throw new Error(`Failed to get claim details: ${error.message}`);
    }
  }

  /**
   * Get Bulgarian insurance providers
   */
  async getInsuranceProviders(): Promise<BulgarianInsuranceProvider[]> {
    try {
      const getProviders = httpsCallable(functions, 'getInsuranceProviders');

      const result = await getProviders();
      return result.data as BulgarianInsuranceProvider[];
    } catch (error: any) {
      console.error('Error getting insurance providers:', error);
      throw new Error(`Failed to get providers: ${error.message}`);
    }
  }

  /**
   * Calculate insurance premium based on vehicle and driver data
   */
  calculatePremiumEstimate(
    vehicleValue: number,
    driverAge: number,
    drivingExperience: number,
    location: string,
    coverageType: string,
    hasAccidents: boolean = false
  ): {
    basePremium: number;
    riskFactors: { [key: string]: number };
    finalPremium: number;
    currency: string;
  } {
    const basePremium = vehicleValue * 0.03; // 3% of vehicle value

    const riskFactors: { [key: string]: number } = {
      age: driverAge < 25 ? 1.5 : driverAge > 60 ? 1.2 : 1.0,
      experience: drivingExperience < 3 ? 1.4 : drivingExperience < 10 ? 1.1 : 1.0,
      location: location.includes('София') ? 1.3 : 1.0, // Higher risk in capital
      accidents: hasAccidents ? 1.5 : 1.0,
      coverage: coverageType === 'premium' ? 1.8 : coverageType === 'comprehensive' ? 1.3 : 1.0
    };

    const riskMultiplier = Object.values(riskFactors).reduce((a, b) => a * b, 1);
    const finalPremium = Math.round(basePremium * riskMultiplier);

    return {
      basePremium: Math.round(basePremium),
      riskFactors,
      finalPremium,
      currency: 'EUR'
    };
  }

  /**
   * Format insurance quote for display
   */
  formatQuoteForDisplay(quote: InsuranceQuote): {
    id: string;
    provider: string;
    coverageType: string;
    premium: string;
    keyBenefits: string[];
    deductibles: string[];
    validUntil: string;
  } {
    const keyBenefits = [];
    if (quote.coverage.collision.covered) keyBenefits.push('Collision coverage');
    if (quote.coverage.comprehensive.covered) keyBenefits.push('Comprehensive coverage');
    if (quote.coverage.roadsideAssistance) keyBenefits.push('Roadside assistance');
    if (quote.coverage.rentalReimbursement) keyBenefits.push('Rental reimbursement');

    const deductibles = Object.entries(quote.deductibles).map(([type, amount]) =>
      `${type}: €${amount}`
    );

    return {
      id: quote.id,
      provider: quote.provider.toUpperCase(),
      coverageType: quote.coverageType.replace('_', ' ').toUpperCase(),
      premium: `€${quote.premium}`,
      keyBenefits,
      deductibles,
      validUntil: quote.validUntil.toLocaleDateString('bg-BG')
    };
  }

  /**
   * Get Bulgarian insurance market statistics
   */
  async getInsuranceMarketStats(): Promise<{
    totalPolicies: number;
    avgPremium: number;
    claimSettlementRate: number;
    popularProviders: string[];
    coverageTypes: { [key: string]: number };
    monthlyGrowth: number;
  }> {
    try {
      const getStats = httpsCallable(functions, 'getInsuranceMarketStats');

      const result = await getStats();
      return result.data as any;
    } catch (error: any) {
      console.error('Error getting insurance market stats:', error);
      throw new Error(`Failed to get market stats: ${error.message}`);
    }
  }
}

// Firebase Functions for Insurance Integration
export const getInsuranceQuotes = async (data: {
  vehicleId: string;
  customerId: string;
  coverageType: string;
}) => {
  // Mock implementation - in production, integrate with Bulgarian insurance APIs
  const { vehicleId, customerId, coverageType } = data;

  const providers = ['bulstrad', 'uniqa', 'allianz', 'generali', 'lev-ins'];
  const quotes: InsuranceQuote[] = [];

  providers.forEach((provider) => {
    const basePremium = 300 + Math.random() * 400; // €300-700
    const premium = Math.round(basePremium * (0.8 + Math.random() * 0.4)); // ±20% variation

    quotes.push({
      id: `quote_${provider}_${Date.now()}`,
      customerId,
      vehicleId,
      coverageType: coverageType as any,
      provider: provider as any,
      premium,
      currency: 'EUR',
      coverage: {
        liability: {
          bodilyInjury: 1000000,
          propertyDamage: 500000,
          uninsuredMotorist: 100000
        },
        collision: {
          covered: coverageType !== 'basic',
          deductible: coverageType === 'premium' ? 100 : 200
        },
        comprehensive: {
          covered: coverageType === 'comprehensive' || coverageType === 'premium',
          deductible: 150,
          includes: ['theft', 'vandalism', 'weather damage']
        },
        roadsideAssistance: coverageType !== 'basic',
        rentalReimbursement: coverageType === 'premium',
        newCarReplacement: coverageType === 'premium',
        gapInsurance: false
      },
      deductibles: {
        collision: coverageType === 'premium' ? 100 : 200,
        comprehensive: 150,
        glass: 50
      },
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      createdAt: new Date()
    });
  });

  // Sort by premium (lowest first)
  return quotes.sort((a, b) => a.premium - b.premium);
};

export const purchaseInsurancePolicy = async () => {
  // Mock implementation - in production, process payment and create policy
  const policyId = `policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate payment processing

  return policyId;
};

export const getCustomerPolicies = async (data: { customerId: string }) => {
  // Mock implementation - return customer's policies
  const mockPolicies: InsurancePolicy[] = [
    {
      id: 'policy_001',
      policyNumber: 'BG-INS-2024-001234',
      customerId: data.customerId,
      vehicleId: 'vehicle_123',
      provider: 'bulstrad',
      coverageType: 'comprehensive',
      premium: 450,
      paymentFrequency: 'annual',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000), // 11 months from now
      status: 'active',
      coverage: {
        liability: {
          bodilyInjury: 1000000,
          propertyDamage: 500000,
          uninsuredMotorist: 100000
        },
        collision: { covered: true, deductible: 200 },
        comprehensive: {
          covered: true,
          deductible: 150,
          includes: ['theft', 'vandalism', 'weather damage']
        },
        roadsideAssistance: true,
        rentalReimbursement: false,
        newCarReplacement: false,
        gapInsurance: false
      },
      documents: ['policy.pdf', 'terms.pdf'],
      claims: [],
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }
  ];

  return mockPolicies;
};

export const fileInsuranceClaim = async () => {
  // Mock implementation - create claim record
  const claimId = `claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  await new Promise(resolve => setTimeout(resolve, 1000));

  return claimId;
};

export const getClaimDetails = async (data: { claimId: string }) => {
  // Mock implementation - return claim details
  const mockClaim: InsuranceClaim = {
    id: data.claimId,
    policyId: 'policy_001',
    claimNumber: `CL-${data.claimId.slice(-8).toUpperCase()}`,
    incidentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    reportDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    type: 'collision',
    description: 'Rear-end collision at intersection',
    location: 'ул. Витоша, София',
    estimatedDamage: 2500,
    status: 'under_review',
    adjusterNotes: 'Photos and police report received. Awaiting repair estimate.',
    photos: [
      'https://storage.gloubul.bg/claims/' + data.claimId + '/damage1.jpg',
      'https://storage.gloubul.bg/claims/' + data.claimId + '/damage2.jpg'
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  };

  return mockClaim;
};

export const getInsuranceProviders = async () => {
  // Mock Bulgarian insurance providers
  const providers: BulgarianInsuranceProvider[] = [
    {
      id: 'bulstrad',
      name: 'Bulstrad',
      bulgarianName: 'Булстрад',
      logo: 'https://bulstrad.bg/logo.png',
      website: 'https://bulstrad.bg',
      phone: '+359 2 811 11 11',
      coverage: ['liability', 'collision', 'comprehensive'],
      rating: 4.2,
      reviewCount: 1250,
      specialties: ['commercial vehicles', 'fleet insurance'],
      responseTime: 24,
      claimSettlementRatio: 0.92
    },
    {
      id: 'uniqa',
      name: 'Uniqa',
      bulgarianName: 'Уника',
      logo: 'https://uniqa.bg/logo.png',
      website: 'https://uniqa.bg',
      phone: '+359 2 489 49 49',
      coverage: ['liability', 'collision', 'comprehensive', 'premium'],
      rating: 4.5,
      reviewCount: 2100,
      specialties: ['personal vehicles', 'young drivers'],
      responseTime: 12,
      claimSettlementRatio: 0.95
    },
    {
      id: 'allianz',
      name: 'Allianz',
      bulgarianName: 'Алианц',
      logo: 'https://allianz.bg/logo.png',
      website: 'https://allianz.bg',
      phone: '+359 700 10 800',
      coverage: ['liability', 'collision', 'comprehensive', 'premium'],
      rating: 4.3,
      reviewCount: 1800,
      specialties: ['high-value vehicles', 'classic cars'],
      responseTime: 18,
      claimSettlementRatio: 0.94
    },
    {
      id: 'generali',
      name: 'Generali',
      bulgarianName: 'Дженерали',
      logo: 'https://generali.bg/logo.png',
      website: 'https://generali.bg',
      phone: '+359 700 12 012',
      coverage: ['liability', 'collision', 'comprehensive'],
      rating: 4.1,
      reviewCount: 950,
      specialties: ['family insurance', 'multi-vehicle'],
      responseTime: 36,
      claimSettlementRatio: 0.89
    },
    {
      id: 'lev-ins',
      name: 'Lev Ins',
      bulgarianName: 'Лев Инс',
      logo: 'https://lev-ins.bg/logo.png',
      website: 'https://lev-ins.bg',
      phone: '+359 2 811 81 81',
      coverage: ['liability', 'collision', 'comprehensive'],
      rating: 4.0,
      reviewCount: 750,
      specialties: ['budget insurance', 'basic coverage'],
      responseTime: 48,
      claimSettlementRatio: 0.87
    }
  ];

  return providers;
};

export const getInsuranceMarketStats = async () => {
  // Mock insurance market statistics
  return {
    totalPolicies: 1250000,
    avgPremium: 385,
    claimSettlementRate: 0.91,
    popularProviders: ['Uniqa', 'Allianz', 'Bulstrad'],
    coverageTypes: {
      basic: 350000,
      comprehensive: 650000,
      premium: 250000
    },
    monthlyGrowth: 8.5
  };
};

export const insuranceService = InsuranceService.getInstance();