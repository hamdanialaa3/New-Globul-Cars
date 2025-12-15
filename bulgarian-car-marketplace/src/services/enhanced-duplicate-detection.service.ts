/**
 * Enhanced Duplicate Detection Service
 * خدمة كشف الإعلانات المكررة - نسخة محسّنة
 * 
 * Features:
 * - VIN-based detection (100% accurate)
 * - Make+Model+Year+Mileage (High confidence)
 * - Make+Model+Year (Medium confidence)
 * - Image similarity (Optional - future enhancement)
 * - Price analysis (Suspicious pricing detection)
 * 
 * @version 2.0.0
 * @date December 15, 2025
 */

import { 
  collection, 
  query, 
  where, 
  getDocs,
  Timestamp,
  QueryConstraint 
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { logger } from './logger-service';

// ==================== INTERFACES ====================

export interface DuplicateCheckInput {
  vin?: string;
  make: string;
  model: string;
  year: number;
  mileage?: number;
  price?: number;
  sellerId: string;
  images?: string[]; // For future image similarity
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateCarIds: string[];
  confidence: 'high' | 'medium' | 'low';
  reason?: string;
  suggestions?: string[];
  suspiciousFlags?: string[];
}

interface CarDocument {
  id: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  mileage?: number;
  price?: number;
  sellerId: string;
  status: string;
  createdAt: Timestamp;
}

// ==================== SERVICE ====================

export class EnhancedDuplicateDetectionService {
  private static instance: EnhancedDuplicateDetectionService;
  
  // Configuration
  private readonly RECENT_DAYS = 30; // Check duplicates within last 30 days
  private readonly MILEAGE_TOLERANCE = 5000; // ±5000 km tolerance
  private readonly PRICE_TOLERANCE = 0.15; // ±15% price tolerance
  
  // Suspicious thresholds
  private readonly MIN_PRICE_EUR = 500;
  private readonly MAX_PRICE_EUR = 500000;
  private readonly SUSPICIOUS_LOW_PRICE = 2000;
  private readonly SUSPICIOUS_HIGH_PRICE = 100000;
  private readonly MIN_YEAR = 1950;
  private readonly MAX_YEAR = new Date().getFullYear() + 1;
  
  private constructor() {}
  
  public static getInstance(): EnhancedDuplicateDetectionService {
    if (!EnhancedDuplicateDetectionService.instance) {
      EnhancedDuplicateDetectionService.instance = new EnhancedDuplicateDetectionService();
    }
    return EnhancedDuplicateDetectionService.instance;
  }
  
  // ==================== PUBLIC METHODS ====================
  
  /**
   * Main duplicate check method
   * استراتيجية متعددة المراحل للكشف عن التكرار
   */
  async checkDuplicate(input: DuplicateCheckInput): Promise<DuplicateCheckResult> {
    logger.info('Starting duplicate check', {
      make: input.make,
      model: input.model,
      year: input.year,
      hasVIN: !!input.vin,
      hasMileage: !!input.mileage
    });
    
    try {
      // Phase 1: VIN-based detection (100% accurate)
      if (input.vin && this.isValidVIN(input.vin)) {
        const vinResult = await this.checkByVIN(input.vin, input.sellerId);
        if (vinResult.isDuplicate) {
          logger.warn('Duplicate detected by VIN', {
            vin: input.vin,
            duplicates: vinResult.duplicateCarIds
          });
          
          return {
            ...vinResult,
            confidence: 'high',
            reason: 'Exact VIN match found',
            suggestions: [
              'هذا الإعلان موجود بالفعل بنفس رقم الشاصي (VIN)',
              'يرجى التحقق من إعلاناتك السابقة',
              'إذا كانت سيارة مختلفة، تأكد من صحة رقم الشاصي'
            ]
          };
        }
      }
      
      // Phase 2: Exact match (Make+Model+Year+Mileage)
      if (input.mileage) {
        const exactResult = await this.checkByExactMatch(
          input.make,
          input.model,
          input.year,
          input.mileage,
          input.sellerId
        );
        
        if (exactResult.isDuplicate) {
          logger.warn('Duplicate detected by exact match', {
            make: input.make,
            model: input.model,
            year: input.year,
            mileage: input.mileage
          });
          
          return {
            ...exactResult,
            confidence: 'high',
            reason: 'Same make, model, year, and mileage',
            suggestions: [
              'تم العثور على إعلان مطابق تماماً',
              'نفس الماركة والموديل والسنة والمسافة المقطوعة',
              'يرجى مراجعة إعلاناتك الحالية'
            ]
          };
        }
      }
      
      // Phase 3: Similar match (Make+Model+Year)
      const similarResult = await this.checkBySimilar(
        input.make,
        input.model,
        input.year,
        input.sellerId
      );
      
      if (similarResult.isDuplicate) {
        logger.info('Similar car detected', {
          make: input.make,
          model: input.model,
          year: input.year,
          count: similarResult.duplicateCarIds.length
        });
        
        return {
          ...similarResult,
          confidence: 'medium',
          reason: 'Similar car found (same make, model, year)',
          suggestions: [
            'تم العثور على سيارة مشابهة',
            'نفس الماركة والموديل والسنة',
            'إذا كانت سيارة مختلفة، أضف المزيد من التفاصيل المميزة'
          ]
        };
      }
      
      // Phase 4: Suspicious patterns check
      const suspiciousFlags = this.checkSuspiciousPatterns(input);
      
      return {
        isDuplicate: false,
        duplicateCarIds: [],
        confidence: 'low',
        suspiciousFlags: suspiciousFlags.length > 0 ? suspiciousFlags : undefined
      };
      
    } catch (error) {
      logger.error('Duplicate check failed', error as Error, {
        make: input.make,
        model: input.model
      });
      
      // Return safe result on error
      return {
        isDuplicate: false,
        duplicateCarIds: [],
        confidence: 'low',
        reason: 'Could not complete duplicate check'
      };
    }
  }
  
  // ==================== PRIVATE DETECTION METHODS ====================
  
  /**
   * Check by VIN (100% accurate)
   */
  private async checkByVIN(
    vin: string,
    sellerId: string
  ): Promise<Pick<DuplicateCheckResult, 'isDuplicate' | 'duplicateCarIds'>> {
    const normalizedVIN = vin.toUpperCase().replace(/\s/g, '');
    
    const constraints: QueryConstraint[] = [
      where('vin', '==', normalizedVIN),
      where('sellerId', '==', sellerId),
      where('status', '!=', 'deleted')
    ];
    
    const q = query(collection(db, 'cars'), ...constraints);
    const snapshot = await getDocs(q);
    
    const duplicates = snapshot.docs.map(doc => doc.id);
    
    return {
      isDuplicate: duplicates.length > 0,
      duplicateCarIds: duplicates
    };
  }
  
  /**
   * Check by exact match (Make+Model+Year+Mileage)
   */
  private async checkByExactMatch(
    make: string,
    model: string,
    year: number,
    mileage: number,
    sellerId: string
  ): Promise<Pick<DuplicateCheckResult, 'isDuplicate' | 'duplicateCarIds'>> {
    const constraints: QueryConstraint[] = [
      where('make', '==', make),
      where('model', '==', model),
      where('year', '==', year),
      where('sellerId', '==', sellerId),
      where('status', '!=', 'deleted')
    ];
    
    const q = query(collection(db, 'cars'), ...constraints);
    const snapshot = await getDocs(q);
    
    // Filter by mileage tolerance
    const now = Date.now();
    const recentThreshold = now - (this.RECENT_DAYS * 24 * 60 * 60 * 1000);
    
    const duplicates = snapshot.docs
      .filter(doc => {
        const data = doc.data() as CarDocument;
        const carMileage = data.mileage || 0;
        const isRecent = data.createdAt.toMillis() > recentThreshold;
        const mileageDiff = Math.abs(carMileage - mileage);
        
        return isRecent && mileageDiff <= this.MILEAGE_TOLERANCE;
      })
      .map(doc => doc.id);
    
    return {
      isDuplicate: duplicates.length > 0,
      duplicateCarIds: duplicates
    };
  }
  
  /**
   * Check by similar (Make+Model+Year only)
   */
  private async checkBySimilar(
    make: string,
    model: string,
    year: number,
    sellerId: string
  ): Promise<Pick<DuplicateCheckResult, 'isDuplicate' | 'duplicateCarIds'>> {
    const constraints: QueryConstraint[] = [
      where('make', '==', make),
      where('model', '==', model),
      where('year', '==', year),
      where('sellerId', '==', sellerId),
      where('status', '!=', 'deleted')
    ];
    
    const q = query(collection(db, 'cars'), ...constraints);
    const snapshot = await getDocs(q);
    
    // Filter by recent (last 30 days)
    const now = Date.now();
    const recentThreshold = now - (this.RECENT_DAYS * 24 * 60 * 60 * 1000);
    
    const duplicates = snapshot.docs
      .filter(doc => {
        const data = doc.data() as CarDocument;
        return data.createdAt.toMillis() > recentThreshold;
      })
      .map(doc => doc.id);
    
    return {
      isDuplicate: duplicates.length > 0,
      duplicateCarIds: duplicates
    };
  }
  
  // ==================== VALIDATION & SUSPICIOUS PATTERNS ====================
  
  /**
   * Validate VIN format
   */
  private isValidVIN(vin: string): boolean {
    // VIN is 17 characters (A-Z, 0-9, excluding I, O, Q)
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
    return vinRegex.test(vin.toUpperCase().replace(/\s/g, ''));
  }
  
  /**
   * Check for suspicious patterns
   */
  private checkSuspiciousPatterns(input: DuplicateCheckInput): string[] {
    const flags: string[] = [];
    
    // Price checks
    if (input.price) {
      if (input.price < this.MIN_PRICE_EUR) {
        flags.push(`السعر منخفض جداً (أقل من ${this.MIN_PRICE_EUR}€)`);
      }
      
      if (input.price > this.MAX_PRICE_EUR) {
        flags.push(`السعر مرتفع جداً (أكثر من ${this.MAX_PRICE_EUR}€)`);
      }
      
      if (input.price < this.SUSPICIOUS_LOW_PRICE) {
        flags.push('⚠️ السعر منخفض بشكل مريب - يرجى التحقق');
      }
      
      if (input.price > this.SUSPICIOUS_HIGH_PRICE) {
        flags.push('⚠️ السعر مرتفع جداً - يتطلب تحقق إضافي');
      }
    }
    
    // Year checks
    if (input.year < this.MIN_YEAR || input.year > this.MAX_YEAR) {
      flags.push(`سنة غير صحيحة (${input.year})`);
    }
    
    // Mileage checks
    if (input.mileage) {
      const age = new Date().getFullYear() - input.year;
      const averageMileagePerYear = 15000; // 15,000 km/year average
      const expectedMileage = age * averageMileagePerYear;
      
      if (input.mileage > expectedMileage * 2) {
        flags.push('⚠️ المسافة المقطوعة مرتفعة جداً للسنة');
      }
      
      if (input.mileage < 1000 && age > 1) {
        flags.push('⚠️ المسافة المقطوعة منخفضة جداً للسنة');
      }
    }
    
    return flags;
  }
  
  /**
   * Get duplicate cars by IDs (for UI display)
   */
  async getDuplicateCarDetails(carIds: string[]): Promise<any[]> {
    if (carIds.length === 0) return [];
    
    try {
      const cars = await Promise.all(
        carIds.map(async id => {
          const docSnap = await getDocs(
            query(collection(db, 'cars'), where('__name__', '==', id))
          );
          return docSnap.docs[0]?.data();
        })
      );
      
      return cars.filter(car => car !== undefined);
    } catch (error) {
      logger.error('Failed to get duplicate car details', error as Error);
      return [];
    }
  }
}

// Export singleton instance
export const duplicateDetectionService = EnhancedDuplicateDetectionService.getInstance();

// Export types
export type { DuplicateCheckInput, DuplicateCheckResult };
