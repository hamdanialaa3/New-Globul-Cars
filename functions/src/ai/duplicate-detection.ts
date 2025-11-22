/**
 * AI-Powered Duplicate Detection
 * Zero-Cost Implementation using Firestore queries + simple text matching
 * 
 * Features:
 * - Text-based duplicate detection (title, seller, specs)
 * - Fuzzy matching for similar listings
 * - Automatic flagging of suspicious duplicates
 * - Prevention of spam/scam listings
 * 
 * Replaces: ML-based similarity (€100+/month training cost)
 * Cost: €0 (within Firestore read quotas)
 * 
 * Note: Advanced image-based duplicate detection (perceptual hashing) postponed
 * to paid tier due to computational cost.
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
 * Normalize text for comparison
 * - Remove extra spaces
 * - Convert to lowercase
 * - Remove special characters
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\sа-яА-Я]/g, ''); // Keep Cyrillic for Bulgarian
}

/**
 * Calculate Levenshtein distance (edit distance)
 * For fuzzy text matching
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,    // deletion
          dp[i][j - 1] + 1,    // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Calculate similarity percentage between two strings
 */
function calculateSimilarity(str1: string, str2: string): number {
  const normalized1 = normalizeText(str1);
  const normalized2 = normalizeText(str2);

  if (normalized1 === normalized2) return 100;

  const distance = levenshteinDistance(normalized1, normalized2);
  const maxLength = Math.max(normalized1.length, normalized2.length);

  if (maxLength === 0) return 100;

  return ((maxLength - distance) / maxLength) * 100;
}

/**
 * Check if two cars have similar specifications
 */
function areSpecsSimilar(car1: any, car2: any): {
  isSimilar: boolean;
  matchedFields: string[];
  score: number;
} {
  const fieldsToCompare = ['make', 'model', 'year', 'fuel', 'transmission', 'mileage', 'price'];
  let matches = 0;
  const matchedFields: string[] = [];

  for (const field of fieldsToCompare) {
    if (!car1[field] || !car2[field]) continue;

    if (field === 'year' || field === 'mileage' || field === 'price') {
      // Numeric fields: allow ±5% tolerance
      const val1 = Number(car1[field]);
      const val2 = Number(car2[field]);
      const tolerance = field === 'year' ? 1 : val1 * 0.05;

      if (Math.abs(val1 - val2) <= tolerance) {
        matches++;
        matchedFields.push(field);
      }
    } else {
      // Text fields: exact match (case-insensitive)
      if (normalizeText(car1[field]) === normalizeText(car2[field])) {
        matches++;
        matchedFields.push(field);
      }
    }
  }

  const score = (matches / fieldsToCompare.length) * 100;
  const isSimilar = score >= 70; // 70% match threshold

  return { isSimilar, matchedFields, score };
}

/**
 * Find potential duplicates in Firestore
 */
