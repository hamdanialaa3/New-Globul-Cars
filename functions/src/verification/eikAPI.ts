// functions/src/verification/eikAPI.ts
// EIK/BULSTAT API Integration with Bulgarian Trade Registry

import axios from 'axios';

/**
 * EIK/BULSTAT verification response
 */
export interface EIKVerificationResult {
  success: boolean;
  eik: string;
  companyName?: string;
  address?: string;
  vatNumber?: string;
  legalForm?: string;
  status?: 'active' | 'inactive' | 'liquidated';
  registrationDate?: string;
  mol?: string; // Материално отговорно лице
  error?: string;
  source: 'api' | 'mock';
}

/**
 * Verify EIK/BULSTAT via Bulgarian Trade Registry API
 * 
 * NOTE: This is a placeholder implementation. In production, you would need to:
 * 1. Register with the Bulgarian Trade Registry API (https://portal.registryagency.bg/)
 * 2. Obtain API credentials
 * 3. Implement proper API authentication
 * 4. Handle rate limiting and caching
 * 
 * Alternative APIs:
 * - BG Portal: https://www.bgregeister.bg/
 * - Public Registry API: https://public.brra.bg/
 * - Third-party services like InfoBel, InfoCredit
 */
export async function verifyEIKViaAPI(eik: string): Promise<EIKVerificationResult> {
  try {
    // Remove any spaces or special characters
    const cleanEIK = eik.replace(/\s/g, '');

    // Validate EIK format (9 or 13 digits)
    if (!/^\d{9}(\d{4})?$/.test(cleanEIK)) {
      return {
        success: false,
        eik: cleanEIK,
        error: 'Invalid EIK format. Must be 9 or 13 digits.',
        source: 'api',
      };
    }

    // TODO: Replace with actual API endpoint when credentials are available
    // Example:
    // const API_URL = 'https://portal.registryagency.bg/api/v1/verify';
    // const API_KEY = process.env.BULSTAT_API_KEY;
    
    // const response = await axios.get(API_URL, {
    //   params: { eik: cleanEIK },
    //   headers: { 'Authorization': `Bearer ${API_KEY}` }
    // });

    // For now, return mock data with indication
    console.log(`⚠️  EIK API not configured. Using mock verification for EIK: ${cleanEIK}`);
    return getMockEIKVerification(cleanEIK);

  } catch (error: any) {
    console.error('Error verifying EIK via API:', error);
    return {
      success: false,
      eik,
      error: error.message || 'API verification failed',
      source: 'api',
    };
  }
}

/**
 * Mock EIK verification (fallback until real API is configured)
 * This simulates realistic responses for testing
 */
function getMockEIKVerification(eik: string): EIKVerificationResult {
  // Check EIK checksum (basic validation)
  if (!validateEIKChecksum(eik)) {
    return {
      success: false,
      eik,
      error: 'Invalid EIK checksum',
      source: 'mock',
    };
  }

  // Simulate successful verification with mock data
  const companyTypes = [
    'ЕООД',
    'ООД',
    'АД',
    'ЕТ',
    'СД',
    'КД',
    'КДА',
  ];

  const cities = [
    'София',
    'Пловдив',
    'Варна',
    'Бургас',
    'Русе',
    'Стара Загора',
    'Плевен',
  ];

  const randomType = companyTypes[Math.floor(Math.random() * companyTypes.length)];
  const randomCity = cities[Math.floor(Math.random() * cities.length)];

  return {
    success: true,
    eik,
    companyName: `${randomType} "Тестова Компания ${eik.substring(0, 4)}"`,
    address: `гр. ${randomCity}, ул. Тестова ${Math.floor(Math.random() * 100)}`,
    vatNumber: eik.length === 9 ? `BG${eik}` : `BG${eik.substring(0, 9)}`,
    legalForm: randomType,
    status: 'active',
    registrationDate: '01.01.2020',
    mol: 'Иван Иванов Иванов',
    source: 'mock',
  };
}

/**
 * Validate EIK/BULSTAT checksum
 * Bulgarian EIK uses weighted checksum algorithm
 */
function validateEIKChecksum(eik: string): boolean {
  // EIK must be 9 or 13 digits
  if (!/^\d{9}(\d{4})?$/.test(eik)) {
    return false;
  }

  // Extract the first 9 digits for validation
  const digits = eik.substring(0, 9).split('').map(Number);

  // Weights for EIK validation
  const weights = [1, 2, 3, 4, 5, 6, 7, 8];

  // Calculate checksum
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += digits[i] * weights[i];
  }

  let checkDigit = sum % 11;
  
  // If remainder is 10, use alternative weights
  if (checkDigit === 10) {
    const altWeights = [3, 4, 5, 6, 7, 8, 9, 10];
    sum = 0;
    for (let i = 0; i < 8; i++) {
      sum += digits[i] * altWeights[i];
    }
    checkDigit = sum % 11;
    if (checkDigit === 10) {
      checkDigit = 0;
    }
  }

  return checkDigit === digits[8];
}

/**
 * Query Bulgarian Trade Registry (Public Search)
 * Uses the public search portal
 */
export async function queryPublicRegistry(eik: string): Promise<EIKVerificationResult> {
  try {
    // Public registry URL
    const registryURL = 'https://public.brra.bg/CheckUP/Verifications/Search';

    // In production, you would scrape or use API
    // For now, return mock data
    console.log(`⚠️  Public registry scraping not implemented. Using mock for EIK: ${eik}`);
    
    return getMockEIKVerification(eik);

  } catch (error: any) {
    console.error('Error querying public registry:', error);
    return {
      success: false,
      eik,
      error: 'Public registry query failed',
      source: 'api',
    };
  }
}

/**
 * Verify company via multiple sources (fallback chain)
 */
export async function verifyEIKMultiSource(eik: string): Promise<EIKVerificationResult> {
  // Try API first
  let result = await verifyEIKViaAPI(eik);
  
  if (result.success) {
    return result;
  }

  // Fallback to public registry
  console.log('API verification failed, trying public registry...');
  result = await queryPublicRegistry(eik);

  return result;
}

/**
 * Cache EIK verification results
 * In production, this would use Redis or Firestore
 */
const verificationCache = new Map<string, { result: EIKVerificationResult; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function verifyEIKWithCache(eik: string): Promise<EIKVerificationResult> {
  const cleanEIK = eik.replace(/\s/g, '');

  // Check cache
  const cached = verificationCache.get(cleanEIK);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`✅ Using cached verification for EIK: ${cleanEIK}`);
    return { ...cached.result, source: 'mock' }; // Indicate it's cached
  }

  // Verify
  const result = await verifyEIKMultiSource(cleanEIK);

  // Cache successful results
  if (result.success) {
    verificationCache.set(cleanEIK, {
      result,
      timestamp: Date.now(),
    });
  }

  return result;
}
