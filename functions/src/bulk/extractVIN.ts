import * as functions from 'firebase-functions/v1';

const VIN_REGEX = /[A-HJ-NPR-Z0-9]{17}/gi;

export const extractVIN = functions.https.onCall(async (data, context) => {
  if (!context.auth?.uid) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required'
    );
  }

  const texts = Array.isArray(data?.ocrTexts) ? data.ocrTexts : [];
  const candidates = new Set<string>();

  for (const text of texts) {
    if (typeof text !== 'string') {
      continue;
    }
    const matches = text.match(VIN_REGEX) || [];
    for (const vin of matches) {
      candidates.add(vin.toUpperCase());
    }
  }

  return {
    vins: Array.from(candidates),
  };
});
