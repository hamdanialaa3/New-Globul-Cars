/**
 * AI-Powered Data Ingestion & Cleaning
 * Zero-Cost Implementation using Gemini API
 * 
 * Features:
 * - Automatic field normalization
 * - AI category inference for incomplete listings
 * - Data validation and enrichment
 * - Processing logs for monitoring
 * 
 * Trigger: Firestore onCreate for 'cars' collection
 * Cost: €0 (within 2M Cloud Functions invocations/month + 1500 Gemini requests/day)
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { logger } from '../utils/logger';

// Initialize if not already done
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Normalize car data fields
 * - Convert strings to proper case
 * - Standardize fuel types
 * - Fix common typos
 * - Validate ranges
 */
function normalizeFields(carData: any): any {
  const normalized = { ...carData };

  // Normalize make/brand (BMW, Mercedes-Benz, Toyota, etc.)
  if (normalized.make) {
    normalized.make = normalized.make
      .trim()
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Normalize model
  if (normalized.model) {
    normalized.model = normalized.model.trim();
  }

  // Standardize fuel types to Bulgarian standard
  const fuelMapping: Record<string, string> = {
    'petrol': 'Бензин',
    'gasoline': 'Бензин',
    'бензин': 'Бензин',
    'diesel': 'Дизел',
    'дизел': 'Дизел',
    'electric': 'Електрически',
    'електрически': 'Електрически',
    'hybrid': 'Хибрид',
    'хибрид': 'Хибрид',
    'lpg': 'Газ (LPG)',
    'gas': 'Газ (LPG)',
    'газ': 'Газ (LPG)',
    'cng': 'Метан (CNG)',
    'метан': 'Метан (CNG)'
  };

  if (normalized.fuel) {
    const fuelLower = normalized.fuel.toLowerCase().trim();
    normalized.fuel = fuelMapping[fuelLower] || normalized.fuel;
  }

  // Standardize transmission
  const transmissionMapping: Record<string, string> = {
    'manual': 'Ръчна',
    'ръчна': 'Ръчна',
    'механична': 'Ръчна',
    'automatic': 'Автоматична',
    'автоматична': 'Автоматична',
    'semi-automatic': 'Полуавтоматична',
    'полуавтоматична': 'Полуавтоматична',
    'cvt': 'CVT',
    'dsg': 'DSG'
  };

  if (normalized.transmission) {
    const transLower = normalized.transmission.toLowerCase().trim();
    normalized.transmission = transmissionMapping[transLower] || normalized.transmission;
  }

  // Validate and normalize price (must be positive, reasonable range)
  if (normalized.price) {
    const price = Number(normalized.price);
    if (isNaN(price) || price < 0) {
      normalized.price = 0;
      normalized.priceValid = false;
    } else if (price > 1000000) {
      // Suspiciously high for Bulgarian market
      normalized.priceWarning = 'Unusually high price';
    } else {
      normalized.priceValid = true;
    }
  }

  // Validate and normalize mileage
  if (normalized.mileage) {
    const mileage = Number(normalized.mileage);
    if (isNaN(mileage) || mileage < 0) {
      normalized.mileage = 0;
      normalized.mileageValid = false;
    } else if (mileage > 500000) {
      // Suspiciously high mileage
      normalized.mileageWarning = 'Very high mileage';
    } else {
      normalized.mileageValid = true;
    }
  }

  // Validate year (reasonable range: 1980-2026)
  if (normalized.year) {
    const year = Number(normalized.year);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1980 || year > currentYear + 1) {
      normalized.yearValid = false;
    } else {
      normalized.yearValid = true;
    }
  }

  // Add normalized timestamp
  normalized.normalizedAt = admin.firestore.FieldValue.serverTimestamp();

  return normalized;
}

/**
 * Infer vehicle category using simple rules
 * (Gemini API used only if rules fail)
 */
