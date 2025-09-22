// src/services/vehicle-history-service.ts
// Vehicle History Service Integration for Bulgarian Car Marketplace
// Integrates with carVertical or CARFAX Europe for vehicle history reports

import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/firebase-config';

export interface VehicleHistoryReport {
  vin: string;
  reportId: string;
  generatedAt: Date;
  provider: 'carvertical' | 'carfax';
  status: 'success' | 'error' | 'pending';

  // Basic vehicle info
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    engineSize?: number;
    fuelType?: string;
    transmission?: string;
  };

  // History data
  history: {
    // Accident history
    accidents: Array<{
      date: Date;
      type: string;
      severity: 'minor' | 'moderate' | 'severe';
      description: string;
    }>;

    // Ownership history
    ownership: Array<{
      owner: string;
      fromDate: Date;
      toDate?: Date;
      type: 'personal' | 'commercial' | 'rental';
    }>;

    // Service history
    serviceRecords: Array<{
      date: Date;
      type: string;
      mileage: number;
      description: string;
      location: string;
    }>;

    // Mileage history
    mileageHistory: Array<{
      date: Date;
      mileage: number;
      source: string;
    }>;
  };

  // Risk assessment
  riskAssessment: {
    overallRisk: 'low' | 'medium' | 'high';
    riskScore: number; // 0-100
    factors: {
      accidentRisk: number;
      mileageRisk: number;
      ownershipRisk: number;
      serviceRisk: number;
    };
  };

  // Market impact
  marketImpact: {
    estimatedValueReduction: number;
    currency: string;
    confidence: number;
  };
}

export interface VehicleHistoryRequest {
  vin: string;
  make?: string;
  model?: string;
  year?: number;
  country?: string; // Default to 'BG' for Bulgaria
}

class VehicleHistoryService {
  private static instance: VehicleHistoryService;
  private readonly PROVIDER_API_KEY = process.env.REACT_APP_VEHICLE_HISTORY_API_KEY;
  private readonly PROVIDER_BASE_URL = 'https://api.carvertical.com'; // or CARFAX API

  static getInstance(): VehicleHistoryService {
    if (!VehicleHistoryService.instance) {
      VehicleHistoryService.instance = new VehicleHistoryService();
    }
    return VehicleHistoryService.instance;
  }

  /**
   * Request vehicle history report
   * This calls our Firebase Function which integrates with the provider
   */
  async requestVehicleHistory(request: VehicleHistoryRequest): Promise<VehicleHistoryReport> {
    try {
      const getVehicleHistory = httpsCallable(functions, 'getVehicleHistoryReport');

      const result = await getVehicleHistory({
        vin: request.vin,
        make: request.make,
        model: request.model,
        year: request.year,
        country: request.country || 'BG'
      });

      return result.data as VehicleHistoryReport;
    } catch (error: any) {
      console.error('Error requesting vehicle history:', error);
      throw new Error(`Failed to get vehicle history: ${error.message}`);
    }
  }

  /**
   * Check if VIN is valid format
   */
  isValidVIN(vin: string): boolean {
    // Basic VIN validation (17 characters, alphanumeric except I,O,Q)
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
    return vinRegex.test(vin.toUpperCase());
  }

  /**
   * Get cached report if available
   */
  async getCachedReport(vin: string): Promise<VehicleHistoryReport | null> {
    try {
      const getCachedReport = httpsCallable(functions, 'getCachedVehicleHistory');

      const result = await getCachedReport({ vin });
      return result.data as VehicleHistoryReport;
    } catch (error) {
      console.error('Error getting cached report:', error);
      return null;
    }
  }

  /**
   * Calculate market value adjustment based on history
   */
  calculateValueAdjustment(report: VehicleHistoryReport): {
    adjustment: number;
    currency: string;
    factors: string[];
  } {
    let adjustment = 0;
    const factors: string[] = [];

    // Accident impact
    const accidentCount = report.history.accidents.length;
    if (accidentCount > 0) {
      const accidentPenalty = Math.min(accidentCount * 1500, 8000); // Max €8,000 reduction
      adjustment -= accidentPenalty;
      factors.push(`${accidentCount} accident(s): -€${accidentPenalty}`);
    }

    // Mileage impact (compared to average for age)
    const currentMileage = report.history.mileageHistory[report.history.mileageHistory.length - 1]?.mileage || 0;
    const vehicleAge = new Date().getFullYear() - (report.vehicleInfo.year || 2020);
    const expectedMileage = vehicleAge * 15000; // 15k km per year average

    if (currentMileage > expectedMileage * 1.5) {
      const mileagePenalty = Math.min((currentMileage - expectedMileage) * 0.1, 3000);
      adjustment -= mileagePenalty;
      factors.push(`High mileage: -€${mileagePenalty}`);
    }

    // Ownership impact
    const ownerCount = report.history.ownership.length;
    if (ownerCount > 3) {
      adjustment -= 1000;
      factors.push(`Multiple owners (${ownerCount}): -€1,000`);
    }

    // Service history impact
    const serviceCount = report.history.serviceRecords.length;
    const expectedServices = Math.max(vehicleAge * 2, 1); // At least 2 services per year

    if (serviceCount < expectedServices) {
      adjustment -= 500;
      factors.push(`Limited service history: -€500`);
    }

    return {
      adjustment: Math.round(adjustment),
      currency: 'EUR',
      factors
    };
  }

