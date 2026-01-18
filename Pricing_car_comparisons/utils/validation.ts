/**
 * التحقق من صحة البيانات
 * Validation Utilities
 */

import { CarSpecs } from '../types/pricing.types';

export const validateCarSpecs = (specs: Partial<CarSpecs>): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!specs.brand || specs.brand.trim().length === 0) {
    errors.push('Brand is required');
  }

  if (!specs.model || specs.model.trim().length === 0) {
    errors.push('Model is required');
  }

  if (!specs.category) {
    errors.push('Category is required');
  }

  if (!specs.year || specs.year < 1900 || specs.year > new Date().getFullYear() + 1) {
    errors.push('Year must be between 1900 and current year + 1');
  }

  if (!specs.mileage || specs.mileage < 0 || specs.mileage > 1000000) {
    errors.push('Mileage must be between 0 and 1,000,000 km');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const validateYear = (year: number): boolean => {
  const currentYear = new Date().getFullYear();
  return year >= 1900 && year <= currentYear + 1;
};

export const validateMileage = (mileage: number): boolean => {
  return mileage >= 0 && mileage <= 1000000;
};
