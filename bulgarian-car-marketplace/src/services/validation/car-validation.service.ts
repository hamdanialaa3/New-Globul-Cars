/**
 * Car Validation Service
 * 
 * Provides comprehensive validation for car listings with quality scoring.
 * Used in sell workflow to ensure high-quality listings.
 * 
 * Features:
 * - Required field validation
 * - Data type validation
 * - Format validation (phone, email, etc.)
 * - Quality scoring (0-100)
 * - Warnings for low-quality data
 */

export interface ValidationError {
  field: string;
  message: string;
  severity: 'critical' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100
  errors: ValidationError[];
  warnings: ValidationError[];
  criticalMissing: string[];
  optionalMissing: string[];
}

export type ValidationMode = 'draft' | 'publish';

interface CarData {
  // Basic Info
  make?: string;
  model?: string;
  year?: number;
  price?: number;
  currency?: string;
  
  // Technical
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  engineSize?: number;
  horsePower?: number;
  
  // Colors
  exteriorColor?: string;
  interiorColor?: string;
  
  // Location
  region?: string;
  city?: string;
  locationData?: any;
  
  // Media
  images?: string[];
  
  // Description
  description?: string;
  
  // Features
  features?: string[];
  options?: string[];
  
  // Seller
  sellerType?: 'private' | 'dealer' | 'company';
  sellerName?: string;
  sellerPhone?: string;
  sellerEmail?: string;
  
  // Vehicle Type
  vehicleType?: string;
  
  // Service History
  serviceHistory?: string;
}

class CarValidationService {
  /**
   * Required fields for publishing
   */
  private readonly REQUIRED_FIELDS: Array<keyof CarData> = [
    'make',
    'model',
    'year',
    'price',
    'mileage',
    'fuelType',
    'transmission',
    'vehicleType',
    'sellerType',
    'sellerPhone'
  ];

  /**
   * Recommended fields for high quality score
   */
  private readonly RECOMMENDED_FIELDS: Array<keyof CarData> = [
    'engineSize',
    'horsePower',
    'exteriorColor',
    'interiorColor',
    'description',
    'images',
    'features',
    'region',
    'city'
  ];

  /**
   * Validate car data
   */
  validate(carData: CarData, mode: ValidationMode = 'publish'): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const criticalMissing: string[] = [];
    const optionalMissing: string[] = [];

    // Draft mode: Only basic validation
    if (mode === 'draft') {
      return {
        isValid: true,
        score: this.calculateScore(carData),
        errors: [],
        warnings: [],
        criticalMissing: [],
        optionalMissing: []
      };
    }

    // Publish mode: Full validation

    // 1. Check required fields
    for (const field of this.REQUIRED_FIELDS) {
      if (!carData[field]) {
        criticalMissing.push(field);
        errors.push({
          field,
          message: `${field} is required`,
          severity: 'critical'
        });
      }
    }

    // 2. Validate data types and formats
    if (carData.make) {
      if (typeof carData.make !== 'string' || carData.make.length < 2) {
        errors.push({
          field: 'make',
          message: 'Make must be at least 2 characters',
          severity: 'critical'
        });
      }
    }

    if (carData.model) {
      if (typeof carData.model !== 'string' || carData.model.length < 1) {
        errors.push({
          field: 'model',
          message: 'Model must be at least 1 character',
          severity: 'critical'
        });
      }
    }

    if (carData.year) {
      const currentYear = new Date().getFullYear();
      if (carData.year < 1900 || carData.year > currentYear + 1) {
        errors.push({
          field: 'year',
          message: `Year must be between 1900 and ${currentYear + 1}`,
          severity: 'critical'
        });
      }
    }

    if (carData.price) {
      if (carData.price < 0) {
        errors.push({
          field: 'price',
          message: 'Price cannot be negative',
          severity: 'critical'
        });
      }
      if (carData.price > 10000000) {
        warnings.push({
          field: 'price',
          message: 'Price seems unusually high. Please verify.',
          severity: 'warning'
        });
      }
    }

    if (carData.mileage) {
      if (carData.mileage < 0) {
        errors.push({
          field: 'mileage',
          message: 'Mileage cannot be negative',
          severity: 'critical'
        });
      }
      if (carData.mileage > 500000) {
        warnings.push({
          field: 'mileage',
          message: 'Mileage seems unusually high. Please verify.',
          severity: 'warning'
        });
      }
    }

    // 3. Validate phone number
    if (carData.sellerPhone) {
      const phoneRegex = /^\+?[0-9]{8,15}$/;
      if (!phoneRegex.test(carData.sellerPhone.replace(/[\s\-()]/g, ''))) {
        errors.push({
          field: 'sellerPhone',
          message: 'Invalid phone number format',
          severity: 'critical'
        });
      }
    }

