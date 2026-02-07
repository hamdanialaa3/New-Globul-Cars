import { logger } from '../services/logger-service';
// Google API Keys Configuration
// تكوين مفاتيح Google API

export const GOOGLE_API_KEYS = {
  // Generative AI (Gemini) - للذكاء الاصطناعي
  GENERATIVE_AI: import.meta.env.VITE_GOOGLE_GENERATIVE_AI_KEY || 'AIzaSyC1YsQz2rpK8z_6cZev9y99rV1kIUVsrFI',
  
  // Firebase Web - لخدمات Firebase
  FIREBASE_WEB: import.meta.env.VITE_GOOGLE_FIREBASE_WEB_KEY || '***REMOVED_FIREBASE_KEY***',
  
  // Browser Key - للخدمات العامة
  BROWSER: import.meta.env.VITE_GOOGLE_BROWSER_KEY || 'AIzaSyAchmKCk8ipzv0dDwbQ2xU1Pa6o4CQsEu8',
  
  // Maps API - للخرائط
  MAPS: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_BROWSER_KEY || 'AIzaSyAchmKCk8ipzv0dDwbQ2xU1Pa6o4CQsEu8'
} as const;

// Validation function
export const validateGoogleAPIKeys = () => {
  const keys = Object.entries(GOOGLE_API_KEYS);
  const missingKeys: string[] = [];
  
  keys.forEach(([name, key]) => {
    if (!key || key.includes('your_') || key.includes('YOUR_')) {
      missingKeys.push(name);
    }
  });
  
  if (missingKeys.length > 0) {
    logger.warn('⚠️ Missing or invalid Google API keys:', missingKeys);
  } else {
    logger.info('✅ All Google API keys are configured');
  }
  
  return missingKeys.length === 0;
};

// Export individual keys for convenience
export const {
  GENERATIVE_AI: GOOGLE_GENERATIVE_AI_KEY,
  FIREBASE_WEB: GOOGLE_FIREBASE_WEB_KEY,
  BROWSER: GOOGLE_BROWSER_KEY,
  MAPS: GOOGLE_MAPS_KEY
} = GOOGLE_API_KEYS;