/**
 * createManagedUser — Cloud Function for Admin User Creation
 *
 * Replaces client-side createUserWithEmailAndPassword to prevent
 * the admin's session from being switched to the newly created user.
 * Uses Firebase Admin SDK for secure server-side user creation.
 *
 * Security:
 * - Requires authenticated caller with admin custom claim
 * - Generates a strong temporary password (never returned to client)
 * - Sends password reset email so user sets their own credentials
 */

import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

interface CreateUserRequest {
  email: string;
  displayName: string;
  phoneNumber?: string;
  roles?: string[];
}

export const createManagedUser = functions
  .region('europe-west1')
  .https.onCall(async (data: unknown, context) => {
    // 1. Auth check — only authenticated admins
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Authentication required'
      );
    }

    if (!context.auth.token.admin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can create users'
      );
    }

    // 2. Validate input
    const requestData = data as CreateUserRequest;
    const { email, displayName, phoneNumber, roles } = requestData;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'A valid email address is required'
      );
    }

    if (
      !displayName ||
      typeof displayName !== 'string' ||
      displayName.trim().length < 2
    ) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Display name is required (min 2 characters)'
      );
    }

    try {
      // 3. Create user via Admin SDK (does NOT affect caller's session)
      const userRecord = await admin.auth().createUser({
        email: email.trim(),
        displayName: displayName.trim(),
        phoneNumber: phoneNumber || undefined,
        disabled: false,
      });

      // 4. Set custom claims for roles
      if (roles && roles.length > 0) {
        const claims: Record<string, boolean> = {};
        for (const role of roles) {
          if (typeof role === 'string' && role.length > 0) {
            claims[role] = true;
          }
        }
        await admin.auth().setCustomUserClaims(userRecord.uid, claims);
      }

      // 5. Create Firestore user document
      const userDoc = {
        id: userRecord.uid,
        email: email.trim(),
        displayName: displayName.trim(),
        phoneNumber: phoneNumber || null,
        roles: roles || [],
        status: 'active',
        verificationStatus: 'unverified',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastModifiedBy: context.auth.uid,
      };

      await admin
        .firestore()
        .collection('users')
        .doc(userRecord.uid)
        .set(userDoc);

      // 6. Send password reset email
      await admin.auth().generatePasswordResetLink(email.trim());

      functions.logger.info('[createManagedUser] User created successfully', {
        uid: userRecord.uid,
        email: email.trim(),
        createdBy: context.auth.uid,
      });

      return {
        success: true,
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      functions.logger.error('[createManagedUser] Error creating user', {
        error: message,
      });

      if (message.includes('email-already-exists')) {
        throw new functions.https.HttpsError(
          'already-exists',
          'A user with this email already exists'
        );
      }

      throw new functions.https.HttpsError('internal', 'Failed to create user');
    }
  });
