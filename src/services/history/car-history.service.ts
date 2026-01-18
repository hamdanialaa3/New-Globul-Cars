/**
 * Car History Report Service
 * خدمة تقارير تاريخ السيارة
 * 
 * Competitive Advantage: CARFAX-style reports (not available in mobile.bg/cars.bg)
 * 
 * Features:
 * - Previous ownership history
 * - Accident history
 * - Service records
 * - Bulgarian registration checks
 * - Mileage verification
 * 
 * Location: Bulgaria | Languages: BG/EN
 * Created: January 18, 2026
 */

import { db } from '@/firebase/firebase-config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { logger } from '@/services/logger-service';

// ==================== INTERFACES ====================

export interface CarHistoryReport {
  carId: string;
  vin?: string;
  licensePlate?: string;
  
  // Ownership History
  ownershipHistory: {
    count: number; // Total number of previous owners
    records: OwnershipRecord[];
  };
  
  // Accident History
  accidentHistory: {
    hasAccidents: boolean;
    count: number;
    severity: 'none' | 'minor' | 'moderate' | 'severe';
    records: AccidentRecord[];
  };
  
  // Service History
  serviceHistory: {
    lastServiceDate?: Date;
    totalServices: number;
    records: ServiceRecord[];
  };
  
  // Registration & Compliance
  registrationInfo: {
    registeredInBulgaria: boolean;
    firstRegistration?: Date;
    currentRegistration?: Date;
    technicalInspectionValid: boolean;
    technicalInspectionExpiry?: Date;
    environmentalTaxPaid: boolean;
  };
  
  // Mileage Verification
  mileageVerification: {
    currentMileage: number;
    verified: boolean;
    suspiciousActivity: boolean;
    history: MileageRecord[];
  };
  
  // Overall Score
  score: {
    overall: number; // 0-100
    trustLevel: 'excellent' | 'good' | 'fair' | 'poor';
    recommendationBuyer: string; // BG/EN text
    recommendationSeller: string;
  };
  
  generatedAt: Date;
}

interface OwnershipRecord {
  ownerNumber: number;
  periodStart?: Date;
  periodEnd?: Date;
  region?: string;
}

interface AccidentRecord {
  date: Date;
  severity: 'minor' | 'moderate' | 'severe';
  description?: string;
  repaired: boolean;
  cost?: number;
}

interface ServiceRecord {
  date: Date;
  type: 'maintenance' | 'repair' | 'inspection';
  description: string;
  mileage?: number;
  cost?: number;
  provider?: string;
}

interface MileageRecord {
  date: Date;
  mileage: number;
  source: 'service' | 'inspection' | 'registration' | 'seller';
}

// ==================== SERVICE CLASS ====================

export class CarHistoryService {
  private static instance: CarHistoryService;
  
  private constructor() {}
  
  public static getInstance(): CarHistoryService {
    if (!CarHistoryService.instance) {
      CarHistoryService.instance = new CarHistoryService();
    }
    return CarHistoryService.instance;
  }
  
  // ==================== PUBLIC METHODS ====================
  
  /**
   * Generate comprehensive car history report
   * إنشاء تقرير تاريخ شامل للسيارة
   */
  async generateReport(carId: string): Promise<CarHistoryReport> {
    try {
      logger.info('Generating car history report', { carId });
      
      // Fetch car data
      const carData = await this.getCarData(carId);
      
      if (!carData) {
        throw new Error('Car not found');
      }
      
      // Generate each section
      const ownershipHistory = await this.getOwnershipHistory(carData);
      const accidentHistory = await this.getAccidentHistory(carData);
      const serviceHistory = await this.getServiceHistory(carData);
      const registrationInfo = this.getRegistrationInfo(carData);
      const mileageVerification = await this.verifyMileage(carData);
      const score = this.calculateOverallScore(
        ownershipHistory,
        accidentHistory,
        serviceHistory,
        registrationInfo,
        mileageVerification
      );
      
      const report: CarHistoryReport = {
        carId,
        vin: carData.vin,
        licensePlate: carData.licensePlate,
        ownershipHistory,
        accidentHistory,
        serviceHistory,
        registrationInfo,
        mileageVerification,
        score,
        generatedAt: new Date()
      };
      
      // Save report to Firestore for caching
      await this.saveReport(report);
      
      logger.info('Car history report generated', { 
        carId, 
        score: score.overall,
        trustLevel: score.trustLevel 
      });
      
      return report;
      
    } catch (error) {
      logger.error('Failed to generate car history report', error as Error, { carId });
      throw error;
    }
  }
  
