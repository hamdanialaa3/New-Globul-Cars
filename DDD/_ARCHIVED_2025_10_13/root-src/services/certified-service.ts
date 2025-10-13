// src/services/certified-service.ts
// Gloubul Certified - Vehicle Inspection and Certification Service
// Comprehensive vehicle assessment and certification system

import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase-config';

export interface VehicleInspection {
  id: string;
  vehicleId: string;
  customerId: string;
  inspectorId: string;
  inspectionType: 'basic' | 'comprehensive' | 'pre_purchase' | 'export' | 'insurance';
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed';
  scheduledDate: Date;
  completedDate?: Date;
  location: {
    address: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  results: InspectionResults;
  certificate?: VehicleCertificate;
  photos: string[];
  notes: string;
  cost: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
}

export interface InspectionResults {
  overallScore: number; // 0-100
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  categories: {
    exterior: InspectionCategory;
    interior: InspectionCategory;
    engine: InspectionCategory;
    transmission: InspectionCategory;
    brakes: InspectionCategory;
    suspension: InspectionCategory;
    electrical: InspectionCategory;
    tires: InspectionCategory;
    safety: InspectionCategory;
  };
  criticalIssues: CriticalIssue[];
  recommendedRepairs: RecommendedRepair[];
  marketValue: {
    current: number;
    afterRepairs: number;
    currency: 'EUR';
  };
  certificationEligible: boolean;
  expiresAt: Date;
}

export interface InspectionCategory {
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  issues: string[];
  recommendations: string[];
}

export interface CriticalIssue {
  severity: 'critical' | 'major' | 'minor';
  category: string;
  description: string;
  estimatedCost: number;
  safetyConcern: boolean;
}

export interface RecommendedRepair {
  category: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedCost: number;
  estimatedDuration: number; // hours
}

export interface VehicleCertificate {
  id: string;
  certificateNumber: string;
  vehicleId: string;
  inspectionId: string;
  certificationLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  issuedDate: Date;
  expiresDate: Date;
  certifiedBy: string;
  qrCode: string;
  blockchainHash?: string;
  benefits: string[];
  restrictions: string[];
}

export interface CertificationBenefits {
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  warranty: number; // months
  roadsideAssistance: boolean;
  priorityService: boolean;
  financing: boolean;
  tradeInBonus: number; // percentage
  insuranceDiscount: number; // percentage
  resaleValue: number; // percentage increase
}

class CertifiedService {
  private static instance: CertifiedService;

  static getInstance(): CertifiedService {
    if (!CertifiedService.instance) {
      CertifiedService.instance = new CertifiedService();
    }
    return CertifiedService.instance;
  }

  /**
   * Schedule a vehicle inspection
   */
  async scheduleInspection(inspection: Omit<VehicleInspection, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const scheduleInspection = httpsCallable(functions, 'scheduleVehicleInspection');

      const result = await scheduleInspection(inspection);
      return result.data as string; // Returns inspection ID
    } catch (error: any) {
      console.error('Error scheduling inspection:', error);
      throw new Error(`Failed to schedule inspection: ${error.message}`);
    }
  }

  /**
   * Get inspection details
   */
  async getInspectionDetails(inspectionId: string): Promise<VehicleInspection> {
    try {
      const getDetails = httpsCallable(functions, 'getInspectionDetails');

      const result = await getDetails({ inspectionId });
      return result.data as VehicleInspection;
    } catch (error: any) {
      console.error('Error getting inspection details:', error);
      throw new Error(`Failed to get inspection details: ${error.message}`);
    }
  }

  /**
   * Get customer's inspection history
   */
  async getCustomerInspections(customerId: string): Promise<VehicleInspection[]> {
    try {
      const getInspections = httpsCallable(functions, 'getCustomerInspections');

      const result = await getInspections({ customerId });
      return result.data as VehicleInspection[];
    } catch (error: any) {
      console.error('Error getting customer inspections:', error);
      throw new Error(`Failed to get inspections: ${error.message}`);
    }
  }

