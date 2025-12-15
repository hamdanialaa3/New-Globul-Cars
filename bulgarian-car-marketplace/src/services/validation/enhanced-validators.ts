/**
 * Enhanced Validation Service
 * خدمة التحقق من صحة البيانات - نسخة محسّنة للسوق البلغاري
 * 
 * Bulgarian Market-Specific Validators:
 * - Price validation (EUR currency)
 * - Year validation (realistic ranges)
 * - Mileage validation (km)
 * - VIN format validation
 * - Phone number validation (Bulgarian format)
 * - Registration number validation (Bulgarian format)
 * 
 * @version 2.0.0
 * @date December 15, 2025
 */

import { logger } from '../logger-service';

// ==================== INTERFACES ====================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PriceValidationOptions {
  currency?: 'EUR' | 'BGN';
  minPrice?: number;
  maxPrice?: number;
  suspiciousLowThreshold?: number;
  suspiciousHighThreshold?: number;
}

export interface YearValidationOptions {
  minYear?: number;
  maxYear?: number;
  allowFuture?: boolean;
}

export interface MileageValidationOptions {
  unit?: 'km' | 'miles';
  maxMileage?: number;
  checkSuspicious?: boolean;
  vehicleYear?: number;
}

// ==================== CONSTANTS ====================

// Bulgarian Market Standards
const BULGARIAN_STANDARDS = {
  // Price ranges (EUR)
  MIN_PRICE_EUR: 500,
  MAX_PRICE_EUR: 500000,
  SUSPICIOUS_LOW_PRICE_EUR: 2000,
  SUSPICIOUS_HIGH_PRICE_EUR: 100000,
  
  // Price ranges (BGN) - 1 EUR ≈ 1.96 BGN
  BGN_TO_EUR_RATE: 1.96,
  
  // Year ranges
  MIN_YEAR: 1950,
  MAX_YEAR: new Date().getFullYear() + 1,
  CLASSIC_CAR_THRESHOLD: 1990,
  
  // Mileage
  MAX_MILEAGE_KM: 1000000,
  AVERAGE_KM_PER_YEAR: 15000,
  HIGH_MILEAGE_MULTIPLIER: 2,
  LOW_MILEAGE_MULTIPLIER: 0.1,
  
  // VIN
  VIN_LENGTH: 17,
  VIN_EXCLUDED_CHARS: ['I', 'O', 'Q'],
  
  // Phone
  BULGARIAN_PHONE_REGEX: /^(\+359|0)\s?8[789]\d{7}$/,
  
  // Registration (Bulgarian format: XX1234XX or XX123456)
  BULGARIAN_REGISTRATION_REGEX: /^[A-Z]{2}\d{4,6}[A-Z]{2}$/
};

// ==================== PRICE VALIDATORS ====================

/**
 * Validate price with Bulgarian market standards
 */
