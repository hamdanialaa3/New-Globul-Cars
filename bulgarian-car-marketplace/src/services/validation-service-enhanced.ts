// Enhanced validation service with comprehensive rules
import { serviceLogger } from './logger-service';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  email?: boolean;
  phone?: boolean;
  url?: boolean;
  date?: boolean;
  number?: boolean;
  year?: boolean;
  mileage?: boolean;
  price?: boolean;
  vin?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

class ValidationService {
  private static instance: ValidationService;

  private constructor() {}

  static getInstance(): ValidationService {
    if (!this.instance) {
      this.instance = new ValidationService();
    }
    return this.instance;
  }

  /**
   * Validate a single field
   */
  validateField(
    fieldName: string,
    value: any,
    rules: ValidationRule,
    language: 'bg' | 'en' = 'bg'
  ): string | null {
    // Required check
    if (rules.required && this.isEmpty(value)) {
      return this.getErrorMessage('required', language);
    }

    // Skip further validation if empty and not required
    if (this.isEmpty(value)) {
      return null;
    }

    // String length validation
    if (rules.minLength && String(value).length < rules.minLength) {
      return this.getErrorMessage('minLength', language, { min: rules.minLength });
    }

    if (rules.maxLength && String(value).length > rules.maxLength) {
      return this.getErrorMessage('maxLength', language, { max: rules.maxLength });
    }

    // Number range validation
    if (rules.min !== undefined && Number(value) < rules.min) {
      return this.getErrorMessage('min', language, { min: rules.min });
    }

    if (rules.max !== undefined && Number(value) > rules.max) {
      return this.getErrorMessage('max', language, { max: rules.max });
    }

    // Email validation
    if (rules.email && !this.isValidEmail(value)) {
      return this.getErrorMessage('email', language);
    }

    // Phone validation (Bulgarian)
    if (rules.phone && !this.isValidBulgarianPhone(value)) {
      return this.getErrorMessage('phone', language);
    }

    // URL validation
    if (rules.url && !this.isValidURL(value)) {
      return this.getErrorMessage('url', language);
    }

    // Year validation (1900-current+1)
    if (rules.year && !this.isValidYear(value)) {
      return this.getErrorMessage('year', language);
    }

    // Mileage validation
    if (rules.mileage && !this.isValidMileage(value)) {
      return this.getErrorMessage('mileage', language);
    }

    // Price validation
    if (rules.price && !this.isValidPrice(value)) {
      return this.getErrorMessage('price', language);
    }

    // VIN validation (17 characters)
    if (rules.vin && !this.isValidVIN(value)) {
      return this.getErrorMessage('vin', language);
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(String(value))) {
      return this.getErrorMessage('pattern', language);
    }

    // Custom validation
    if (rules.custom && !rules.custom(value)) {
      return this.getErrorMessage('custom', language);
    }

    return null;
  }