  /**
   * Get vehicle certificate details
   */
  async getVehicleCertificate(certificateId: string): Promise<VehicleCertificate> {
    try {
      const getCertificate = httpsCallable(functions, 'getVehicleCertificate');

      const result = await getCertificate({ certificateId });
      return result.data as VehicleCertificate;
    } catch (error: any) {
      console.error('Error getting vehicle certificate:', error);
      throw new Error(`Failed to get certificate: ${error.message}`);
    }
  }

  /**
   * Verify certificate authenticity
   */
  async verifyCertificate(certificateNumber: string): Promise<{
    isValid: boolean;
    certificate?: VehicleCertificate;
    message: string;
  }> {
    try {
      const verifyCertificate = httpsCallable(functions, 'verifyCertificate');

      const result = await verifyCertificate({ certificateNumber });
      return result.data as any;
    } catch (error: any) {
      console.error('Error verifying certificate:', error);
      throw new Error(`Failed to verify certificate: ${error.message}`);
    }
  }

  /**
   * Get certification benefits for a level
   */
  getCertificationBenefits(level: 'bronze' | 'silver' | 'gold' | 'platinum'): CertificationBenefits {
    const benefits: { [key: string]: CertificationBenefits } = {
      bronze: {
        level: 'bronze',
        warranty: 6,
        roadsideAssistance: false,
        priorityService: false,
        financing: false,
        tradeInBonus: 2,
        insuranceDiscount: 5,
        resaleValue: 3
      },
      silver: {
        level: 'silver',
        warranty: 12,
        roadsideAssistance: true,
        priorityService: false,
        financing: true,
        tradeInBonus: 5,
        insuranceDiscount: 10,
        resaleValue: 7
      },
      gold: {
        level: 'gold',
        warranty: 24,
        roadsideAssistance: true,
        priorityService: true,
        financing: true,
        tradeInBonus: 8,
        insuranceDiscount: 15,
        resaleValue: 12
      },
      platinum: {
        level: 'platinum',
        warranty: 36,
        roadsideAssistance: true,
        priorityService: true,
        financing: true,
        tradeInBonus: 12,
        insuranceDiscount: 20,
        resaleValue: 18
      }
    };

    return benefits[level];
  }

  /**
   * Calculate inspection cost based on type and vehicle
   */
  calculateInspectionCost(
    inspectionType: string,
    vehicleType: 'passenger' | 'commercial' | 'motorcycle' = 'passenger'
  ): number {
    const baseCosts = {
      basic: { passenger: 50, commercial: 80, motorcycle: 30 },
      comprehensive: { passenger: 150, commercial: 250, motorcycle: 80 },
      pre_purchase: { passenger: 120, commercial: 200, motorcycle: 60 },
      export: { passenger: 200, commercial: 350, motorcycle: 100 },
      insurance: { passenger: 80, commercial: 130, motorcycle: 40 }
    };

    return baseCosts[inspectionType as keyof typeof baseCosts][vehicleType];
  }

  /**
   * Format inspection results for display
   */
  formatInspectionResults(results: InspectionResults): {
    overallScore: string;
    overallGrade: string;
    gradeColor: string;
    categories: Array<{
      name: string;
      score: string;
      grade: string;
      gradeColor: string;
      issueCount: number;
    }>;
    criticalIssues: CriticalIssue[];
    marketValue: string;
    certificationEligible: boolean;
  } {
    const getGradeColor = (grade: string): string => {
      switch (grade) {
        case 'A': return '#10b981'; // green
        case 'B': return '#84cc16'; // light green
        case 'C': return '#f59e0b'; // amber
        case 'D': return '#f97316'; // orange
        case 'F': return '#ef4444'; // red
        default: return '#6b7280'; // gray
      }
    };

    const categoryNames = {
      exterior: 'Exterior',
      interior: 'Interior',
      engine: 'Engine',
      transmission: 'Transmission',
      brakes: 'Brakes',
      suspension: 'Suspension',
      electrical: 'Electrical',
      tires: 'Tires',
      safety: 'Safety'
    };

    return {
      overallScore: `${results.overallScore}/100`,
      overallGrade: results.overallGrade,
      gradeColor: getGradeColor(results.overallGrade),
      categories: Object.entries(results.categories).map(([key, category]) => ({
        name: categoryNames[key as keyof typeof categoryNames],
        score: `${category.score}/100`,
        grade: category.grade,
        gradeColor: getGradeColor(category.grade),
        issueCount: category.issues.length
      })),
      criticalIssues: results.criticalIssues,
      marketValue: `€${results.marketValue.current.toLocaleString()} (After repairs: €${results.marketValue.afterRepairs.toLocaleString()})`,
      certificationEligible: results.certificationEligible
    };
  }