    // 4. Validate email if provided
    if (carData.sellerEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(carData.sellerEmail)) {
        errors.push({
          field: 'sellerEmail',
          message: 'Invalid email format',
          severity: 'critical'
        });
      }
    }

    // 5. Check recommended fields (warnings)
    for (const field of this.RECOMMENDED_FIELDS) {
      if (!carData[field] || (Array.isArray(carData[field]) && (carData[field] as any[]).length === 0)) {
        optionalMissing.push(field);
        
        // Only warn for important fields
        if (['images', 'description', 'region'].includes(field)) {
          warnings.push({
            field,
            message: `Adding ${field} will improve listing quality`,
            severity: 'warning'
          });
        }
      }
    }

    // 6. Validate images
    if (carData.images) {
      if (carData.images.length === 0) {
        warnings.push({
          field: 'images',
          message: 'Adding images will significantly improve listing quality',
          severity: 'warning'
        });
      } else if (carData.images.length < 3) {
        warnings.push({
          field: 'images',
          message: 'We recommend adding at least 5 images for best results',
          severity: 'warning'
        });
      }
    }

    // 7. Validate description
    if (carData.description) {
      if (carData.description.length < 50) {
        warnings.push({
          field: 'description',
          message: 'Description should be at least 50 characters for better visibility',
          severity: 'warning'
        });
      }
      if (carData.description.length < 20) {
        errors.push({
          field: 'description',
          message: 'Description is too short (minimum 20 characters)',
          severity: 'critical'
        });
      }
    }

    // 8. Calculate quality score
    const score = this.calculateScore(carData);

    // 9. Determine if valid
    const isValid = errors.length === 0;

    return {
      isValid,
      score,
      errors,
      warnings,
      criticalMissing,
      optionalMissing
    };
  }

  /**
   * Calculate quality score (0-100)
   */
  private calculateScore(carData: CarData): number {
    let score = 0;

    // Required fields (60 points total - 6 points each)
    const requiredFieldScore = this.REQUIRED_FIELDS.reduce((sum, field) => {
      return sum + (carData[field] ? 6 : 0);
    }, 0);
    score += Math.min(requiredFieldScore, 60);

    // Images (15 points)
    if (carData.images && carData.images.length > 0) {
      score += Math.min(carData.images.length * 3, 15);
    }

    // Description quality (10 points)
    if (carData.description) {
      if (carData.description.length >= 150) {
        score += 10;
      } else if (carData.description.length >= 100) {
        score += 7;
      } else if (carData.description.length >= 50) {
        score += 4;
      }
    }

    // Features and options (10 points)
    const featuresCount = (carData.features?.length || 0) + (carData.options?.length || 0);
    score += Math.min(featuresCount * 2, 10);

    // Service history (5 points)
    if (carData.serviceHistory && carData.serviceHistory.length > 0) {
      score += 5;
    }

    return Math.min(Math.round(score), 100);
  }

  /**
   * Get validation message for field
   */
  getFieldMessage(field: string, language: 'bg' | 'en' = 'en'): string {
    const messages: Record<string, { bg: string; en: string }> = {
      make: {
        bg: 'Марката е задължителна',
        en: 'Make is required'
      },
      model: {
        bg: 'Моделът е задължителен',
        en: 'Model is required'
      },
      year: {
        bg: 'Годината е задължителна',
        en: 'Year is required'
      },
      price: {
        bg: 'Цената е задължителна',
        en: 'Price is required'
      },
      mileage: {
        bg: 'Пробегът е задължителен',
        en: 'Mileage is required'
      },
      fuelType: {
        bg: 'Типът гориво е задължителен',
        en: 'Fuel type is required'
      },
      transmission: {
        bg: 'Скоростната кутия е задължителна',
        en: 'Transmission is required'
      },
      sellerPhone: {
        bg: 'Телефонният номер е задължителен',
        en: 'Phone number is required'
      },
      images: {
        bg: 'Добавете поне 1 снимка',
        en: 'Add at least 1 image'
      },
      description: {
        bg: 'Описанието е задължително',
        en: 'Description is required'
      }
    };

    return messages[field]?.[language] || messages[field]?.en || 'Field is required';
  }

  /**
   * Validate specific field
   */
  validateField(
    fieldName: string,
    value: any,
    options: { required?: boolean; min?: number; max?: number } = {},
    language: 'bg' | 'en' = 'en'
  ): string | null {
    // Required check
    if (options.required && !value) {
      return this.getFieldMessage(fieldName, language);
    }

    // Type-specific validation
    if (value) {
      // Number validation
      if (typeof value === 'number') {
        if (options.min !== undefined && value < options.min) {
          return language === 'bg' 
            ? `Минималната стойност е ${options.min}`
            : `Minimum value is ${options.min}`;
        }
        if (options.max !== undefined && value > options.max) {
          return language === 'bg'
            ? `Максималната стойност е ${options.max}`
            : `Maximum value is ${options.max}`;
        }
      }

      // String validation
      if (typeof value === 'string') {
        if (options.min !== undefined && value.length < options.min) {
          return language === 'bg'
            ? `Минималната дължина е ${options.min} символа`
            : `Minimum length is ${options.min} characters`;
        }
        if (options.max !== undefined && value.length > options.max) {
          return language === 'bg'
            ? `Максималната дължина е ${options.max} символа`
            : `Maximum length is ${options.max} characters`;
        }
      }
    }

    return null;
  }
}

export const carValidationService = new CarValidationService();
