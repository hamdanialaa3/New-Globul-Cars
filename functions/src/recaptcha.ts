// functions/src/recaptcha.ts
import * as functions from 'firebase-functions';
import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise';

const client = new RecaptchaEnterpriseServiceClient();

const GCP_PROJECT_ID = functions.config().gcp.project_id;
const RECAPTCHA_SITE_KEY = functions.config().recaptcha.site_key;

if (!GCP_PROJECT_ID || !RECAPTCHA_SITE_KEY) {
    console.error("FATAL ERROR: GCP Project ID or reCAPTCHA Site Key is not configured in Firebase Functions.");
}

/**
 * A callable function to verify a reCAPTCHA token from the client.
 */
export const verifyRecaptchaToken = functions.https.onCall(async (data, context) => {
  const { token, action } = data;

  if (!token || !action) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function must be called with "token" and "action" arguments.'
    );
  }

  const projectPath = client.projectPath(GCP_PROJECT_ID);

  const request = {
    assessment: {
      event: {
        token: token,
        siteKey: RECAPTCHA_SITE_KEY,
        expectedAction: action,
      },
    },
    parent: projectPath,
  };

  try {
    const [response] = await client.createAssessment(request);

    if (!response.tokenProperties?.valid) {
      console.error(`reCAPTCHA token is invalid: ${response.tokenProperties?.invalidReason}`);
      throw new functions.https.HttpsError('unauthenticated', 'reCAPTCHA validation failed.');
    }

    if (response.tokenProperties.action !== action) {
        console.error(`reCAPTCHA action mismatch. Expected: ${action}, Got: ${response.tokenProperties.action}`);
        throw new functions.https.HttpsError('unauthenticated', 'reCAPTCHA action mismatch.');
    }

    // The reCAPTCHA score indicates the likelihood that this interaction is legitimate.
    // Score ranges from 0.0 (very likely a bot) to 1.0 (very likely a human).
    const score = response.riskAnalysis?.score;
    console.log(`reCAPTCHA assessment score: ${score}`);

    // You can set a threshold for the score. For login/register, a higher threshold is recommended.
    if (score === null || score === undefined || score < 0.5) {
        throw new functions.https.HttpsError('unauthenticated', 'Low reCAPTCHA score. Please try again.');
    }

    console.log('reCAPTCHA verification successful.');
    return { success: true, score: score };

  } catch (error) {
    console.error('Error during reCAPTCHA verification:', error);
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while verifying reCAPTCHA.'
    );
  }
});