  /**
   * Validate multiple fields
   */
  validateForm(
    data: Record<string, any>,
    rules: Record<string, ValidationRule>,
    language: 'bg' | 'en' = 'bg'
  ): ValidationResult {
    const errors: string[] = [];

    Object.keys(rules).forEach(fieldName => {
      const error = this.validateField(
        fieldName,
        data[fieldName],
        rules[fieldName],
        language
      );
      if (error) {
        errors.push(`${fieldName}: ${error}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Helper: Check if value is empty
   */
  private isEmpty(value: any): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  }

  /**
   * Helper: Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Helper: Validate Bulgarian phone (starts with +359 or 0, 9-10 digits)
   */
  private isValidBulgarianPhone(phone: string): boolean {
    // Remove spaces and dashes
    const cleaned = phone.replace(/[\s-]/g, '');
    
    // Bulgarian phone patterns:
    // +359 XXX XXX XXX (international)
    // 0XXX XXX XXX (local)
    const patterns = [
      /^\+359\d{9}$/,  // +359 followed by 9 digits
      /^0\d{9}$/,      // 0 followed by 9 digits
    ];

    return patterns.some(pattern => pattern.test(cleaned));
  }

  /**
   * Helper: Validate URL format
   */
  private isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Helper: Validate year (1900 to current year + 1)
   */
  private isValidYear(year: any): boolean {
    const yearNum = Number(year);
    const currentYear = new Date().getFullYear();
    return yearNum >= 1900 && yearNum <= currentYear + 1;
  }

  /**
   * Helper: Validate mileage (0 to 1,000,000 km)
   */
  private isValidMileage(mileage: any): boolean {
    const mileageNum = Number(mileage);
    return mileageNum >= 0 && mileageNum <= 1000000;
  }

  /**
   * Helper: Validate price (0 to 10,000,000 BGN)
   */
  private isValidPrice(price: any): boolean {
    const priceNum = Number(price);
    return priceNum >= 0 && priceNum <= 10000000;
  }

  /**
   * Helper: Validate VIN (17 alphanumeric characters)
   */
  private isValidVIN(vin: string): boolean {
    // VIN must be exactly 17 characters, alphanumeric (no I, O, Q)
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
    return vinRegex.test(vin.toUpperCase());
  }

  /**
   * Get error message based on type and language
   */
  private getErrorMessage(
    type: string,
    language: 'bg' | 'en',
    params?: Record<string, any>
  ): string {
    const messages = {
      bg: {
        required: 'Това поле е задължително',
        minLength: `Минимална дължина: ${params?.min} символа`,
        maxLength: `Максимална дължина: ${params?.max} символа`,
        min: `Минимална стойност: ${params?.min}`,
        max: `Максимална стойност: ${params?.max}`,
        email: 'Невалиден имейл адрес',
        phone: 'Невалиден телефонен номер (използвайте формат: +359 XXX XXX XXX или 0XXX XXX XXX)',
        url: 'Невалиден URL адрес',
        year: 'Невалидна година (трябва да е между 1900 и текущата година)',
        mileage: 'Невалиден пробег (0 - 1,000,000 км)',
        price: 'Невалидна цена (0 - 10,000,000 лв)',
        vin: 'Невалиден VIN номер (трябва да е 17 символа)',
        pattern: 'Невалиден формат',
        custom: 'Невалидна стойност',
      },
      en: {
        required: 'This field is required',
        minLength: `Minimum length: ${params?.min} characters`,
        maxLength: `Maximum length: ${params?.max} characters`,
        min: `Minimum value: ${params?.min}`,
        max: `Maximum value: ${params?.max}`,
        email: 'Invalid email address',
        phone: 'Invalid phone number (use format: +359 XXX XXX XXX or 0XXX XXX XXX)',
        url: 'Invalid URL',
        year: 'Invalid year (must be between 1900 and current year)',
        mileage: 'Invalid mileage (0 - 1,000,000 km)',
        price: 'Invalid price (0 - 10,000,000 BGN)',
        vin: 'Invalid VIN number (must be 17 characters)',
        pattern: 'Invalid format',
        custom: 'Invalid value',
      },
    };

    return messages[language][type as keyof typeof messages.bg] || messages[language].custom;
  }

  /**
   * Validate VehicleData form (specific to car selling workflow)
   */
  validateVehicleData(data: any, language: 'bg' | 'en' = 'bg'): ValidationResult {
    const rules: Record<string, ValidationRule> = {
      make: { required: true },
      model: { required: true },
      year: { required: true, year: true },
      mileage: { required: true, mileage: true },
      fuelType: { required: true },
      transmission: { required: true },
      bodyType: { required: true },
      color: { required: true },
      engineSize: { min: 0, max: 10000 },
      power: { min: 0, max: 2000 },
    };

    return this.validateForm(data, rules, language);
  }

  /**
   * Validate pricing form
   */
  validatePricing(data: any, language: 'bg' | 'en' = 'bg'): ValidationResult {
    const rules: Record<string, ValidationRule> = {
      price: { required: true, price: true },
      currency: { required: true },
    };

    return this.validateForm(data, rules, language);
  }

  /**
   * Validate contact form
   */
  validateContact(data: any, language: 'bg' | 'en' = 'bg'): ValidationResult {
    const rules: Record<string, ValidationRule> = {
      name: { required: true, minLength: 2, maxLength: 100 },
      email: { required: true, email: true },
      phone: { required: true, phone: true },
    };

    return this.validateForm(data, rules, language);
  }
}

export const validationService = ValidationService.getInstance();
export default validationService;
