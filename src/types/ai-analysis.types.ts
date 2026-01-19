/**
 * AI Analysis Types
 * Type definitions for Gemini-powered car analysis system
 * 
 * Used for:
 * - Car image analysis and data extraction
 * - Price estimation
 * - Equipment/options suggestions
 */

// Analysis confidence level for a single field
export interface FieldConfidence {
  value: string;
  confidence: number; // 0-1 scale
}

// Main AI analysis result from Gemini
export interface GeminiCarAnalysisResult {
  brand: FieldConfidence;
  model: FieldConfidence;
  yearRange: FieldConfidence; // e.g., "2018-2020"
  bodyType: FieldConfidence; // sedan, suv, hatchback, etc.
  color: FieldConfidence;
  trim: FieldConfidence; // e.g., "M Sport", "AMG Line"
  damage: FieldConfidence; // none, minor, moderate, severe
  reasoning: string; // AI explanation
}

// Price estimation result
export interface PriceEstimate {
  source: string; // e.g., "mobile.bg", "cars.bg"
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  currency: 'EUR';
  reasoning: string;
}

// Equipment/options suggestions
export interface EquipmentSuggestions {
  safety: string[]; // e.g., ["ABS", "Airbags", "ESP"]
  comfort: string[]; // e.g., ["Climate Control", "Leather Seats"]
  infotainment: string[]; // e.g., ["Navigation", "Bluetooth"]
}

// Input for AI analysis
export interface CarDataForAnalysis {
  imageBase64: string;
  mimeType: string;
}

// Input for price estimation
export interface CarDataForPricing {
  brand: string;
  model: string;
  year: string;
  mileage?: number;
  condition?: string;
}

// AI modal step states
export type AIAnalysisStep = 'upload' | 'analyzing' | 'review' | 'pricing';

// Modal state
export interface AIAnalysisModalState {
  currentStep: AIAnalysisStep;
  uploadedImages: File[];
  analysisResult: GeminiCarAnalysisResult | null;
  priceEstimates: PriceEstimate[];
  equipmentSuggestions: EquipmentSuggestions | null;
  error: string | null;
  isAnalyzing: boolean;
}

// Response from Gemini API (raw schema)
export interface GeminiRawResponse {
  brand: { value: string; confidence: number };
  model: { value: string; confidence: number };
  yearRange: { value: string; confidence: number };
  bodyType: { value: string; confidence: number };
  color: { value: string; confidence: number };
  trim: { value: string; confidence: number };
  damage: { value: string; confidence: number };
  reasoning: string;
}

// Equipment suggestions response
export interface GeminiEquipmentResponse {
  safety: string[];
  comfort: string[];
  infotainment: string[];
}
