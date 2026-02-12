// AI Types - Free Gemini Integration
// مجاني 100% باستخدام Google Gemini

export interface CarAnalysisResult {
  make: string;
  model: string;
  year: string;
  color: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  confidence: number; // 0-100
  suggestions: string[];
}

export interface ImageQualityAnalysis {
  clarity: number; // 0-100
  lighting: number; // 0-100
  angle: number; // 0-100
  overallScore: number; // 0-100
  suggestions: string[];
}

export interface PriceSuggestion {
  minPrice: number;
  avgPrice: number;
  maxPrice: number;
  reasoning: string;
  marketTrend: 'high' | 'average' | 'low';
}

export interface ProfileAnalysis {
  completeness: number; // 0-100
  trustScore: number; // 0-100
  suggestions: string[];
  missingFields: string[];
}

export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface AIChatContext {
  page?: string;
  language?: 'bg' | 'en' | 'ar' | 'ru' | 'tr';
  userType?: 'buyer' | 'seller' | 'dealer';
  carDetails?: any;
  profileData?: any;
}

export interface AIServiceConfig {
  apiKey: string;
  maxRetries: number;
  timeout: number;
  cacheEnabled: boolean;
}
