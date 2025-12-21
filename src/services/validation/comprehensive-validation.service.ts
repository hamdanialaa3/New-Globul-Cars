/**
 * Comprehensive Validation Service
 * خدمة التحقق الشاملة - معايير السوق البلغاري
 * 
 * @version 2.0.0
 * @date December 15, 2025
 */

import { logger } from '../logger-service';

// ==================== TYPES ====================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions?: string[];
}

export interface PriceValidationOptions {
  minPrice?: number;
  maxPrice?: number;
  currency: 'EUR';
  suspiciousThreshold?: number;
}

export interface VINValidationResult extends ValidationResult {
  vinType?: 'standard' | 'european' | 'non-standard';
  checksum?: boolean;
}

// ==================== CONSTANTS ====================

// Bulgarian Car Market Analysis (based on mobile.bg data)
const MARKET_CONSTANTS = {
  MIN_PRICE: 500, // €500 minimum for used cars
  MAX_PRICE: 500000, // €500k max (rare supercars)
  SUSPICIOUS_LOW: 2000, // Below €2k is suspicious
  SUSPICIOUS_HIGH: 100000, // Above €100k needs verification
  
  MIN_YEAR: 1960, // Classic cars
  MAX_YEAR: new Date().getFullYear() + 1, // Next year models
  
  MIN_MILEAGE: 0,
  MAX_MILEAGE: 1000000, // 1M km (suspicious but possible)
  SUSPICIOUS_MILEAGE: 500000, // Above 500k km needs verification
  
  MIN_ENGINE_SIZE: 0.6, // 600cc (Smart ForTwo)
  MAX_ENGINE_SIZE: 10.0, // 10L (Viper, exotic cars)
  
  MIN_HORSEPOWER: 30, // Small city cars
  MAX_HORSEPOWER: 1500, // Hypercars
};

// ==================== PRICE VALIDATION ====================