  /**
   * Get Bulgarian certification statistics
   */
  async getCertificationStats(): Promise<{
    totalInspections: number;
    certifiedVehicles: number;
    avgScore: number;
    certificationsByLevel: { [key: string]: number };
    popularInspectionTypes: string[];
    monthlyGrowth: number;
  }> {
    try {
      const getStats = httpsCallable(functions, 'getCertificationStats');

      const result = await getStats();
      return result.data as any;
    } catch (error: any) {
      console.error('Error getting certification stats:', error);
      throw new Error(`Failed to get certification stats: ${error.message}`);
    }
  }
}

// Firebase Functions for Vehicle Certification
export const scheduleVehicleInspection = async () => {
  // Mock implementation - in production, save to Firestore and schedule with inspector
  const inspectionId = `insp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  await new Promise(resolve => setTimeout(resolve, 1000));

  return inspectionId;
};

export const getInspectionDetails = async (data: { inspectionId: string }) => {
  // Mock implementation - return detailed inspection results
  const mockResults: InspectionResults = {
    overallScore: 85,
    overallGrade: 'B',
    categories: {
      exterior: {
        score: 90,
        grade: 'A',
        issues: ['Minor scratches on rear bumper'],
        recommendations: ['Touch up paint on scratches']
      },
      interior: {
        score: 95,
        grade: 'A',
        issues: [],
        recommendations: ['Clean upholstery']
      },
      engine: {
        score: 80,
        grade: 'B',
        issues: ['Oil level slightly low'],
        recommendations: ['Top up engine oil']
      },
      transmission: {
        score: 85,
        grade: 'B',
        issues: [],
        recommendations: ['Check transmission fluid']
      },
      brakes: {
        score: 75,
        grade: 'C',
        issues: ['Rear brake pads worn'],
        recommendations: ['Replace rear brake pads']
      },
      suspension: {
        score: 88,
        grade: 'B',
        issues: [],
        recommendations: ['Check alignment']
      },
      electrical: {
        score: 92,
        grade: 'A',
        issues: [],
        recommendations: []
      },
      tires: {
        score: 70,
        grade: 'C',
        issues: ['Uneven tire wear'],
        recommendations: ['Rotate tires, check alignment']
      },
      safety: {
        score: 95,
        grade: 'A',
        issues: [],
        recommendations: []
      }
    },
    criticalIssues: [
      {
        severity: 'minor',
        category: 'brakes',
        description: 'Rear brake pads worn',
        estimatedCost: 120,
        safetyConcern: true
      }
    ],
    recommendedRepairs: [
      {
        category: 'brakes',
        description: 'Replace rear brake pads',
        priority: 'medium',
        estimatedCost: 120,
        estimatedDuration: 2
      },
      {
        category: 'tires',
        description: 'Rotate tires and check alignment',
        priority: 'low',
        estimatedCost: 40,
        estimatedDuration: 1
      }
    ],
    marketValue: {
      current: 18500,
      afterRepairs: 18200,
      currency: 'EUR'
    },
    certificationEligible: true,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
  };

  const mockInspection: VehicleInspection = {
    id: data.inspectionId,
    vehicleId: 'vehicle_123',
    customerId: 'customer_456',
    inspectorId: 'inspector_789',
    inspectionType: 'comprehensive',
    status: 'completed',
    scheduledDate: new Date(Date.now() - 86400000), // Yesterday
    completedDate: new Date(Date.now() - 3600000), // 1 hour ago
    location: {
      address: 'ул. Витоша 25',
      city: 'София',
      latitude: 42.6977,
      longitude: 23.3219
    },
    results: mockResults,
    certificate: {
      id: 'cert_001',
      certificateNumber: 'GC-2024-001234',
      vehicleId: 'vehicle_123',
      inspectionId: data.inspectionId,
      certificationLevel: 'silver',
      issuedDate: new Date(Date.now() - 3600000),
      expiresDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      certifiedBy: 'Gloubul Certified',
      qrCode: 'https://qr.gloubul.bg/cert/GC-2024-001234',
      benefits: ['12-month warranty', 'Roadside assistance', 'Priority service'],
      restrictions: ['Valid only in Bulgaria', 'Subject to annual re-inspection']
    },
    photos: [
      'https://storage.gloubul.bg/inspections/insp_001/exterior.jpg',
      'https://storage.gloubul.bg/inspections/insp_001/engine.jpg'
    ],
    notes: 'Vehicle is in good condition with minor maintenance needed.',
    cost: 150,
    paymentStatus: 'paid',
    createdAt: new Date(Date.now() - 86400000 * 2),
    updatedAt: new Date(Date.now() - 3600000)
  };

  return mockInspection;
};

export const getCustomerInspections = async (data: { customerId: string }) => {
  // Mock implementation - return customer's inspection history
  const mockInspections: VehicleInspection[] = [
    {
      id: 'insp_001',
      vehicleId: 'vehicle_123',
      customerId: data.customerId,
      inspectorId: 'inspector_789',
      inspectionType: 'comprehensive',
      status: 'completed',
      scheduledDate: new Date(Date.now() - 86400000),
      completedDate: new Date(Date.now() - 3600000),
      location: {
        address: 'ул. Витоша 25',
        city: 'София',
        latitude: 42.6977,
        longitude: 23.3219
      },
      results: {
        overallScore: 85,
        overallGrade: 'B',
        categories: {} as any, // Simplified for mock
        criticalIssues: [],
        recommendedRepairs: [],
        marketValue: { current: 18500, afterRepairs: 18200, currency: 'EUR' },
        certificationEligible: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      photos: [],
      notes: '',
      cost: 150,
      paymentStatus: 'paid',
      createdAt: new Date(Date.now() - 86400000 * 2),
      updatedAt: new Date(Date.now() - 3600000)
    }
  ];

  return mockInspections;
};

export const getVehicleCertificate = async (data: { certificateId: string }) => {
  // Mock implementation - return certificate details
  const mockCertificate: VehicleCertificate = {
    id: data.certificateId,
    certificateNumber: 'GC-2024-001234',
    vehicleId: 'vehicle_123',
    inspectionId: 'insp_001',
    certificationLevel: 'silver',
    issuedDate: new Date(Date.now() - 3600000),
    expiresDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    certifiedBy: 'Gloubul Certified',
    qrCode: 'https://qr.gloubul.bg/cert/GC-2024-001234',
    benefits: ['12-month warranty', 'Roadside assistance', 'Priority service'],
    restrictions: ['Valid only in Bulgaria', 'Subject to annual re-inspection']
  };

  return mockCertificate;
};

export const verifyCertificate = async () => {
  // Mock implementation - verify certificate authenticity
  const isValid = Math.random() > 0.1; // 90% valid

  if (isValid) {
    const certificate = await getVehicleCertificate({ certificateId: 'cert_001' });
    return {
      isValid: true,
      certificate,
      message: 'Certificate is valid and authentic.'
    };
  } else {
    return {
      isValid: false,
      message: 'Certificate number not found or expired.'
    };
  }
};

export const getCertificationStats = async () => {
  // Mock certification statistics
  return {
    totalInspections: 15420,
    certifiedVehicles: 12850,
    avgScore: 82.5,
    certificationsByLevel: {
      bronze: 4250,
      silver: 3800,
      gold: 3200,
      platinum: 1600
    },
    popularInspectionTypes: ['comprehensive', 'pre_purchase', 'insurance', 'basic'],
    monthlyGrowth: 12.5
  };
};

export const certifiedService = CertifiedService.getInstance();