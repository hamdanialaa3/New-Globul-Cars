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
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
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
    // Real implementation - based on seller-provided data + crowdsourced records
    try {
      // Check for ownership records in Firestore (crowdsourced)
      const ownershipRef = collection(db, 'car_ownership_records');
      const q = query(ownershipRef, where('carId', '==', carData.id));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        // Use real crowdsourced data
        const records: OwnershipRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          records.push({
            ownerNumber: data.ownerNumber,
            periodStart: data.periodStart?.toDate(),
            periodEnd: data.periodEnd?.toDate(),
            region: data.region
          });
        });
        return {
          count: records.length,
          records: records.sort((a, b) => a.ownerNumber - b.ownerNumber)
        };
      }
      
      // Fallback: Use seller-provided data
      const ownerCount = carData.previousOwners || carData.ownerCount || 1;
      const records: OwnershipRecord[] = [{
        ownerNumber: 1,
        periodStart: carData.firstRegistration ? new Date(carData.firstRegistration) : new Date(carData.year, 0, 1),
        periodEnd: ownerCount === 1 ? undefined : undefined,
        region: carData.registrationCity || carData.city || 'Bulgaria'
      }];
      
      return {
        count: ownerCount,
        records,
        source: 'seller_provided'
      };
    } catch (error) {
      logger.warn('Failed to get ownership history, using seller data', { carId: carData.id });
      return {
        count: carData.previousOwners || 1,
        records: [],
        source: 'fallback'
      };
    }
  }
  
  private async getAccidentHistory(carData: any): Promise<any> {
    // Real implementation - based on seller disclosure + crowdsourced reports
    try {
      // Check for accident reports in Firestore (crowdsourced)
      const accidentRef = collection(db, 'car_accident_reports');
      const q = query(accidentRef, where('carId', '==', carData.id));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        // Use real crowdsourced data
        const records: AccidentRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          records.push({
            date: data.date?.toDate(),
            severity: data.severity || 'minor',
            description: data.description,
            repaired: data.repaired ?? true,
            cost: data.cost
          });
        });
        
        const severity = records.some(r => r.severity === 'severe') ? 'severe' : 
                        records.some(r => r.severity === 'moderate') ? 'moderate' : 'minor';
        
        return {
          hasAccidents: true,
          count: records.length,
          severity,
          records,
          source: 'crowdsourced'
        };
      }
      
      // Use seller-disclosed accident info
      const hasAccidents = carData.hasAccidentHistory || carData.accidentFree === false || false;
      
      return {
        hasAccidents,
        count: hasAccidents ? (carData.accidentCount || 1) : 0,
        severity: hasAccidents ? (carData.accidentSeverity || 'minor') : 'none' as const,
        records: [],
        source: hasAccidents ? 'seller_disclosed' : 'no_records'
      };
    } catch (error) {
      logger.warn('Failed to get accident history', { carId: carData.id });
      return {
        hasAccidents: false,
        count: 0,
        severity: 'none' as const,
        records: [],
        source: 'unavailable'
      };
    }
  }
  
  private async getServiceHistory(carData: any): Promise<any> {
    // Real implementation - based on seller-provided service records
    try {
      // Check for service records in Firestore (crowdsourced/uploaded)
      const serviceRef = collection(db, 'car_service_records');
      const q = query(serviceRef, where('carId', '==', carData.id), orderBy('date', 'desc'), limit(10));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        // Use real service records
        const records: ServiceRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          records.push({
            date: data.date?.toDate(),
            type: data.type || 'maintenance',
            description: data.description,
            mileage: data.mileage,
            cost: data.cost,
            provider: data.provider
          });
        });
        
        return {
          lastServiceDate: records[0]?.date,
          totalServices: records.length,
          records,
          source: 'documented'
        };
      }
      
      // Use seller-provided service info
      const hasServiceBook = carData.hasServiceBook || carData.serviceHistory || false;
      const lastService = carData.lastServiceDate || carData.lastService;
      
      return {
        lastServiceDate: lastService ? new Date(lastService) : undefined,
        totalServices: hasServiceBook ? (carData.serviceCount || 0) : 0,
        records: [],
        source: hasServiceBook ? 'seller_confirmed' : 'no_records'
      };
    } catch (error) {
      logger.warn('Failed to get service history', { carId: carData.id });
      return {
        lastServiceDate: undefined,
        totalServices: 0,
        records: [],
        source: 'unavailable'
      };
    }
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
    // Real implementation - based on seller data + crowdsourced mileage records
    try {
      const currentMileage = carData.mileage || carData.kilometers || 0;
      const carAge = new Date().getFullYear() - (carData.year || 2020);
      const expectedMileage = carAge * 15000; // Average 15k km/year in Bulgaria
      
      // Check for mileage records in Firestore (from inspections/uploads)
      const mileageRef = collection(db, 'car_mileage_records');
      const q = query(mileageRef, where('carId', '==', carData.id), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      
      const history: MileageRecord[] = [];
      let hasRecords = false;
      
      if (!snapshot.empty) {
        hasRecords = true;
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          history.push({
            date: data.date?.toDate(),
            mileage: data.mileage,
            source: data.source || 'documented'
          });
        });
      }
      
      // Suspicious if mileage differs significantly from expected OR if records show rollback
      let suspiciousActivity = Math.abs(currentMileage - expectedMileage) > 80000;
      
      // Check for mileage rollback (decreasing mileage over time)
      if (history.length >= 2) {
        for (let i = 0; i < history.length - 1; i++) {
          if (history[i].mileage < history[i + 1].mileage) {
            suspiciousActivity = true;
            break;
          }
        }
      }
      
      return {
        currentMileage,
        verified: hasRecords && !suspiciousActivity,
        suspiciousActivity,
        history: history.slice(0, 5),
        source: hasRecords ? 'documented' : 'seller_provided'
      };
    } catch (error) {
      logger.warn('Failed to verify mileage', { carId: carData.id });
      return {
        currentMileage: carData.mileage || 0,
        verified: false,
        suspiciousActivity: false,
        history: [],
        source: 'unavailable'
      };
    }
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
