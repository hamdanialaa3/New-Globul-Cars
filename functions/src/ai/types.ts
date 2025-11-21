// AI Types for Cloud Functions
// أنواع الذكاء الاصطناعي لـ Cloud Functions

export interface CarValuationRequest {
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  engineSize?: number;
  power?: number;
  location: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  registeredInBulgaria?: boolean;
  environmentalTaxPaid?: boolean;
}

export interface CarValuationResponse {
  predictedPrice: number;
  minPrice: number;
  maxPrice: number;
  confidence: number;
  marketTrend: 'high' | 'average' | 'low';
  reasoning: string;
  comparableListings: number;
  currency: 'EUR';
  market: 'Bulgaria';
}

export interface GeminiChatRequest {
  message: string;
  userId?: string;
  context?: {
    page?: string;
    language?: string;
    userType?: string;
    carDetails?: any;
  };
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface GeminiVisionRequest {
  imageUrl: string;
  userId?: string;
  analysisType?: 'car' | 'quality' | 'damage';
}

export interface AIQuotaCheck {
  allowed: boolean;
  remaining: number;
  tier: string;
  reason?: string;
}
