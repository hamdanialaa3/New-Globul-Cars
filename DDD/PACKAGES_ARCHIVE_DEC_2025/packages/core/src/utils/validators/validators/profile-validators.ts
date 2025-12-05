/**
 * Profile Validators
 * Phase 4 (A1): Validation Layer using Zod
 * 
 * Usage:
 * import { validateDealershipInfo } from '@globul-cars/core/utilsvalidators/profile-validators';
 * const result = validateDealershipInfo(data);
 * if (!result.success) { handle errors }
 */

import { z } from 'zod';

// ✅ Dealership Validation Schema
export const DealershipInfoSchema = z.object({
  uid: z.string().min(1, 'User ID is required'),
  dealershipNameBG: z.string().min(2, 'Bulgarian name must be at least 2 characters').max(100),
  dealershipNameEN: z.string().min(2, 'English name must be at least 2 characters').max(100).optional(),
  vatNumber: z.string().regex(/^BG\d{9,10}$/, 'Invalid Bulgarian VAT number (format: BG123456789)').optional(),
  companyRegNumber: z.string().min(1, 'Company registration number is required'),
  legalForm: z.enum(['EOOD', 'OOD', 'AD', 'ET', 'KD', 'KDA', 'SD']),
  
  address: z.object({
    street: z.string().min(1, 'Street is required'),
    number: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    postalCode: z.string().regex(/^\d{4}$/, 'Invalid postal code (4 digits)'),
    region: z.string().min(1, 'Region is required')
  }),
  
  primaryPhone: z.string().regex(/^\+?359\d{9}$/, 'Invalid Bulgarian phone number'),
  secondaryPhone: z.string().regex(/^\+?359\d{9}$/, 'Invalid phone number').optional(),
  officialEmail: z.string().email('Invalid email address'),
  website: z.string().url('Invalid website URL').optional(),
  
  totalCarsAvailable: z.number().int().min(0).default(0),
  verified: z.boolean().default(false),
  featuredDealer: z.boolean().default(false)
});

export type DealershipInfoInput = z.infer<typeof DealershipInfoSchema>;

// ✅ Company Validation Schema
export const CompanyInfoSchema = z.object({
  uid: z.string().min(1),
  companyNameBG: z.string().min(2).max(100),
  companyNameEN: z.string().min(2).max(100).optional(),
  vatNumber: z.string().regex(/^BG\d{9,10}$/),
  companyRegNumber: z.string().min(1),
  
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    postalCode: z.string().regex(/^\d{4}$/),
    region: z.string().min(1)
  }),
  
  primaryPhone: z.string().regex(/^\+?359\d{9}$/),
  officialEmail: z.string().email()
});

// ✅ Private Profile Validation Schema
export const PrivateProfileSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().min(2).max(100),
  phoneNumber: z.string().regex(/^\+?359\d{9}$/).optional(),
  
  location: z.object({
    city: z.string().optional(),
    region: z.string().optional()
  }).optional()
});

// ✅ Validation Functions

export function validateDealershipInfo(data: unknown) {
  return DealershipInfoSchema.safeParse(data);
}

export function validateCompanyInfo(data: unknown) {
  return CompanyInfoSchema.safeParse(data);
}

export function validatePrivateProfile(data: unknown) {
  return PrivateProfileSchema.safeParse(data);
}

// ✅ Helper: Format validation errors for display
export function formatValidationErrors(error: z.ZodError): string[] {
  return error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
}

// ✅ Helper: Extract field errors for forms
export function getFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  
  error.errors.forEach(err => {
    const field = err.path.join('.');
    fieldErrors[field] = err.message;
  });
  
  return fieldErrors;
}

