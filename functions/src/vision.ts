// functions/src/vision.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as vision from '@google-cloud/vision';
import { logger } from 'firebase-functions';

// Initialize Admin SDK and Vision Client if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}
const visionClient = new vision.ImageAnnotatorClient();
const db = admin.firestore();

/**
 * Triggered when a new image is uploaded to the 'cars' folder in Cloud Storage.
 * Analyzes the image for safe search content and relevant labels.
 */
export const analyzeCarImage = functions.storage
  .object()
  .onFinalize(async (object) => {
    const filePath = object.name; // e.g., 'cars/carId/imageName.jpg'
    const bucketName = object.bucket;
    const contentType = object.contentType;

    // Exit if this is not an image or not in the 'cars' folder.
    if (!contentType?.startsWith('image/') || !filePath?.startsWith('cars/')) {
      logger.info('This is not an image or not in the cars folder. Skipping analysis.');
      return null;
    }

    // Extract the carId from the file path.
    const parts = filePath.split('/');
    if (parts.length < 3) {
        logger.info(`File path ${filePath} is not valid for car image analysis. Skipping.`);
        return null;
    }
    const carId = parts[1];

    logger.info(`Analyzing image for carId: ${carId}, path: ${filePath}`);

    const gcsUri = `gs://${bucketName}/${filePath}`;

    try {
      // 1. Safe Search Analysis
      const [safeSearchResult] = await visionClient.safeSearchDetection(gcsUri);
      const safeSearch = safeSearchResult.safeSearchAnnotation;

      const isAdult = safeSearch?.adult === 'VERY_LIKELY' || safeSearch?.adult === 'LIKELY';
      const isViolent = safeSearch?.violence === 'VERY_LIKELY' || safeSearch?.violence === 'LIKELY';
      const isRacy = safeSearch?.racy === 'VERY_LIKELY' || safeSearch?.racy === 'LIKELY';

      const isSafe = !isAdult && !isViolent && !isRacy;
      logger.info(`Safe Search results: isSafe=${isSafe}`);

      // 2. Label Detection
      const [labelResult] = await visionClient.labelDetection(gcsUri);
      const labels = labelResult.labelAnnotations?.map(label => label.description).filter(Boolean) as string[];
      logger.info(`Labels detected: ${labels.join(', ')}`);

      // 3. Update Firestore
      const carDocRef = db.collection('cars').doc(carId);
      const updateData: { [key: string]: any } = {
        imageAnalysis: {
          isSafe: isSafe,
          labels: admin.firestore.FieldValue.arrayUnion(...labels),
          lastAnalyzed: admin.firestore.FieldValue.serverTimestamp()
        }
      };

      // If the image is not safe, flag the car for review.
      if (!isSafe) {
        updateData['status'] = 'needs_review';
        logger.warn(`Image for car ${carId} flagged as unsafe.`);
      }

      await carDocRef.set(updateData, { merge: true });
      logger.info(`Successfully updated car ${carId} with image analysis results.`);

      return null;

    } catch (error) {
      logger.error(`Failed to analyze image ${filePath}.`, error);
      return null;
    }
  });