  /**
   * Get cached report if available
   * الحصول على تقرير محفوظ مسبقاً
   */
  async getCachedReport(carId: string): Promise<CarHistoryReport | null> {
    try {
      const reportRef = doc(db, 'car_history_reports', carId);
      const reportSnap = await getDoc(reportRef);
      
      if (!reportSnap.exists()) {
        return null;
      }
      
      const data = reportSnap.data();
      
      // Check if report is older than 30 days
      const generatedAt = data.generatedAt.toDate();
      const daysSince = (Date.now() - generatedAt.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSince > 30) {
        // Report is stale, regenerate
        return null;
      }
      
      return data as CarHistoryReport;
      
    } catch (error) {
      logger.error('Failed to get cached report', error as Error, { carId });
      return null;
    }
  }
  
  // ==================== PRIVATE METHODS ====================
  
  private async getCarData(carId: string): Promise<any> {
    // Get from multiple collections
    const collections = [
      'passenger_cars', 'suvs', 'vans', 
      'motorcycles', 'trucks', 'buses'
    ];
    
    for (const collectionName of collections) {
      const carRef = doc(db, collectionName, carId);
      const carSnap = await getDoc(carRef);
      
      if (carSnap.exists()) {
        return { id: carSnap.id, ...carSnap.data() };
      }
    }
    
    return null;
  }
  
  private async getOwnershipHistory(carData: any): Promise<any> {
    // Mock implementation - في الواقع يتم الاستعلام من قاعدة بيانات حكومية بلغارية
    const ownerCount = Math.floor(Math.random() * 3) + 1; // 1-3 owners
    
    const records: OwnershipRecord[] = [];
    for (let i = 0; i < ownerCount; i++) {
      records.push({
        ownerNumber: i + 1,
        periodStart: new Date(carData.year + i, 0, 1),
        periodEnd: i === ownerCount - 1 ? undefined : new Date(carData.year + i + 2, 0, 1),
        region: 'Sofia' // Mock
      });
    }
    
    return {
      count: ownerCount,
      records
    };
  }
  
  private async getAccidentHistory(carData: any): Promise<any> {
    // Mock implementation - في الواقع يتم الاستعلام من سجلات التأمين
    const hasAccidents = Math.random() > 0.7; // 30% chance of accidents
    
    if (!hasAccidents) {
      return {
        hasAccidents: false,
        count: 0,
        severity: 'none' as const,
        records: []
      };
    }
    
    const accidentCount = Math.floor(Math.random() * 2) + 1;
    const records: AccidentRecord[] = [];
    
    for (let i = 0; i < accidentCount; i++) {
      records.push({
        date: new Date(carData.year + i + 1, Math.floor(Math.random() * 12), 1),
        severity: i === 0 ? 'minor' : 'moderate',
        description: 'Minor collision',
        repaired: true,
        cost: Math.floor(Math.random() * 2000) + 500
      });
    }
    
    return {
      hasAccidents: true,
      count: accidentCount,
      severity: records.some(r => r.severity === 'severe') ? 'severe' : 
               records.some(r => r.severity === 'moderate') ? 'moderate' : 'minor',
      records
    };
  }
  
  private async getServiceHistory(carData: any): Promise<any> {
    // Mock implementation - في الواقع يتم الاستعلام من ورش الصيانة
    const serviceCount = Math.floor((new Date().getFullYear() - carData.year) * 1.5);
    const records: ServiceRecord[] = [];
    
    for (let i = 0; i < Math.min(serviceCount, 10); i++) {
      records.push({
        date: new Date(carData.year + i, Math.floor(Math.random() * 12), 1),
        type: i % 2 === 0 ? 'maintenance' : 'inspection',
        description: i % 2 === 0 ? 'Oil change and filter replacement' : 'Annual inspection',
        mileage: carData.mileage - (serviceCount - i) * 10000,
        cost: Math.floor(Math.random() * 300) + 100
      });
    }
    
    return {
      lastServiceDate: records[0]?.date,
      totalServices: serviceCount,
      records: records.slice(0, 5) // Latest 5 records
    };
  }
  
