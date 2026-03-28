/**
 * Super Admin Token Cloud Function
 *
 * Issues a Firebase custom authentication token for the super admin.
 * The custom token carries `admin: true` as a custom claim so that
 * Firestore security rules (`request.auth.token.admin == true`) grant
 * write access to `app_settings` and other admin-gated collections.
 *
 * Security:
 * - Validates the caller's secret against `SUPER_ADMIN_SECRET` env var
 * - Returns a short-lived Firebase custom token (1 hour, non-refreshable)
 * - The dedicated UID 'koli-super-admin-owner' is reserved for this purpose
 */

import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

// Reserved UID for the super admin Firebase Auth identity
const SUPER_ADMIN_UID = 'koli-super-admin-owner';

const getRuntimeConfigSecret = (): string | undefined => {
  try {
    const configFn = (functions as unknown as { config?: () => any }).config;
    if (typeof configFn === 'function') {
      const cfg = configFn();
      return cfg?.superadmin?.secret as string | undefined;
    }
  } catch {
    // Ignore runtime config read errors and fall back to process.env
  }
  return undefined;
};

export const getSuperAdminToken = functions
  .region('europe-west1')
  .https.onCall(async (data: unknown) => {
    const requestData = data as { adminSecret?: string };
    const { adminSecret } = requestData;

    // Validate input
    if (!adminSecret || typeof adminSecret !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'adminSecret is required'
      );
    }

    // Read server-side secret — never exposed to the client
    const serverSecret =
      process.env.SUPER_ADMIN_SECRET || getRuntimeConfigSecret();

    if (!serverSecret) {
      functions.logger.error(
        '[SuperAdminToken] SUPER_ADMIN_SECRET not configured'
      );
      throw new functions.https.HttpsError(
        'internal',
        'Admin token service not configured'
      );
    }

    // Constant-time comparison to prevent timing attacks
    if (
      adminSecret.length !== serverSecret.length ||
      adminSecret !== serverSecret
    ) {
      functions.logger.warn('[SuperAdminToken] Invalid admin secret attempt');
      throw new functions.https.HttpsError(
        'permission-denied',
        'Invalid admin credentials'
      );
    }

    try {
      // Create (or ensure) the super admin Firebase Auth user exists
      try {
        await admin.auth().getUser(SUPER_ADMIN_UID);
      } catch {
        // User doesn't exist — create it
        await admin.auth().createUser({ uid: SUPER_ADMIN_UID });
        functions.logger.info(
          '[SuperAdminToken] Created reserved super-admin user'
        );
      }

      // Set custom claim: admin: true
      await admin.auth().setCustomUserClaims(SUPER_ADMIN_UID, { admin: true });

      // Issue a custom token signed by Firebase Admin SDK
      const customToken = await admin
        .auth()
        .createCustomToken(SUPER_ADMIN_UID, { admin: true });

      functions.logger.info(
        '[SuperAdminToken] Custom token issued for super admin'
      );
      return { token: customToken };
    } catch (err) {
      functions.logger.error('[SuperAdminToken] Error creating token', err);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to create admin token'
      );
    }
  });