export function validatePrice(
  price: number,
  options: PriceValidationOptions = {}
): ValidationResult {
  const {
    currency = 'EUR',
    minPrice = BULGARIAN_STANDARDS.MIN_PRICE_EUR,
    maxPrice = BULGARIAN_STANDARDS.MAX_PRICE_EUR,
    suspiciousLowThreshold = BULGARIAN_STANDARDS.SUSPICIOUS_LOW_PRICE_EUR,
    suspiciousHighThreshold = BULGARIAN_STANDARDS.SUSPICIOUS_HIGH_PRICE_EUR
  } = options;
  
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Convert BGN to EUR if needed
  const priceInEUR = currency === 'BGN' 
    ? price / BULGARIAN_STANDARDS.BGN_TO_EUR_RATE 
    : price;
  
  // Basic validation
  if (typeof price !== 'number' || isNaN(price)) {
    errors.push('السعر يجب أن يكون رقماً صحيحاً');
    return { isValid: false, errors, warnings };
  }
  
  if (price <= 0) {
    errors.push('السعر يجب أن يكون أكبر من صفر');
  }
  
  // Range validation
  if (priceInEUR < minPrice) {
    errors.push(`السعر منخفض جداً (الحد الأدنى: ${minPrice}€)`);
  }
  
  if (priceInEUR > maxPrice) {
    errors.push(`السعر مرتفع جداً (الحد الأقصى: ${maxPrice}€)`);
  }
  
  // Suspicious price warnings
  if (priceInEUR < suspiciousLowThreshold && priceInEUR >= minPrice) {
    warnings.push('⚠️ السعر منخفض بشكل غير عادي - يرجى التحقق من صحته');
  }
  
  if (priceInEUR > suspiciousHighThreshold && priceInEUR <= maxPrice) {
    warnings.push('⚠️ السعر مرتفع جداً - يتطلب معلومات إضافية للتحقق');
  }
  
  // Round number warning (potential fake price)
  if (price % 1000 === 0 && price > 10000) {
    warnings.push('💡 السعر رقم مدور - تأكد من دقة السعر');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// ==================== YEAR VALIDATORS ====================

/**
 * Validate vehicle year
 */
export function validateYear(
  year: number,
  options: YearValidationOptions = {}
): ValidationResult {
  const {
    minYear = BULGARIAN_STANDARDS.MIN_YEAR,
    maxYear = BULGARIAN_STANDARDS.MAX_YEAR,
    allowFuture = true
  } = options;
  
  const errors: string[] = [];
  const warnings: string[] = [];
  const currentYear = new Date().getFullYear();
  
  // Basic validation
  if (typeof year !== 'number' || isNaN(year)) {
    errors.push('السنة يجب أن تكون رقماً صحيحاً');
    return { isValid: false, errors, warnings };
  }
  
  // Range validation
  if (year < minYear) {
    errors.push(`السنة قديمة جداً (الحد الأدنى: ${minYear})`);
  }
  
  if (year > maxYear) {
    errors.push(`السنة غير صحيحة (الحد الأقصى: ${maxYear})`);
  }
  
  // Future year validation
  if (!allowFuture && year > currentYear) {
    errors.push('لا يمكن إدخال سنة مستقبلية');
  }
  
  // Classic car warning
  if (year < BULGARIAN_STANDARDS.CLASSIC_CAR_THRESHOLD) {
    warnings.push(`🚗 سيارة كلاسيكية (${currentYear - year} سنة) - تتطلب معلومات خاصة`);
  }
  
  // Very new car warning
  if (year === currentYear || year === currentYear + 1) {
    warnings.push('🆕 سيارة جديدة - تأكد من صحة البيانات');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// ==================== MILEAGE VALIDATORS ====================

/**
 * Validate mileage with suspicious pattern detection
 */
export function validateMileage(
  mileage: number,
  options: MileageValidationOptions = {}
): ValidationResult {
  const {
    unit = 'km',
    maxMileage = BULGARIAN_STANDARDS.MAX_MILEAGE_KM,
    checkSuspicious = true,
    vehicleYear
  } = options;
  
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Convert miles to km if needed
  const mileageInKm = unit === 'miles' ? mileage * 1.60934 : mileage;
  
  // Basic validation
  if (typeof mileage !== 'number' || isNaN(mileage)) {
    errors.push('المسافة المقطوعة يجب أن تكون رقماً صحيحاً');
    return { isValid: false, errors, warnings };
  }
  
  if (mileage < 0) {
    errors.push('المسافة المقطوعة لا يمكن أن تكون سالبة');
  }
  
  if (mileageInKm > maxMileage) {
    errors.push(`المسافة المقطوعة مرتفعة جداً (الحد الأقصى: ${maxMileage.toLocaleString()} كم)`);
  }
  
  // Suspicious mileage checks (if year provided)
  if (checkSuspicious && vehicleYear) {
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - vehicleYear;
    
    if (vehicleAge > 0) {
      const expectedMileage = vehicleAge * BULGARIAN_STANDARDS.AVERAGE_KM_PER_YEAR;
      const highThreshold = expectedMileage * BULGARIAN_STANDARDS.HIGH_MILEAGE_MULTIPLIER;
      const lowThreshold = expectedMileage * BULGARIAN_STANDARDS.LOW_MILEAGE_MULTIPLIER;
      
      // Very high mileage
      if (mileageInKm > highThreshold) {
        warnings.push(
          `⚠️ المسافة المقطوعة مرتفعة جداً للسنة (متوقع: ~${Math.round(expectedMileage).toLocaleString()} كم)`
        );
      }
      
      // Very low mileage (suspicious for old cars)
      if (mileageInKm < lowThreshold && vehicleAge > 1) {
        warnings.push(
          `⚠️ المسافة المقطوعة منخفضة جداً للسنة (متوقع: ~${Math.round(expectedMileage).toLocaleString()} كم)`
        );
      }
      
      // Round number warning
      if (mileageInKm % 10000 === 0 && mileageInKm > 0) {
        warnings.push('💡 المسافة المقطوعة رقم مدور - تأكد من الدقة');
      }
      
      // Zero mileage for old car
      if (mileageInKm === 0 && vehicleAge > 1) {
        warnings.push('⚠️ سيارة بدون مسافة مقطوعة - تأكد من صحة البيانات');
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// ==================== VIN VALIDATORS ====================

/**
 * Validate VIN (Vehicle Identification Number)
 */
export function validateVIN(vin: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!vin || typeof vin !== 'string') {
    errors.push('رقم الشاصي (VIN) مطلوب');
    return { isValid: false, errors, warnings };
  }
  
  const cleanVIN = vin.toUpperCase().replace(/\s/g, '');
  
  // Length check
  if (cleanVIN.length !== BULGARIAN_STANDARDS.VIN_LENGTH) {
    errors.push(`رقم الشاصي يجب أن يحتوي على ${BULGARIAN_STANDARDS.VIN_LENGTH} حرفاً`);
  }
  
  // Character check
  const invalidChars = BULGARIAN_STANDARDS.VIN_EXCLUDED_CHARS;
  const hasInvalidChars = invalidChars.some(char => cleanVIN.includes(char));
  
  if (hasInvalidChars) {
    errors.push(`رقم الشاصي لا يمكن أن يحتوي على الأحرف: ${invalidChars.join(', ')}`);
  }
  
  // Format check (A-Z, 0-9 only)
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
  if (!vinRegex.test(cleanVIN)) {
    errors.push('رقم الشاصي يحتوي على أحرف غير صحيحة');
  }
  
  // Check digit validation (optional - complex algorithm)
  if (errors.length === 0) {
    const isValidCheckDigit = validateVINCheckDigit(cleanVIN);
    if (!isValidCheckDigit) {
      warnings.push('⚠️ رقم الشاصي قد لا يكون صحيحاً - يرجى التحقق');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * VIN check digit validation (ISO 3779 standard)
 */
function validateVINCheckDigit(vin: string): boolean {
  const transliteration: { [key: string]: number } = {
    'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8,
    'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'P': 7, 'R': 9,
    'S': 2, 'T': 3, 'U': 4, 'V': 5, 'W': 6, 'X': 7, 'Y': 8, 'Z': 9
  };
  
  const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
  
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const char = vin[i];
    const value = isNaN(parseInt(char)) ? transliteration[char] || 0 : parseInt(char);
    sum += value * weights[i];
  }
  
  const checkDigit = sum % 11;
  const expectedCheckDigit = checkDigit === 10 ? 'X' : checkDigit.toString();
  
  return vin[8] === expectedCheckDigit;
}

// ==================== PHONE VALIDATORS ====================

/**
 * Validate Bulgarian phone number
 */
export function validateBulgarianPhone(phone: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!phone || typeof phone !== 'string') {
    errors.push('رقم الهاتف مطلوب');
    return { isValid: false, errors, warnings };
  }
  
  const cleanPhone = phone.replace(/\s/g, '');
  
  // Bulgarian mobile format: +359 8X XXX XXXX or 08X XXX XXXX
  if (!BULGARIAN_STANDARDS.BULGARIAN_PHONE_REGEX.test(cleanPhone)) {
    errors.push('رقم الهاتف غير صحيح (الصيغة الصحيحة: +359 8X XXX XXXX أو 08X XXX XXXX)');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// ==================== REGISTRATION VALIDATORS ====================

/**
 * Validate Bulgarian registration number
 */
export function validateBulgarianRegistration(registration: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!registration || typeof registration !== 'string') {
    errors.push('رقم اللوحة مطلوب');
    return { isValid: false, errors, warnings };
  }
  
  const cleanRegistration = registration.toUpperCase().replace(/\s/g, '');
  
  // Bulgarian format: XX1234XX or XX123456
  if (!BULGARIAN_STANDARDS.BULGARIAN_REGISTRATION_REGEX.test(cleanRegistration)) {
    errors.push('رقم اللوحة غير صحيح (الصيغة الصحيحة: XX1234XX أو XX123456)');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// ==================== COMBINED VALIDATORS ====================

/**
 * Validate entire vehicle data
 */
export interface VehicleData {
  make: string;
  model: string;
  year: number;
  mileage?: number;
  price: number;
  vin?: string;
  phone?: string;
  registration?: string;
}

export function validateVehicleData(data: VehicleData): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  
  // Price validation
  const priceResult = validatePrice(data.price);
  allErrors.push(...priceResult.errors);
  allWarnings.push(...priceResult.warnings);
  
  // Year validation
  const yearResult = validateYear(data.year);
  allErrors.push(...yearResult.errors);
  allWarnings.push(...yearResult.warnings);
  
  // Mileage validation
  if (data.mileage !== undefined) {
    const mileageResult = validateMileage(data.mileage, {
      vehicleYear: data.year,
      checkSuspicious: true
    });
    allErrors.push(...mileageResult.errors);
    allWarnings.push(...mileageResult.warnings);
  }
  
  // VIN validation
  if (data.vin) {
    const vinResult = validateVIN(data.vin);
    allErrors.push(...vinResult.errors);
    allWarnings.push(...vinResult.warnings);
  }
  
  // Phone validation
  if (data.phone) {
    const phoneResult = validateBulgarianPhone(data.phone);
    allErrors.push(...phoneResult.errors);
    allWarnings.push(...phoneResult.warnings);
  }
  
  // Registration validation
  if (data.registration) {
    const regResult = validateBulgarianRegistration(data.registration);
    allErrors.push(...regResult.errors);
    allWarnings.push(...regResult.warnings);
  }
  
  // Log validation results
  if (allErrors.length > 0 || allWarnings.length > 0) {
    logger.info('Vehicle validation completed', {
      make: data.make,
      model: data.model,
      year: data.year,
      errorsCount: allErrors.length,
      warningsCount: allWarnings.length
    });
  }
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
}

// ==================== EXPORTS ====================

export const enhancedValidators = {
  validatePrice,
  validateYear,
  validateMileage,
  validateVIN,
  validateBulgarianPhone,
  validateBulgarianRegistration,
  validateVehicleData
};

export default enhancedValidators;