  private getRegistrationInfo(carData: any): any {
    return {
      registeredInBulgaria: carData.registeredInBulgaria || false,
      firstRegistration: carData.firstRegistration ? new Date(carData.firstRegistration) : undefined,
      currentRegistration: carData.currentRegistration ? new Date(carData.currentRegistration) : undefined,
      technicalInspectionValid: carData.technicalInspectionValid || false,
      technicalInspectionExpiry: carData.technicalInspectionExpiry ? new Date(carData.technicalInspectionExpiry) : undefined,
      environmentalTaxPaid: carData.environmentalTaxPaid || false
    };
  }
  
  private async verifyMileage(carData: any): Promise<any> {
    // Mock implementation - في الواقع يتم التحقق من سجلات الفحص الفني
    const currentMileage = carData.mileage || 0;
    const carAge = new Date().getFullYear() - carData.year;
    const expectedMileage = carAge * 15000; // Average 15k km/year
    
    const suspiciousActivity = Math.abs(currentMileage - expectedMileage) > 50000;
    
    const history: MileageRecord[] = [];
    for (let i = 0; i < Math.min(carAge, 5); i++) {
      history.push({
        date: new Date(carData.year + i, 0, 1),
        mileage: i * 15000 + Math.floor(Math.random() * 5000),
        source: 'inspection' as const
      });
    }
    
    return {
      currentMileage,
      verified: !suspiciousActivity,
      suspiciousActivity,
      history
    };
  }
  
  private calculateOverallScore(
    ownership: any,
    accidents: any,
    service: any,
    registration: any,
    mileage: any
  ): any {
    let score = 100;
    
    // Deduct points for multiple owners
    score -= (ownership.count - 1) * 10;
    
    // Deduct points for accidents
    if (accidents.hasAccidents) {
      score -= accidents.severity === 'severe' ? 30 : 
               accidents.severity === 'moderate' ? 20 : 10;
    }
    
    // Deduct points for poor service history
    const expectedServices = (new Date().getFullYear() - registration.firstRegistration?.getFullYear() || 0) * 1.5;
    if (service.totalServices < expectedServices * 0.5) {
      score -= 15;
    }
    
    // Deduct points for registration issues
    if (!registration.registeredInBulgaria) score -= 10;
    if (!registration.technicalInspectionValid) score -= 15;
    if (!registration.environmentalTaxPaid) score -= 10;
    
    // Deduct points for mileage issues
    if (mileage.suspiciousActivity) score -= 25;
    
    score = Math.max(0, Math.min(100, score));
    
    const trustLevel: 'excellent' | 'good' | 'fair' | 'poor' = 
      score >= 80 ? 'excellent' :
      score >= 60 ? 'good' :
      score >= 40 ? 'fair' : 'poor';
    
    return {
      overall: score,
      trustLevel,
      recommendationBuyer: trustLevel === 'excellent' || trustLevel === 'good' ?
        'Препоръчителна покупка. Автомобилът е в добро състояние.' :
        'Внимавайте. Има някои проблеми в историята.',
      recommendationSeller: trustLevel === 'excellent' || trustLevel === 'good' ?
        'Автомобилът е с добра история. Може да продадете на добра цена.' :
        'Има проблеми в историята. Цената може да бъде по-ниска.'
    };
  }
  
  private async saveReport(report: CarHistoryReport): Promise<void> {
    try {
      const reportRef = doc(db, 'car_history_reports', report.carId);
      await reportRef.set(report);
    } catch (error) {
      logger.error('Failed to save report', error as Error);
    }
  }
}

// Export singleton instance
export const carHistoryService = CarHistoryService.getInstance();
