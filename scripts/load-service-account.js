// Helper to load Firebase service account credentials securely.
// WARNING: Do not commit real keys. Prefer environment variable FIREBASE_SERVICE_ACCOUNT_JSON (stringified JSON).
// TODO: MANUAL REVIEW REQUIRED - rotate keys in Firebase Console if this file was ever committed publicly.

const path = require('path');

function loadServiceAccount() {
  const envJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (envJson) {
    try {
      return JSON.parse(envJson);
    } catch (err) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is set but failed to parse JSON');
    }
  }

  // Fallback to local file (legacy). Should be removed after key rotation.
  const localPath = path.join(__dirname, '..', 'firebase-service-account.json');
  try {
    // eslint-disable-next-line import/no-dynamic-require, @typescript-eslint/no-var-requires
    const creds = require(localPath);
    console.warn('[SECURITY] Using firebase-service-account.json from repo. Rotate this key and move to env/Secret Manager.');
    return creds;
  } catch (err) {
    throw new Error('Service account not found. Set FIREBASE_SERVICE_ACCOUNT_JSON or provide firebase-service-account.json (temporary).');
  }
}

module.exports = { loadServiceAccount };
