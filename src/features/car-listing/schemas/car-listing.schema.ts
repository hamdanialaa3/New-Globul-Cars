// Car Listing Zod Schemas
// شيمات التحقق من بيانات إعلان السيارة
import { z } from 'zod';

// Step 1: Vehicle Type
export const step1Schema = z.object({
  vehicleType: z.enum(['car', 'van', 'motorcycle', 'truck', 'bus'], {
    required_error: 'Please select a vehicle type',
    invalid_type_error: 'Invalid vehicle type',
  }),
});

export type Step1Data = z.infer<typeof step1Schema>;

// Step 2: Vehicle Data
export const step2Schema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z
    .number()
    .int('Year must be a whole number')
    .min(1900, 'Year must be after 1900')
    .max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
  mileage: z
    .number()
    .int('Mileage must be a whole number')
    .min(0, 'Mileage cannot be negative')
    .optional(),
  fuelType: z
    .enum(['petrol', 'diesel', 'electric', 'hybrid', 'lpg', 'cng', 'other'])
    .optional(),
  fuelTypeOther: z.string().optional(),
  transmission: z.enum(['manual', 'automatic', 'semi-automatic']).optional(),
  bodyType: z.string().optional(),
  bodyTypeOther: z.string().optional(),
  doors: z.number().int().min(2).max(5).optional(),
  seats: z.number().int().min(2).max(9).optional(),
  color: z.string().optional(),
  colorOther: z.string().optional(),
  power: z.number().int().min(0).optional(),
  engineSize: z.number().min(0).optional(),
  driveType: z.enum(['fwd', 'rwd', 'awd', '4wd']).optional(),
  condition: z.enum(['new', 'used', 'damaged']).optional(),
  firstRegistration: z.string().optional(),
  hasAccidentHistory: z.boolean().default(false),
  hasServiceHistory: z.boolean().default(false),
  // Additional fields for "Other" options
  makeOther: z.string().optional(),
  modelOther: z.string().optional(),
  variant: z.string().optional(),
  variantOther: z.string().optional(),
});

export type Step2Data = z.infer<typeof step2Schema>;

// Step 3: Equipment
export const step3Schema = z.object({
  safetyEquipment: z.array(z.string()).default([]),
  comfortEquipment: z.array(z.string()).default([]),
  infotainmentEquipment: z.array(z.string()).default([]),
  extrasEquipment: z.array(z.string()).default([]),
});

export type Step3Data = z.infer<typeof step3Schema>;

// Step 4: Images
export const step4Schema = z.object({
  images: z.array(z.any()).min(1, 'At least one image is required').max(20, 'Maximum 20 images allowed'),
  mainImageIndex: z.number().int().min(0).default(0),
});

export type Step4Data = z.infer<typeof step4Schema>;

// Step 5: Pricing
export const step5Schema = z.object({
  price: z
    .number()
    .int('Price must be a whole number')
    .min(1, 'Price is required')
    .max(10000000, 'Price seems too high'),
  currency: z.enum(['EUR', 'BGN', 'USD']).default('EUR'),
  negotiable: z.boolean().default(false),
  financing: z.boolean().default(false),
  tradeIn: z.boolean().default(false),
  warranty: z.boolean().default(false),
  warrantyMonths: z.number().int().min(0).max(120).optional(),
  vatDeductible: z.boolean().default(false),
});

export type Step5Data = z.infer<typeof step5Schema>;

// Step 6: Contact & Publish
export const step6Schema = z.object({
  sellerName: z.string().min(2, 'Name must be at least 2 characters'),
  sellerEmail: z.string().email('Invalid email address'),
  sellerPhone: z
    .string()
    .regex(/^\+?359\d{9}$/, 'Invalid Bulgarian phone number (format: +359XXXXXXXXX)'),
  additionalPhone: z
    .string()
    .regex(/^\+?359\d{9}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  city: z.string().min(1, 'City is required'),
  region: z.string().min(1, 'Region is required'),
  postalCode: z.string().optional(),
  description: z.string().max(5000, 'Description too long (max 5000 characters)').optional(),
  preferredContact: z.array(z.string()).default(['phone']),
  availableHours: z.string().optional(),
});

export type Step6Data = z.infer<typeof step6Schema>;

// Combined Schema
export const carListingSchema = z.object({
  step1: step1Schema,
  step2: step2Schema,
  step3: step3Schema,
  step4: step4Schema,
  step5: step5Schema,
  step6: step6Schema,
});

export type CarListingFormData = z.infer<typeof carListingSchema>;

// Helper function to format Zod errors for display
export const formatZodErrors = (error: z.ZodError): Record<string, string> => {
  const formatted: Record<string, string> = {};
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    formatted[path] = err.message;
  });
  return formatted;
};

