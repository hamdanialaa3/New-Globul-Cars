/**
 * Input Validation Schemas using Zod
 * Centralized validation for all user inputs
 */

import { z } from 'zod';

// ===== CAR VALIDATION =====

export const CarCreateSchema = z.object({
    // Basic Info
    brand: z.string()
        .min(2, 'Brand must be at least 2 characters')
        .max(50, 'Brand must not exceed 50 characters')
        .regex(/^[a-zA-Z0-9\s-]+$/, 'Brand contains invalid characters'),

    model: z.string()
        .min(1, 'Model is required')
        .max(50, 'Model must not exceed 50 characters'),

    year: z.number()
        .int('Year must be an integer')
        .min(1900, 'Year must be 1900 or later')
        .max(new Date().getFullYear() + 1, 'Year cannot be in the future'),

    // Price
    price: z.number()
        .positive('Price must be positive')
        .max(10000000, 'Price seems unrealistic')
        .multipleOf(0.01, 'Price must have at most 2 decimal places'),

    // Mileage
    mileage: z.number()
        .int('Mileage must be an integer')
        .min(0, 'Mileage cannot be negative')
        .max(1000000, 'Mileage seems unrealistic'),

    // Description
    description: z.string()
        .min(20, 'Description must be at least 20 characters')
        .max(5000, 'Description must not exceed 5000 characters'),

    // Category
    category: z.enum([
        'passenger_cars',
        'suvs',
        'vans',
        'motorcycles',
        'trucks',
        'buses'
    ]),

    // Fuel Type
    fuelType: z.enum([
        'petrol',
        'diesel',
        'electric',
        'hybrid',
        'lpg',
        'cng'
    ]),

    // Transmission
    transmission: z.enum(['manual', 'automatic', 'semi-automatic']),

    // Condition
    condition: z.enum(['new', 'used']),

    // Optional fields
    variant: z.string().max(100).optional(),
    color: z.string().max(50).optional(),
    doors: z.number().int().min(2).max(6).optional(),
    engineSize: z.number().positive().max(10).optional(),

    // Location
    city: z.string().min(2).max(100),
    region: z.string().min(2).max(100).optional(),

    // Images (array of URLs)
    images: z.array(z.string().url('Invalid image URL'))
        .min(1, 'At least one image is required')
        .max(20, 'Maximum 20 images allowed')
});

export type CarCreateInput = z.infer<typeof CarCreateSchema>;

// ===== USER VALIDATION =====

export const UserRegistrationSchema = z.object({
    email: z.string()
        .email('Invalid email address')
        .max(255, 'Email too long'),

    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password too long')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain uppercase, lowercase, and number'
        ),

    displayName: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name too long')
        .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters'),

    phoneNumber: z.string()
        .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
        .optional(),

    profileType: z.enum(['private', 'dealer', 'company']),

    // Company-specific fields
    companyName: z.string().min(2).max(200).optional(),
    eik: z.string().length(9).regex(/^\d+$/).optional(),

    // Terms acceptance
    acceptTerms: z.literal(true, {
        errorMap: () => ({ message: 'You must accept the terms and conditions' })
    })
});

export type UserRegistrationInput = z.infer<typeof UserRegistrationSchema>;

// ===== MESSAGE VALIDATION =====

export const MessageSchema = z.object({
    content: z.string()
        .min(1, 'Message cannot be empty')
        .max(2000, 'Message too long'),

    recipientId: z.string().min(1, 'Recipient ID is required'),

    carId: z.string().optional(),

    attachments: z.array(z.object({
        url: z.string().url(),
        type: z.enum(['image', 'document']),
        size: z.number().max(10 * 1024 * 1024, 'File too large (max 10MB)')
    })).max(5, 'Maximum 5 attachments').optional()
});

export type MessageInput = z.infer<typeof MessageSchema>;

// ===== REVIEW VALIDATION =====

export const ReviewSchema = z.object({
    rating: z.number()
        .int('Rating must be an integer')
        .min(1, 'Rating must be at least 1')
        .max(5, 'Rating must be at most 5'),

    comment: z.string()
        .min(10, 'Review must be at least 10 characters')
        .max(1000, 'Review too long'),

    sellerId: z.string().min(1, 'Seller ID is required')
});

export type ReviewInput = z.infer<typeof ReviewSchema>;

// ===== SEARCH VALIDATION =====

export const SearchSchema = z.object({
    query: z.string().max(200).optional(),

    brand: z.string().max(50).optional(),
    model: z.string().max(50).optional(),

    priceMin: z.number().min(0).optional(),
    priceMax: z.number().max(10000000).optional(),

    yearMin: z.number().int().min(1900).optional(),
    yearMax: z.number().int().max(new Date().getFullYear() + 1).optional(),

    mileageMax: z.number().int().min(0).optional(),

    fuelType: z.enum(['petrol', 'diesel', 'electric', 'hybrid', 'lpg', 'cng']).optional(),
    transmission: z.enum(['manual', 'automatic', 'semi-automatic']).optional(),

    city: z.string().max(100).optional(),
    region: z.string().max(100).optional(),

    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20)
}).refine(
    (data: { priceMin?: number; priceMax?: number }) => !data.priceMin || !data.priceMax || data.priceMin <= data.priceMax,
    { message: 'Price min must be less than price max', path: ['priceMin'] }
).refine(
    (data: { yearMin?: number; yearMax?: number }) => !data.yearMin || !data.yearMax || data.yearMin <= data.yearMax,
    { message: 'Year min must be less than year max', path: ['yearMin'] }
);

export type SearchInput = z.infer<typeof SearchSchema>;

// ===== VALIDATION HELPER FUNCTIONS =====

/**
 * Validate and sanitize input
 */
export function validateInput<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    } else {
        return { success: false, errors: result.error };
    }
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHtml(html: string): string {
    // Remove script tags and event handlers
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/on\w+='[^']*'/gi, '')
        .replace(/javascript:/gi, '');
}

/**
 * Sanitize user input for display
 */
export function sanitizeText(text: string): string {
    return text
        .trim()
        .replace(/[<>]/g, '') // Remove angle brackets
        .substring(0, 5000); // Limit length
}

/**
 * Example usage:
 * 
 * const result = validateInput(CarCreateSchema, formData);
 * 
 * if (result.success) {
 *   // Data is valid and typed
 *   await createCar(result.data);
 * } else {
 *   // Show validation errors
 *   result.errors.errors.forEach(err => {
 *     console.error(`${err.path}: ${err.message}`);
 *   });
 * }
 */
