/**
 * Ad Generation JSON Schema
 * Strict schema for AI-generated vehicle advertisements
 * 
 * الغرض: فرض مخرجات مهيكلة صارمة من الـ LLM
 */

export interface AdGenerationInput {
  vehicleId: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  power?: number;
  equipment?: string[];
  images: string[];
  sellerType: 'private' | 'dealer' | 'company';
  language: 'bg' | 'en' | 'ar';
}

export interface AdGenerationOutput {
  /** Unique identifier for tracking */
  requestId: string;
  
  /** ISO timestamp of generation */
  generatedAt: string;
  
  /** The generated content */
  content: {
    /** Main title (max 80 chars) */
    title: string;
    
    /** Short description for cards (max 160 chars) */
    shortDescription: string;
    
    /** Full description (max 2000 chars) */
    fullDescription: string;
    
    /** SEO meta description (max 155 chars) */
    metaDescription: string;
    
    /** Hashtags for social media (max 10) */
    hashtags: string[];
    
    /** Key highlights (max 5) */
    highlights: string[];
  };
  
  /** Image analysis results */
  imageAnalysis?: {
    /** Index of recommended main image */
    recommendedMainImage: number;
    
    /** Images flagged for issues */
    flaggedImages: Array<{
      index: number;
      reason: 'blur' | 'low_resolution' | 'inappropriate' | 'watermark' | 'plate_visible';
      confidence: number;
    }>;
  };
  
  /** AI quality metrics */
  quality: {
    /** Content quality score 0-100 */
    score: number;
    
    /** Detected issues */
    issues: string[];
    
    /** Requires human review */
    requiresReview: boolean;
    
    /** Reason if review needed */
    reviewReason?: string;
  };
  
  /** Processing metadata */
  meta: {
    provider: 'gemini' | 'deepseek' | 'openai';
    model: string;
    tokensUsed: number;
    processingTimeMs: number;
    retryCount: number;
  };
}

/**
 * JSON Schema for validation (JSON Schema Draft 7)
 */
export const AD_GENERATION_JSON_SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  required: ["requestId", "generatedAt", "content", "quality", "meta"],
  additionalProperties: false,
  
  properties: {
    requestId: {
      type: "string",
      minLength: 1,
      maxLength: 64
    },
    
    generatedAt: {
      type: "string",
      format: "date-time"
    },
    
    content: {
      type: "object",
      required: ["title", "shortDescription", "fullDescription", "metaDescription", "hashtags", "highlights"],
      additionalProperties: false,
      properties: {
        title: {
          type: "string",
          minLength: 10,
          maxLength: 80
        },
        shortDescription: {
          type: "string",
          minLength: 20,
          maxLength: 160
        },
        fullDescription: {
          type: "string",
          minLength: 100,
          maxLength: 2000
        },
        metaDescription: {
          type: "string",
          minLength: 50,
          maxLength: 155
        },
        hashtags: {
          type: "array",
          items: { type: "string", pattern: "^#[a-zA-Z0-9_]+$" },
          minItems: 3,
          maxItems: 10
        },
        highlights: {
          type: "array",
          items: { type: "string", minLength: 5, maxLength: 100 },
          minItems: 2,
          maxItems: 5
        }
      }
    },
    
    imageAnalysis: {
      type: "object",
      properties: {
        recommendedMainImage: {
          type: "integer",
          minimum: 0
        },
        flaggedImages: {
          type: "array",
          items: {
            type: "object",
            required: ["index", "reason", "confidence"],
            properties: {
              index: { type: "integer", minimum: 0 },
              reason: { 
                type: "string",
                enum: ["blur", "low_resolution", "inappropriate", "watermark", "plate_visible"]
              },
              confidence: { type: "number", minimum: 0, maximum: 1 }
            }
          }
        }
      }
    },
    
    quality: {
      type: "object",
      required: ["score", "issues", "requiresReview"],
      additionalProperties: false,
      properties: {
        score: {
          type: "integer",
          minimum: 0,
          maximum: 100
        },
        issues: {
          type: "array",
          items: { type: "string" }
        },
        requiresReview: {
          type: "boolean"
        },
        reviewReason: {
          type: "string"
        }
      }
    },
    
    meta: {
      type: "object",
      required: ["provider", "model", "tokensUsed", "processingTimeMs", "retryCount"],
      additionalProperties: false,
      properties: {
        provider: {
          type: "string",
          enum: ["gemini", "deepseek", "openai"]
        },
        model: { type: "string" },
        tokensUsed: { type: "integer", minimum: 0 },
        processingTimeMs: { type: "integer", minimum: 0 },
        retryCount: { type: "integer", minimum: 0, maximum: 3 }
      }
    }
  }
} as const;

/**
 * Error types for validation
 */
export type SchemaValidationError = {
  path: string;
  message: string;
  value?: unknown;
};