async function findPotentialDuplicates(carData: any): Promise<Array<{
  id: string;
  data: any;
  titleSimilarity: number;
  specsSimilarity: number;
  overallScore: number;
  reasons: string[];
  fraudSuspicion?: boolean;
}>> {
  const results: Array<any> = [];

  try {
    // Query 1: Same seller
    if (carData.seller?.id) {
      const sameSeller = await db.collection('cars')
        .where('seller.id', '==', carData.seller.id)
        .where('createdAt', '>', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Last 30 days
        .limit(10)
        .get();

      for (const doc of sameSeller.docs) {
        const existingCar = doc.data();

        // Calculate similarities
        const titleSimilarity = calculateSimilarity(
          carData.title || '',
          existingCar.title || ''
        );

        const specsMatch = areSpecsSimilar(carData, existingCar);

        const overallScore = (titleSimilarity * 0.6) + (specsMatch.score * 0.4);

        if (overallScore >= 60) { // 60% overall match threshold
          const reasons: string[] = [];

          if (titleSimilarity >= 80) reasons.push('Very similar title');
          if (specsMatch.isSimilar) reasons.push(`Similar specs (${specsMatch.matchedFields.join(', ')})`);
          if (carData.seller.id === existingCar.seller?.id) reasons.push('Same seller');

          // Check if images are identical (simple URL comparison)
          if (carData.images && existingCar.images) {
            const sharedImages = carData.images.filter((img: string) =>
              existingCar.images.includes(img)
            );
            if (sharedImages.length > 0) {
              reasons.push(`${sharedImages.length} shared images`);
            }
          }

          results.push({
            id: doc.id,
            data: existingCar,
            titleSimilarity,
            specsSimilarity: specsMatch.score,
            overallScore,
            reasons,
            fraudSuspicion: false // Same seller, not fraud
          });
        }
      }
    }

    // Query 2: Same make + model + year (different sellers - potential fraud)
    if (carData.make && carData.model && carData.year) {
      const sameCar = await db.collection('cars')
        .where('make', '==', carData.make)
        .where('model', '==', carData.model)
        .where('year', '==', carData.year)
        .limit(20)
        .get();

      for (const doc of sameCar.docs) {
        // Skip if already in results
        if (results.some(r => r.id === doc.id)) continue;

        const existingCar = doc.data();

        // Skip if same seller (already checked above)
        if (carData.seller?.id === existingCar.seller?.id) continue;

        const titleSimilarity = calculateSimilarity(
          carData.title || '',
          existingCar.title || ''
        );

        const specsMatch = areSpecsSimilar(carData, existingCar);

        // For different sellers, require higher similarity (fraud detection)
        const overallScore = (titleSimilarity * 0.5) + (specsMatch.score * 0.5);

        if (overallScore >= 85) { // Higher threshold for fraud detection
          const reasons: string[] = ['Potential fraud - very similar listing from different seller'];

          if (titleSimilarity >= 90) reasons.push('Nearly identical title');
          if (specsMatch.score >= 90) reasons.push('Nearly identical specs');

          results.push({
            id: doc.id,
            data: existingCar,
            titleSimilarity,
            specsSimilarity: specsMatch.score,
            overallScore,
            reasons,
            fraudSuspicion: true // Flag for manual review
          });
        }
      }
    }

    // Sort by overall score (highest first)
    results.sort((a, b) => b.overallScore - a.overallScore);

    return results;

  } catch (error) {
    logger.error('Duplicate search failed', { error });
    return [];
  }
}

/**
 * Cloud Function: Check for duplicates on car creation
 */
export const checkDuplicatesOnCreate = functions
  .region('europe-west1')
  .firestore
  .document('cars/{carId}')
  .onCreate(async (snapshot, context) => {
    const carId = context.params.carId;
    const carData = snapshot.data();

    try {
      logger.info('Duplicate detection started', { carId });

      const duplicates = await findPotentialDuplicates(carData);

      if (duplicates.length > 0) {
        logger.warn('Potential duplicates found', {
          carId,
          duplicateCount: duplicates.length,
          topMatch: duplicates[0]
        });

        // Update car document with duplicate flags
        await snapshot.ref.update({
          duplicateCheck: {
            checked: true,
            checkedAt: admin.firestore.FieldValue.serverTimestamp(),
            duplicatesFound: duplicates.length,
            topMatches: duplicates.slice(0, 3).map(d => ({
              carId: d.id,
              overallScore: d.overallScore,
              reasons: d.reasons,
              fraudSuspicion: d.fraudSuspicion || false
            })),
            needsReview: duplicates.some(d => d.overallScore >= 85 || d.fraudSuspicion)
          }
        });

        // If high fraud suspicion, flag for admin review
        if (duplicates.some(d => d.fraudSuspicion && d.overallScore >= 90)) {
          await db.collection('admin_review_queue').add({
            type: 'fraud_suspicion',
            carId,
            severity: 'high',
            reason: 'Potential duplicate/fraud listing',
            duplicates: duplicates.filter(d => d.fraudSuspicion),
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });

          logger.warn('High fraud suspicion - flagged for admin review', { carId });
        }

        // Log to monitoring
        await db.collection('duplicate_detection_logs').add({
          carId,
          duplicatesFound: duplicates.length,
          topScore: duplicates[0].overallScore,
          fraudSuspicion: duplicates.some(d => d.fraudSuspicion),
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
      } else {
        // No duplicates found
        await snapshot.ref.update({
          duplicateCheck: {
            checked: true,
            checkedAt: admin.firestore.FieldValue.serverTimestamp(),
            duplicatesFound: 0,
            needsReview: false
          }
        });

        logger.info('No duplicates found', { carId });
      }

      return {
        success: true,
        carId,
        duplicatesFound: duplicates.length
      };

    } catch (error) {
      logger.error('Duplicate detection failed', { error, carId });

      // Mark as unchecked (can retry manually)
      await snapshot.ref.update({
        duplicateCheck: {
          checked: false,
          error: error instanceof Error ? error.message : String(error),
          failedAt: admin.firestore.FieldValue.serverTimestamp()
        }
      });

      return {
        success: false,
        carId,
        error
      };
    }
  });

/**
 * Manual duplicate check via HTTP call
 */
export const checkDuplicates = functions
  .region('europe-west1')
  .https
  .onCall(async (data, context) => {
    // Require authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Must be authenticated to check duplicates'
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

      const duplicates = await findPotentialDuplicates(carData);

      logger.info('Manual duplicate check completed', {
        carId,
        duplicatesFound: duplicates.length
      });

      return {
        success: true,
        carId,
        duplicatesFound: duplicates.length,
        duplicates: duplicates.map(d => ({
          carId: d.id,
          title: d.data.title,
          seller: d.data.seller?.name || 'Unknown',
          overallScore: d.overallScore,
          titleSimilarity: d.titleSimilarity,
          specsSimilarity: d.specsSimilarity,
          reasons: d.reasons,
          fraudSuspicion: d.fraudSuspicion || false
        }))
      };

    } catch (error) {
      logger.error('Manual duplicate check failed', { error, carId });
      throw new functions.https.HttpsError(
        'internal',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  });

/**
 * Scheduled function: Periodic scan for duplicates across all active listings
 * Run once per day to catch duplicates that were missed during creation
 */
export const scanForDuplicatesBatch = functions
  .region('europe-west1')
  .runWith({
    timeoutSeconds: 540,
    memory: '1GB'
  })
  .pubsub
  .schedule('0 3 * * *') // Daily at 3 AM (low traffic time)
  .timeZone('Europe/Sofia')
  .onRun(async (context) => {
    try {
      logger.info('Starting batch duplicate scan');

      // Get all active listings from last 60 days
      const recentCars = await db.collection('cars')
        .where('status', '==', 'active')
        .where('createdAt', '>', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000))
        .get();

      logger.info('Scanning cars for duplicates', { count: recentCars.size });

      let duplicatesFound = 0;
      let fraudCasesFound = 0;

      // Process in batches to avoid timeout
      const batchSize = 50;
      const cars = recentCars.docs;

      for (let i = 0; i < cars.length; i += batchSize) {
        const batch = cars.slice(i, i + batchSize);

        await Promise.all(batch.map(async (carDoc) => {
          const carData = carDoc.data();
          const duplicates = await findPotentialDuplicates(carData);

          if (duplicates.length > 0) {
            duplicatesFound++;

            if (duplicates.some(d => d.fraudSuspicion)) {
              fraudCasesFound++;
            }

            // Update document
            await carDoc.ref.update({
              'duplicateCheck.lastBatchScan': admin.firestore.FieldValue.serverTimestamp(),
              'duplicateCheck.duplicatesFound': duplicates.length,
              'duplicateCheck.needsReview': duplicates.some(d => d.overallScore >= 85)
            });
          }
        }));

        // Small delay between batches
        if (i + batchSize < cars.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      logger.info('Batch duplicate scan completed', {
        totalScanned: cars.length,
        duplicatesFound,
        fraudCasesFound
      });

      // Log summary
      await db.collection('batch_scan_logs').add({
        type: 'duplicate_scan',
        totalScanned: cars.length,
        duplicatesFound,
        fraudCasesFound,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      return {
        success: true,
        totalScanned: cars.length,
        duplicatesFound,
        fraudCasesFound
      };

    } catch (error) {
      logger.error('Batch duplicate scan failed', { error });
      return { success: false, error };
    }
  });