function inferCategoryByRules(carData: any): string | null {
  const make = carData.make?.toLowerCase() || '';
  const model = carData.model?.toLowerCase() || '';
  const bodyType = carData.bodyType?.toLowerCase() || '';

  // SUV/Crossover detection
  if (
    bodyType.includes('suv') ||
    bodyType.includes('кросоувър') ||
    model.includes('x1') ||
    model.includes('x3') ||
    model.includes('x5') ||
    model.includes('q3') ||
    model.includes('q5') ||
    model.includes('rav4') ||
    model.includes('cr-v') ||
    model.includes('tiguan')
  ) {
    return 'SUV';
  }

  // Sedan detection
  if (
    bodyType.includes('sedan') ||
    bodyType.includes('седан') ||
    model.includes('camry') ||
    model.includes('accord') ||
    model.includes('passat') ||
    model.includes('3 series') ||
    model.includes('c-class')
  ) {
    return 'Седан';
  }

  // Hatchback detection
  if (
    bodyType.includes('hatchback') ||
    bodyType.includes('хечбек') ||
    model.includes('golf') ||
    model.includes('focus') ||
    model.includes('corolla') ||
    model.includes('civic')
  ) {
    return 'Хечбек';
  }

  // Coupe detection
  if (
    bodyType.includes('coupe') ||
    bodyType.includes('купе') ||
    model.includes('coupe')
  ) {
    return 'Купе';
  }

  // Station Wagon detection
  if (
    bodyType.includes('wagon') ||
    bodyType.includes('estate') ||
    bodyType.includes('комби') ||
    model.includes('touring') ||
    model.includes('avant')
  ) {
    return 'Комби';
  }

  // Minivan/MPV detection
  if (
    bodyType.includes('minivan') ||
    bodyType.includes('mpv') ||
    bodyType.includes('ван') ||
    model.includes('sharan') ||
    model.includes('galaxy') ||
    model.includes('odyssey')
  ) {
    return 'Ван';
  }

  // Pickup detection
  if (
    bodyType.includes('pickup') ||
    bodyType.includes('пикап') ||
    model.includes('hilux') ||
    model.includes('ranger') ||
    model.includes('amarok')
  ) {
    return 'Пикап';
  }

  return null; // Unable to infer by rules
}

/**
 * Infer category using Gemini API (fallback when rules fail)
 * Only called if category is missing AND rule-based inference failed
 */
async function inferCategoryWithGemini(carData: any): Promise<string> {
  try {
    // This would call Gemini API - for now, return default
    // In production, integrate with gemini-service
    const prompt = `
Vehicle: ${carData.make} ${carData.model} ${carData.year || ''}
Body Type: ${carData.bodyType || 'Unknown'}
Description: ${carData.description?.substring(0, 200) || 'N/A'}

What category is this vehicle? Choose ONE from:
- Седан (Sedan)
- Хечбек (Hatchback)
- SUV
- Комби (Station Wagon)
- Купе (Coupe)
- Ван (Minivan)
- Пикап (Pickup)
- Кабриолет (Convertible)
- Други (Other)

Answer with ONLY the category name in Bulgarian.
    `.trim();

    // TODO: Integrate with actual Gemini service
    // const response = await geminiService.chat(prompt);
    // return response.text || 'Други';

    logger.info('Gemini category inference needed', { carData });
    return 'Други'; // Default fallback
  } catch (error) {
    logger.error('Gemini category inference failed', { error, carData });
    return 'Други';
  }
}

/**
 * Main Cloud Function: Triggered on car document creation
 * Automatically cleans and enriches data
 */