  /**
   * Get risk color for UI display
   */
  getRiskColor(risk: 'low' | 'medium' | 'high'): string {
    switch (risk) {
      case 'low': return '#10b981'; // green
      case 'medium': return '#f59e0b'; // amber
      case 'high': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  }

  /**
   * Format report for display
   */
  formatReportForDisplay(report: VehicleHistoryReport): {
    summary: {
      risk: string;
      riskColor: string;
      totalAccidents: number;
      totalOwners: number;
      currentMileage: number;
      valueAdjustment: number;
    };
    details: {
      accidents: any[];
      ownership: any[];
      service: any[];
      mileage: any[];
    };
  } {
    return {
      summary: {
        risk: report.riskAssessment.overallRisk,
        riskColor: this.getRiskColor(report.riskAssessment.overallRisk),
        totalAccidents: report.history.accidents.length,
        totalOwners: report.history.ownership.length,
        currentMileage: report.history.mileageHistory[report.history.mileageHistory.length - 1]?.mileage || 0,
        valueAdjustment: report.marketImpact.estimatedValueReduction
      },
      details: {
        accidents: report.history.accidents.map(accident => ({
          ...accident,
          date: accident.date.toLocaleDateString('bg-BG')
        })),
        ownership: report.history.ownership.map(owner => ({
          ...owner,
          fromDate: owner.fromDate.toLocaleDateString('bg-BG'),
          toDate: owner.toDate?.toLocaleDateString('bg-BG')
        })),
        service: report.history.serviceRecords.map(service => ({
          ...service,
          date: service.date.toLocaleDateString('bg-BG')
        })),
        mileage: report.history.mileageHistory.map(record => ({
          ...record,
          date: record.date.toLocaleDateString('bg-BG')
        }))
      }
    };
  }
}

// Firebase Function for vehicle history (server-side integration)
export const getVehicleHistoryReport = async (data: VehicleHistoryRequest) => {
  // This would be implemented in Firebase Functions
  // Integration with carVertical or CARFAX Europe APIs

  const { vin, country = 'BG' } = data;

  // Mock response for development
  const mockReport: VehicleHistoryReport = {
    vin,
    reportId: `report_${Date.now()}`,
    generatedAt: new Date(),
    provider: 'carvertical',
    status: 'success',
    vehicleInfo: {
      make: 'BMW',
      model: 'X3',
      year: 2020,
      engineSize: 2.0,
      fuelType: 'diesel',
      transmission: 'automatic'
    },
    history: {
      accidents: [
        {
          date: new Date('2022-03-15'),
          type: 'rear collision',
          severity: 'minor',
          description: 'Minor rear bumper damage'
        }
      ],
      ownership: [
        {
          owner: 'Private Owner',
          fromDate: new Date('2020-06-01'),
          toDate: new Date('2023-12-01'),
          type: 'personal'
        }
      ],
      serviceRecords: [
        {
          date: new Date('2021-06-15'),
          type: 'regular maintenance',
          mileage: 15000,
          description: 'Oil change and general inspection',
          location: 'BMW Sofia'
        }
      ],
      mileageHistory: [
        {
          date: new Date('2020-06-01'),
          mileage: 0,
          source: 'manufacturer'
        },
        {
          date: new Date('2023-12-01'),
          mileage: 45000,
          source: 'inspection'
        }
      ]
    },
    riskAssessment: {
      overallRisk: 'low',
      riskScore: 25,
      factors: {
        accidentRisk: 30,
        mileageRisk: 15,
        ownershipRisk: 10,
        serviceRisk: 20
      }
    },
    marketImpact: {
      estimatedValueReduction: 1200,
      currency: 'EUR',
      confidence: 85
    }
  };

  return mockReport;
};

export const vehicleHistoryService = VehicleHistoryService.getInstance();