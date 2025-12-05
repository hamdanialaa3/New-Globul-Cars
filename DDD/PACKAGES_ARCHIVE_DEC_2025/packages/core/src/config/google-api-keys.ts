// Google API Keys Configuration
// تكوين مفاتيح Google API

export const GOOGLE_API_KEYS = {
  // Generative AI (Gemini) - للذكاء الاصطناعي
  GENERATIVE_AI: process.env.REACT_APP_GOOGLE_GENERATIVE_AI_KEY || 'AIzaSyC1YsQz2rpK8z_6cZev9y99rV1kIUVsrFI',
  
  // Firebase Web - لخدمات Firebase
  FIREBASE_WEB: process.env.REACT_APP_GOOGLE_FIREBASE_WEB_KEY || 'AIzaSyAUYM_qygK5pUrlXtdDLmEi-_Kh9SyvRmk',
  
  // Browser Key - للخدمات العامة
  BROWSER: process.env.REACT_APP_GOOGLE_BROWSER_KEY || 'AIzaSyAchmKCk8ipzv0dDwbQ2xU1Pa6o4CQsEu8',
  
  // Maps API - للخرائط
  MAPS: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || process.env.REACT_APP_GOOGLE_BROWSER_KEY || 'AIzaSyAchmKCk8ipzv0dDwbQ2xU1Pa6o4CQsEu8'
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
    console.warn('⚠️ Missing or invalid Google API keys:', missingKeys);
  } else {
    console.log('✅ All Google API keys are configured');
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