export const onCarCreated = functions
  .region('europe-west1')
  .firestore
  .document('cars/{carId}')
  .onCreate(async (snapshot, context) => {
    const carId = context.params.carId;
    const carData = snapshot.data();

    try {
      logger.info('Data ingestion started', { carId });

      // Step 1: Normalize fields
      let cleaned = normalizeFields(carData);
      logger.info('Fields normalized', { carId, cleaned });

      // Step 2: Infer category if missing
      if (!cleaned.category || cleaned.category === '') {
        // Try rule-based inference first (free, instant)
        let inferredCategory = inferCategoryByRules(cleaned);

        // If rules failed, use Gemini API (quota: 1500/day)
        if (!inferredCategory) {
          inferredCategory = await inferCategoryWithGemini(cleaned);
        }

        cleaned.category = inferredCategory;
        cleaned.categoryInferred = true;
        logger.info('Category inferred', { carId, category: inferredCategory });
      }

      // Step 3: Add data quality score (0-100)
      let qualityScore = 100;
      if (!cleaned.priceValid) qualityScore -= 20;
      if (!cleaned.mileageValid) qualityScore -= 20;
      if (!cleaned.yearValid) qualityScore -= 20;
      if (!cleaned.images || cleaned.images.length === 0) qualityScore -= 15;
      if (!cleaned.description || cleaned.description.length < 50) qualityScore -= 10;
      if (cleaned.priceWarning) qualityScore -= 10;
      if (cleaned.mileageWarning) qualityScore -= 5;

      cleaned.qualityScore = Math.max(0, qualityScore);

      // Step 4: Update document with cleaned data
      await snapshot.ref.update(cleaned);
      logger.info('Car data updated', { carId, qualityScore });

      // Step 5: Log processing event
      await db.collection('data_processing_logs').add({
        carId,
        action: 'ingestion',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        qualityScore: cleaned.qualityScore,
        categoryInferred: cleaned.categoryInferred || false,
        warnings: [
          cleaned.priceWarning,
          cleaned.mileageWarning
        ].filter(Boolean)
      });

      logger.info('Data ingestion completed', { carId });
      return { success: true, carId, qualityScore: cleaned.qualityScore };

    } catch (error) {
      logger.error('Data ingestion failed', { error, carId });

      // Log error for monitoring
      await db.collection('data_processing_logs').add({
        carId,
        action: 'ingestion_error',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        error: error instanceof Error ? error.message : String(error)
      });

      // Don't throw - let the document exist but mark as unprocessed
      await snapshot.ref.update({
        processingError: error instanceof Error ? error.message : String(error),
        processingStatus: 'failed'
      });

      return { success: false, carId, error };
    }
  });

/**
 * Manual trigger for re-processing existing cars
 * Call via Firebase Console or client app
 */
export const reprocessCar = functions
  .region('europe-west1')
  .https
  .onCall(async (data, context) => {
    // Require authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Must be authenticated to reprocess cars'
      );
    }

    const { carId } = data;

    if (!carId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'carId is required'
      );
    }

    try {
      const carRef = db.collection('cars').doc(carId);
      const carDoc = await carRef.get();

      if (!carDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          `Car ${carId} not found`
        );
      }

      const carData = carDoc.data();
      if (!carData) {
        throw new functions.https.HttpsError(
          'internal',
          'Car data is empty'
        );
      }

      // Reprocess using same logic
      let cleaned = normalizeFields(carData);

      if (!cleaned.category || cleaned.category === '') {
        let inferredCategory = inferCategoryByRules(cleaned);
        if (!inferredCategory) {
          inferredCategory = await inferCategoryWithGemini(cleaned);
        }
        cleaned.category = inferredCategory;
        cleaned.categoryInferred = true;
      }

      // Recalculate quality score
      let qualityScore = 100;
      if (!cleaned.priceValid) qualityScore -= 20;
      if (!cleaned.mileageValid) qualityScore -= 20;
      if (!cleaned.yearValid) qualityScore -= 20;
      if (!cleaned.images || cleaned.images.length === 0) qualityScore -= 15;
      if (!cleaned.description || cleaned.description.length < 50) qualityScore -= 10;
      if (cleaned.priceWarning) qualityScore -= 10;
      if (cleaned.mileageWarning) qualityScore -= 5;

      cleaned.qualityScore = Math.max(0, qualityScore);
      cleaned.reprocessedAt = admin.firestore.FieldValue.serverTimestamp();

      await carRef.update(cleaned);

      logger.info('Car reprocessed successfully', { carId });

      return {
        success: true,
        carId,
        qualityScore: cleaned.qualityScore,
        category: cleaned.category
      };

    } catch (error) {
      logger.error('Car reprocessing failed', { error, carId });
      throw new functions.https.HttpsError(
        'internal',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  });
