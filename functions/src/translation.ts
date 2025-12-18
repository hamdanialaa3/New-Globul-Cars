// functions/src/translation.ts
import * as functions from 'firebase-functions';
import { v2 } from '@google-cloud/translate';
import { logger } from './utils/logger';

const translateClient = new v2.Translate();

/**
 * A callable function to translate a given text to a target language.
 */
export const translateText = functions.https.onCall(async (data, context) => {
  // 1. Authentication Check: Make sure the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const { text, targetLanguage } = data;

  // 2. Validation: Check if the required parameters are provided.
  if (!text || !targetLanguage) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function must be called with "text" and "targetLanguage" arguments.'
    );
  }

  try {
    logger.info(`Translating text to ${targetLanguage}`, { textLength: text.length });

    // 3. Translation: Use the Google Cloud Translate API.
    const [translation] = await translateClient.translate(text, targetLanguage);

    logger.info(`Translation successful`, { targetLanguage, resultLength: translation.length });

    // 4. Return Result: Send the translated text back to the client.
    return { translatedText: translation };

  } catch (error) {
    logger.error('Error during translation', { targetLanguage });
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while translating the text.'
    );
  }
});
