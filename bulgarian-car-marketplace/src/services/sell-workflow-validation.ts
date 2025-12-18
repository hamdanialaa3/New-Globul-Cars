// sell-workflow-validation.ts - Validation utilities for sell workflow
// Split from sellWorkflowService.ts to comply with 300-line limit

import { logger } from './logger-service';
import { WorkflowData, WorkflowValidationResult, WorkflowProgress } from './sell-workflow-types';

export class SellWorkflowValidation {
  /**
   * Validate complete workflow data
   */
  static validateWorkflowData(workflowData: WorkflowData): WorkflowValidationResult {
    const errors: Record<string, string[]> = {};
    const warnings: Record<string, string[]> = {};

    // Required fields validation
    this.validateRequiredFields(workflowData, errors);

    // Data type validation
    this.validateDataTypes(workflowData, errors);

    // Business logic validation
    this.validateBusinessRules(workflowData, errors, warnings);

    // Cross-field validation
    this.validateCrossFieldRules(workflowData, errors, warnings);

    const isValid = Object.keys(errors).length === 0;

    if (!isValid) {
      logger.warn('Workflow validation failed', { errors, warnings });
    } else {
      logger.info('Workflow validation passed', { warnings: Object.keys(warnings).length });
    }

    return { isValid, errors, warnings };
  }

  /**
   * Validate workflow progress
   */
  static validateWorkflowProgress(progress: WorkflowProgress): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (progress.currentStep < 1 || progress.currentStep > progress.totalSteps) {
      errors.push('Invalid current step');
    }

    if (progress.completedSteps > progress.totalSteps) {
      errors.push('Completed steps cannot exceed total steps');
    }

    if (progress.steps.length !== progress.totalSteps) {
      errors.push('Steps array length must match total steps');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate required fields
   */
  private static validateRequiredFields(workflowData: WorkflowData, errors: Record<string, string[]>): void {
    const requiredFields = [
      'vehicleType',
      'make',
      'model',
      'year',
      'mileage',
      'fuelType',
      'transmission',
      'sellerName',
      'sellerEmail',
      'sellerPhone',
      'price'
    ];

    requiredFields.forEach(field => {
      if (!workflowData[field] || (typeof workflowData[field] === 'string' && !workflowData[field].trim())) {
        if (!errors[field]) errors[field] = [];
        errors[field].push(`${field} is required`);
      }
    });
  }

  /**
   * Validate data types
   */
  private static validateDataTypes(workflowData: WorkflowData, errors: Record<string, string[]>): void {
    // Year validation
    if (workflowData.year) {
      const year = typeof workflowData.year === 'string' ? parseInt(workflowData.year) : workflowData.year;
      if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
        if (!errors.year) errors.year = [];
        errors.year.push('Invalid year');
      }
    }

    // Mileage validation
    if (workflowData.mileage) {
      const mileage = typeof workflowData.mileage === 'string' ? parseInt(workflowData.mileage) : workflowData.mileage;
      if (isNaN(mileage) || mileage < 0 || mileage > 1000000) {
        if (!errors.mileage) errors.mileage = [];
        errors.mileage.push('Invalid mileage');
      }
    }

    // Price validation
    if (workflowData.price) {
      const price = typeof workflowData.price === 'string' ? parseFloat(workflowData.price) : workflowData.price;
      if (isNaN(price) || price <= 0 || price > 10000000) {
        if (!errors.price) errors.price = [];
        errors.price.push('Invalid price');
      }
    }

    // Email validation
    if (workflowData.sellerEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(workflowData.sellerEmail)) {
        if (!errors.sellerEmail) errors.sellerEmail = [];
        errors.sellerEmail.push('Invalid email format');
      }
    }

    // Phone validation (Bulgarian format)
    if (workflowData.sellerPhone) {
      const phoneRegex = /^(\+359|0)(87|88|89|98|99|43|44)[0-9]{7}$/;
      const cleanPhone = workflowData.sellerPhone.replace(/\s+/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        if (!errors.sellerPhone) errors.sellerPhone = [];
        errors.sellerPhone.push('Invalid Bulgarian phone number');
      }
    }
  }

  /**
   * Validate business rules
   */
  private static validateBusinessRules(
    workflowData: WorkflowData,
    errors: Record<string, string[]>,
    warnings: Record<string, string[]>
  ): void {
    const currentYear = new Date().getFullYear();

    // New car mileage warning
    if (workflowData.condition === 'new' && workflowData.mileage && workflowData.mileage > 100) {
      if (!warnings.mileage) warnings.mileage = [];
      warnings.mileage.push('New car with mileage - verify authenticity');
    }

    // Old car warning
    if (workflowData.year && workflowData.year < currentYear - 20) {
      if (!warnings.year) warnings.year = [];
      warnings.year.push('Very old car - may need special inspection');
    }

    // High price warning
    if (workflowData.price && workflowData.price > 500000) {
      if (!warnings.price) warnings.price = [];
      warnings.price.push('High price - consider verification');
    }

    // Fuel type and vehicle type compatibility
    if (workflowData.vehicleType === 'motorcycle' && !['petrol', 'electric'].includes(workflowData.fuelType)) {
      if (!errors.fuelType) errors.fuelType = [];
      errors.fuelType.push('Invalid fuel type for motorcycle');
    }
  }

  /**
   * Validate cross-field rules
   */
  private static validateCrossFieldRules(
    workflowData: WorkflowData,
    errors: Record<string, string[]>,
    warnings: Record<string, string[]>
  ): void {
    // Electric cars shouldn't have mileage over certain limit
    if (workflowData.fuelType === 'electric' && workflowData.mileage && workflowData.mileage > 500000) {
      if (!warnings.mileage) warnings.mileage = [];
      warnings.mileage.push('High mileage for electric vehicle');
    }

    // Price consistency with vehicle type
    if (workflowData.vehicleType && workflowData.price) {
      const priceLimits: Record<string, { min: number; max: number }> = {
        'motorcycle': { min: 500, max: 50000 },
        'car': { min: 1000, max: 200000 },
        'suv': { min: 2000, max: 300000 },
        'van': { min: 1500, max: 150000 },
        'truck': { min: 2000, max: 500000 },
        'bus': { min: 5000, max: 1000000 }
      };

      const limits = priceLimits[workflowData.vehicleType];
      if (limits) {
        if (workflowData.price < limits.min) {
          if (!warnings.price) warnings.price = [];
          warnings.price.push(`Price seems low for ${workflowData.vehicleType}`);
        } else if (workflowData.price > limits.max) {
          if (!warnings.price) warnings.price = [];
          warnings.price.push(`Price seems high for ${workflowData.vehicleType}`);
        }
      }
    }
  }

  /**
   * Validate image requirements
   */
  static validateImages(images: string[], vehicleType: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const minImages = vehicleType === 'motorcycle' ? 2 : 3;
    const maxImages = 20;

    if (!images || images.length < minImages) {
      errors.push(`At least ${minImages} images required`);
    }

    if (images && images.length > maxImages) {
      errors.push(`Maximum ${maxImages} images allowed`);
    }

    // Validate URLs
    if (images) {
      images.forEach((url, index) => {
        if (!url || typeof url !== 'string') {
          errors.push(`Invalid image URL at position ${index + 1}`);
        } else if (!url.startsWith('http')) {
          errors.push(`Image URL must be a valid HTTP/HTTPS URL at position ${index + 1}`);
        }
      });
    }

    return { isValid: errors.length === 0, errors };
  }
}