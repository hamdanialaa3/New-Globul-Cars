// src/services/validation-service.ts
// Comprehensive Input Validation Service for Bulgarian Car Marketplace

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationRules {
  [fieldName: string]: ValidationRule;
}

export class ValidationService {
  private static instance: ValidationService;

  // Common regex patterns
  private static readonly PATTERNS = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    phone: /^(\+359|0)[0-9]{8,9}$/, // Bulgarian phone numbers
    postalCode: /^[0-9]{4}$/, // Bulgarian postal codes
    vin: /^[A-HJ-NPR-Z0-9]{17}$/, // Vehicle VIN
    licensePlate: /^[ABCEHKMPTXY][0-9]{4}[ABCEHKMPTXY]{2}$/, // Bulgarian license plates
    taxNumber: /^[0-9]{9,10}$/, // Bulgarian tax numbers
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/
  };

  // Localized error messages
  private static readonly ERROR_MESSAGES = {
    bg: {
      required: 'Това поле е задължително',
      minLength: 'Минимум {min} символа',
      maxLength: 'Максимум {max} символа',
      pattern: 'Невалиден формат',
      email: 'Невалиден имейл адрес',
      phone: 'Невалиден телефонен номер',
      postalCode: 'Невалиден пощенски код',
      vin: 'Невалиден VIN номер',
      licensePlate: 'Невалидна регистрационна табела',
      taxNumber: 'Невалиден данъчен номер',
      password: 'Паролата трябва да съдържа поне 8 символа, включително главна буква, малка буква, цифра и специален символ',
      positiveNumber: 'Числото трябва да е положително',
      validYear: 'Годината трябва да е между 1900 и {current}',
      validPrice: 'Цената трябва да е между 100 и 1,000,000 евро',
      validMileage: 'Пробегът трябва да е между 0 и 1,000,000 км'
    },
    en: {
      required: 'This field is required',
      minLength: 'Minimum {min} characters',
      maxLength: 'Maximum {max} characters',
      pattern: 'Invalid format',
      email: 'Invalid email address',
      phone: 'Invalid phone number',
      postalCode: 'Invalid postal code',
      vin: 'Invalid VIN number',
      licensePlate: 'Invalid license plate',
      taxNumber: 'Invalid tax number',
      password: 'Password must contain at least 8 characters including uppercase, lowercase, digit and special character',
      positiveNumber: 'Number must be positive',
      validYear: 'Year must be between 1900 and {current}',
      validPrice: 'Price must be between 100 and 1,000,000 euros',
      validMileage: 'Mileage must be between 0 and 1,000,000 km'
    }
  };

  private constructor() {}

  public static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  /**
   * Validate a single field
   */
  public validateField(
    fieldName: string,
    value: any,
    rules: ValidationRule,
    language: 'bg' | 'en' = 'bg'
  ): string | null {
    const messages = ValidationService.ERROR_MESSAGES[language];

    // Check if required
    if (rules.required && (value === null || value === undefined || value === '')) {
      return messages.required;
    }

    // Skip other validations if value is empty and not required
    if (!rules.required && (value === null || value === undefined || value === '')) {
      return null;
    }

    const stringValue = String(value).trim();

    // Check min length
    if (rules.minLength && stringValue.length < rules.minLength) {
      return messages.minLength.replace('{min}', rules.minLength.toString());
    }

    // Check max length
    if (rules.maxLength && stringValue.length > rules.maxLength) {
      return messages.maxLength.replace('{max}', rules.maxLength.toString());
    }

    // Check pattern
    if (rules.pattern && !rules.pattern.test(stringValue)) {
      return messages.pattern;
    }

    // Check custom validation
    if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) {
        return customError;
      }
    }

    return null;
  }

  /**
   * Validate multiple fields
   */
  public validateFields(
    data: Record<string, any>,
    rules: ValidationRules,
    language: 'bg' | 'en' = 'bg'
  ): ValidationResult {
    const errors: Record<string, string> = {};

    for (const [fieldName, fieldRules] of Object.entries(rules)) {
      const value = data[fieldName];
      const error = this.validateField(fieldName, value, fieldRules, language);
      
      if (error) {
        errors[fieldName] = error;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validate user registration data
   */
  public validateUserRegistration(
    data: {
      email: string;
      password: string;
      confirmPassword: string;
      firstName: string;
      lastName: string;
      phone?: string;
      preferredLanguage: 'bg' | 'en';
    },
    language: 'bg' | 'en' = 'bg'
  ): ValidationResult {
    const rules: ValidationRules = {
      email: {
        required: true,
        pattern: ValidationService.PATTERNS.email
      },
      password: {
        required: true,
        minLength: 8,
        pattern: ValidationService.PATTERNS.password
      },
      confirmPassword: {
        required: true,
        custom: (value) => {
          if (value !== data.password) {
            return language === 'bg' 
              ? 'Паролите не съвпадат'
              : 'Passwords do not match';
          }
          return null;
        }
      },
      firstName: {
        required: true,
        minLength: 2,
        maxLength: 50
      },
      lastName: {
        required: true,
        minLength: 2,
        maxLength: 50
      },
      phone: {
        pattern: ValidationService.PATTERNS.phone
      }
    };

    return this.validateFields(data, rules, language);
  }

  /**
   * Validate car listing data
   */
  public validateCarListing(
    data: {
      make: string;
      model: string;
      year: number;
      price: number;
      mileage: number;
      fuelType: string;
      transmission: string;
      bodyType: string;
      color: string;
      vin?: string;
      licensePlate?: string;
      description?: string;
      location: string;
    },
    language: 'bg' | 'en' = 'bg'
  ): ValidationResult {
    const currentYear = new Date().getFullYear();
    const rules: ValidationRules = {
      make: {
        required: true,
        minLength: 2,
        maxLength: 50
      },
      model: {
        required: true,
        minLength: 2,
        maxLength: 50
      },
      year: {
        required: true,
        custom: (value) => {
          const year = Number(value);
          if (isNaN(year) || year < 1900 || year > currentYear + 1) {
            const messages = ValidationService.ERROR_MESSAGES[language];
            return messages.validYear.replace('{current}', (currentYear + 1).toString());
          }
          return null;
        }
      },
      price: {
        required: true,
        custom: (value) => {
          const price = Number(value);
          if (isNaN(price) || price < 100 || price > 1000000) {
            const messages = ValidationService.ERROR_MESSAGES[language];
            return messages.validPrice;
          }
          return null;
        }
      },
      mileage: {
        required: true,
        custom: (value) => {
          const mileage = Number(value);
          if (isNaN(mileage) || mileage < 0 || mileage > 1000000) {
            const messages = ValidationService.ERROR_MESSAGES[language];
            return messages.validMileage;
          }
          return null;
        }
      },
      fuelType: {
        required: true
      },
      transmission: {
        required: true
      },
      bodyType: {
        required: true
      },
      color: {
        required: true,
        minLength: 2,
        maxLength: 30
      },
      vin: {
        pattern: ValidationService.PATTERNS.vin
      },
      licensePlate: {
        pattern: ValidationService.PATTERNS.licensePlate
      },
      description: {
        maxLength: 2000
      },
      location: {
        required: true,
        minLength: 2,
        maxLength: 100
      }
    };

    return this.validateFields(data, rules, language);
  }

  /**
   * Validate dealer information
   */
  public validateDealerInfo(
    data: {
      companyName: string;
      taxNumber: string;
      address: string;
      city: string;
      postalCode: string;
      phone: string;
      email: string;
      website?: string;
    },
    language: 'bg' | 'en' = 'bg'
  ): ValidationResult {
    const rules: ValidationRules = {
      companyName: {
        required: true,
        minLength: 2,
        maxLength: 100
      },
      taxNumber: {
        required: true,
        pattern: ValidationService.PATTERNS.taxNumber
      },
      address: {
        required: true,
        minLength: 5,
        maxLength: 200
      },
      city: {
        required: true,
        minLength: 2,
        maxLength: 50
      },
      postalCode: {
        required: true,
        pattern: ValidationService.PATTERNS.postalCode
      },
      phone: {
        required: true,
        pattern: ValidationService.PATTERNS.phone
      },
      email: {
        required: true,
        pattern: ValidationService.PATTERNS.email
      },
      website: {
        pattern: /^https?:\/\/.+\..+$/
      }
    };

    return this.validateFields(data, rules, language);
  }

  /**
   * Sanitize input to prevent XSS
   */
  public sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Validate and sanitize search query
   */
  public validateSearchQuery(query: string, language: 'bg' | 'en' = 'bg'): {
    isValid: boolean;
    sanitizedQuery: string;
    error?: string;
  } {
    const sanitized = this.sanitizeInput(query);
    
    if (sanitized.length < 2) {
      return {
        isValid: false,
        sanitizedQuery: '',
        error: language === 'bg' 
          ? 'Търсенето трябва да съдържа поне 2 символа'
          : 'Search must contain at least 2 characters'
      };
    }

    if (sanitized.length > 100) {
      return {
        isValid: false,
        sanitizedQuery: '',
        error: language === 'bg'
          ? 'Търсенето не може да бъде повече от 100 символа'
          : 'Search cannot be more than 100 characters'
      };
    }

    return {
      isValid: true,
      sanitizedQuery: sanitized
    };
  }

  /**
   * Validate file upload
   */
  public validateFileUpload(
    file: File,
    options: {
      maxSize?: number; // in bytes
      allowedTypes?: string[];
      maxDimensions?: { width: number; height: number };
    } = {},
    language: 'bg' | 'en' = 'bg'
  ): { isValid: boolean; error?: string } {
    const messages = ValidationService.ERROR_MESSAGES[language];

    // Check file size (default 10MB)
    const maxSize = options.maxSize || 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: language === 'bg'
          ? `Файлът е твърде голям. Максимален размер: ${Math.round(maxSize / 1024 / 1024)}MB`
          : `File is too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`
      };
    }

    // Check file type
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: language === 'bg'
          ? `Невалиден тип файл. Разрешени типове: ${options.allowedTypes.join(', ')}`
          : `Invalid file type. Allowed types: ${options.allowedTypes.join(', ')}`
      };
    }

    return { isValid: true };
  }
}

// Export singleton instance
export const validator = ValidationService.getInstance();

// Helper functions
export const validateUserRegistration = (
  data: any,
  language: 'bg' | 'en' = 'bg'
): ValidationResult => {
  return validator.validateUserRegistration(data, language);
};

export const validateCarListing = (
  data: any,
  language: 'bg' | 'en' = 'bg'
): ValidationResult => {
  return validator.validateCarListing(data, language);
};

export const sanitizeInput = (input: string): string => {
  return validator.sanitizeInput(input);
};