export class PriceValidator {
  /**
   * Validate car price against Bulgarian market standards
   */
  static validate(
    price: number,
    year: number,
    make?: string,
    model?: string,
    options?: Partial<PriceValidationOptions>
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    
    const {
      minPrice = MARKET_CONSTANTS.MIN_PRICE,
      maxPrice = MARKET_CONSTANTS.MAX_PRICE,
      suspiciousThreshold = MARKET_CONSTANTS.SUSPICIOUS_LOW
    } = options || {};
    
    // Basic validation
    if (price < minPrice) {
      errors.push(`السعر منخفض جداً. الحد الأدنى ${minPrice}€`);
    }
    
    if (price > maxPrice) {
      errors.push(`السعر مرتفع جداً. الحد الأقصى ${maxPrice}€`);
    }
    
    // Suspicious pricing
    if (price < suspiciousThreshold) {
      warnings.push('⚠️ السعر منخفض بشكل مريب. يرجى التحقق من حالة السيارة.');
      suggestions.push('تأكد من أن السعر صحيح، أو أن السيارة ليست تالفة أو تحتاج إصلاحات كبيرة.');
    }
    
    if (price > MARKET_CONSTANTS.SUSPICIOUS_HIGH) {
      warnings.push('⚠️ السعر مرتفع جداً. يتطلب تحقق إضافي.');
      suggestions.push('للسيارات الفاخرة والنادرة، يرجى إرفاق وثائق التقييم.');
    }
    
    // Price vs Year analysis
    const carAge = new Date().getFullYear() - year;
    if (carAge > 10 && price > 50000) {
      warnings.push('⚠️ السيارة قديمة لكن السعر مرتفع. تأكد من الحالة والمواصفات.');
    }
    
    // Log validation
    logger.info('Price validation completed', {
      price,
      year,
      make,
      model,
      hasErrors: errors.length > 0,
      hasWarnings: warnings.length > 0
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }
  
  /**
   * Get market price range for specific car
   */
  static getMarketRange(year: number, make: string, model: string): {
    min: number;
    max: number;
    average?: number;
  } {
    // This would connect to your market data API
    // For now, return estimates based on year
    const carAge = new Date().getFullYear() - year;
    
    if (carAge < 3) {
      return { min: 15000, max: 80000, average: 35000 };
    } else if (carAge < 7) {
      return { min: 8000, max: 40000, average: 18000 };
    } else if (carAge < 15) {
      return { min: 3000, max: 20000, average: 9000 };
    } else {
      return { min: 1000, max: 10000, average: 3500 };
    }
  }
}

// ==================== VIN VALIDATION ====================

export class VINValidator {
  /**
   * Validate VIN (Vehicle Identification Number)
   * Supports 17-character standard VINs
   */
  static validate(vin: string): VINValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Normalize VIN
    const normalizedVIN = vin.toUpperCase().replace(/[\s-]/g, '');
    
    // Length check
    if (normalizedVIN.length !== 17) {
      if (normalizedVIN.length === 0) {
        errors.push('رقم VIN مطلوب للسيارات المستعملة.');
      } else {
        errors.push(`رقم VIN يجب أن يكون 17 حرفاً. الحالي: ${normalizedVIN.length}`);
      }
      return { isValid: false, errors, warnings };
    }
    
    // Character validation (no I, O, Q allowed in VIN)
    const invalidChars = normalizedVIN.match(/[IOQ]/g);
    if (invalidChars) {
      errors.push(`رقم VIN يحتوي على أحرف غير صالحة: ${invalidChars.join(', ')}`);
    }
    
    // Valid characters check
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(normalizedVIN)) {
      errors.push('رقم VIN يحتوي على أحرف غير صالحة. يجب أن يحتوي على أحرف وأرقام فقط (باستثناء I, O, Q).');
    }
    
    // Checksum validation (9th digit)
    const checksumValid = this.validateChecksum(normalizedVIN);
    if (!checksumValid) {
      warnings.push('⚠️ رقم VIN قد لا يكون صحيحاً (فشل التحقق من checksum). يرجى التحقق مرة أخرى.');
    }
    
    // Determine VIN type
    const vinType = this.determineVINType(normalizedVIN);
    
    logger.info('VIN validation completed', {
      vin: normalizedVIN,
      vinType,
      checksumValid,
      hasErrors: errors.length > 0
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      vinType,
      checksum: checksumValid
    };
  }
  
  /**
   * Validate VIN checksum (9th digit)
   * Based on ISO 3779 standard
   */
  private static validateChecksum(vin: string): boolean {
    const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
    const transliterationTable: Record<string, number> = {
      A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
      J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
      S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9
    };
    
    let sum = 0;
    for (let i = 0; i < 17; i++) {
      const char = vin[i];
      const value = isNaN(Number(char)) ? transliterationTable[char] || 0 : Number(char);
      sum += value * weights[i];
    }
    
    const checkDigit = vin[8];
    const calculatedCheck = sum % 11;
    const expectedCheck = calculatedCheck === 10 ? 'X' : String(calculatedCheck);
    
    return checkDigit === expectedCheck;
  }
  
  /**
   * Determine VIN type (standard, european, non-standard)
   */
  private static determineVINType(vin: string): 'standard' | 'european' | 'non-standard' {
    // World Manufacturer Identifier (WMI) - first 3 characters
    const wmi = vin.substring(0, 3);
    
    // European manufacturers typically start with S-Z
    if (/^[S-Z]/.test(wmi)) {
      return 'european';
    }
    
    // North American manufacturers: 1-5
    // Asian manufacturers: J, K, L, M, N, P, R
    if (/^[1-5JK-NP]/.test(wmi)) {
      return 'standard';
    }
    
    return 'non-standard';
  }
}

// ==================== MILEAGE VALIDATION ====================

export class MileageValidator {
  /**
   * Validate mileage against car age and market standards
   */
  static validate(mileage: number, year: number, make?: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    
    // Basic validation
    if (mileage < MARKET_CONSTANTS.MIN_MILEAGE) {
      errors.push('الكيلومترات لا يمكن أن تكون سالبة.');
    }
    
    if (mileage > MARKET_CONSTANTS.MAX_MILEAGE) {
      errors.push(`الكيلومترات مرتفعة جداً. الحد الأقصى ${MARKET_CONSTANTS.MAX_MILEAGE.toLocaleString()} كم`);
    }
    
    // Suspicious mileage
    if (mileage > MARKET_CONSTANTS.SUSPICIOUS_MILEAGE) {
      warnings.push('⚠️ الكيلومترات مرتفعة جداً. قد تحتاج السيارة صيانة كبيرة.');
      suggestions.push('يرجى إرفاق سجل الصيانة وتوضيح حالة السيارة.');
    }
    
    // Mileage vs Age analysis
    const carAge = new Date().getFullYear() - year;
    const avgKmPerYear = carAge > 0 ? mileage / carAge : 0;
    
    // Average: 15,000-20,000 km/year in Bulgaria
    if (avgKmPerYear > 30000) {
      warnings.push('⚠️ متوسط الكيلومترات سنوياً مرتفع جداً (أكثر من 30,000 كم/سنة).');
      suggestions.push('قد تكون السيارة مستخدمة لمسافات طويلة (تاكسي، توصيل، إلخ).');
    }
    
    if (carAge > 3 && avgKmPerYear < 5000) {
      warnings.push('⚠️ متوسط الكيلومترات سنوياً منخفض جداً (أقل من 5,000 كم/سنة).');
      suggestions.push('تأكد من صحة قراءة العداد. الكيلومترات المنخفضة جداً قد تكون مريبة.');
    }
    
    // Brand-specific checks
    if (make === 'Mercedes-Benz' || make === 'BMW' || make === 'Audi') {
      if (mileage > 300000) {
        warnings.push('⚠️ سيارات ألمانية فاخرة مع كيلومترات عالية قد تحتاج صيانة مكلفة.');
      }
    }
    
    logger.info('Mileage validation completed', {
      mileage,
      year,
      carAge,
      avgKmPerYear,
      hasErrors: errors.length > 0,
      hasWarnings: warnings.length > 0
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }
}

// ==================== YEAR VALIDATION ====================

export class YearValidator {
  /**
   * Validate manufacturing year
   */
  static validate(year: number): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    
    const currentYear = new Date().getFullYear();
    
    if (year < MARKET_CONSTANTS.MIN_YEAR) {
      errors.push(`السنة قديمة جداً. الحد الأدنى ${MARKET_CONSTANTS.MIN_YEAR}`);
    }
    
    if (year > MARKET_CONSTANTS.MAX_YEAR) {
      errors.push(`السنة غير صحيحة. الحد الأقصى ${MARKET_CONSTANTS.MAX_YEAR}`);
    }
    
    // Classic car (>25 years)
    const carAge = currentYear - year;
    if (carAge > 25) {
      warnings.push('⚠️ سيارة كلاسيكية (أكثر من 25 سنة).');
      suggestions.push('قد تحتاج وثائق خاصة للسيارات الكلاسيكية.');
    }
    
    // Very old car (>40 years)
    if (carAge > 40) {
      warnings.push('⚠️ سيارة قديمة جداً. تأكد من حالتها وقابليتها للاستخدام اليومي.');
    }
    
    logger.info('Year validation completed', {
      year,
      carAge,
      hasErrors: errors.length > 0
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }
}

// ==================== ENGINE VALIDATION ====================

export class EngineValidator {
  /**
   * Validate engine size (in liters)
   */
  static validateEngineSize(engineSize: number): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (engineSize < MARKET_CONSTANTS.MIN_ENGINE_SIZE) {
      errors.push(`حجم المحرك صغير جداً. الحد الأدنى ${MARKET_CONSTANTS.MIN_ENGINE_SIZE}L`);
    }
    
    if (engineSize > MARKET_CONSTANTS.MAX_ENGINE_SIZE) {
      errors.push(`حجم المحرك كبير جداً. الحد الأقصى ${MARKET_CONSTANTS.MAX_ENGINE_SIZE}L`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Validate horsepower
   */
  static validateHorsepower(horsepower: number): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (horsepower < MARKET_CONSTANTS.MIN_HORSEPOWER) {
      errors.push(`القوة الحصانية منخفضة جداً. الحد الأدنى ${MARKET_CONSTANTS.MIN_HORSEPOWER} HP`);
    }
    
    if (horsepower > MARKET_CONSTANTS.MAX_HORSEPOWER) {
      errors.push(`القوة الحصانية مرتفعة جداً. الحد الأقصى ${MARKET_CONSTANTS.MAX_HORSEPOWER} HP`);
    }
    
    if (horsepower > 500) {
      warnings.push('⚠️ سيارة عالية الأداء. تأكد من تأمين مناسب وتكاليف صيانة.');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// ==================== EXPORT ====================

export const ComprehensiveValidation = {
  Price: PriceValidator,
  VIN: VINValidator,
  Mileage: MileageValidator,
  Year: YearValidator,
  Engine: EngineValidator
};

export default ComprehensiveValidation;
