// src/services/security/delete-account.service.ts
// Real account deletion flow with optional re-authentication.
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import {
  getAuth,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  GoogleAuthProvider,
  Auth
} from 'firebase/auth';
import { auth as defaultAuth } from '../../firebase/firebase-config';

export type ReauthOptions =
  | { method: 'password'; email: string; password: string }
  | { method: 'google' };

export class DeleteAccountService {
  private auth: Auth;

  constructor(authInstance?: Auth) {
    this.auth = authInstance || getAuth();
  }

  /**
   * Deletes the currently authenticated user. If recent login is required,
   * you can pass re-auth options and the method will retry automatically.
   */
  async deleteCurrentUser(options?: ReauthOptions): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No authenticated user');

    try {
      await deleteUser(user);
      return;
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      if (firebaseError?.code === 'auth/requires-recent-login') {
        if (!options) {
          const e = new Error('REAUTH_REQUIRED');
          (e as { code?: string }).code = 'REAUTH_REQUIRED';
          throw e;
        }

        if (options.method === 'password') {
          const cred = EmailAuthProvider.credential(options.email, options.password);
          await reauthenticateWithCredential(user, cred);
        } else if (options.method === 'google') {
          const provider = new GoogleAuthProvider();
          await reauthenticateWithPopup(user, provider);
        }

        // retry deletion after successful re-auth
        await deleteUser(user);
        return;
      }
      throw err;
    }
  }
}

// Default singleton
export const deleteAccountService = new DeleteAccountService(defaultAuth);

/**
 * Convenience helper: tries to delete without re-auth, and surfaces a clear
 * error code if re-auth is needed so UI can prompt credentials.
 */
export async function deleteAccount(options?: ReauthOptions): Promise<{ success: boolean; reauthNeeded?: boolean; error?: string }>{
  try {
    await deleteAccountService.deleteCurrentUser(options);
    return { success: true };
  } catch (err: unknown) {
    const firebaseError = err as { code?: string; message?: string };
    if (firebaseError?.code === 'REAUTH_REQUIRED' || firebaseError?.code === 'auth/requires-recent-login') {
      return { success: false, reauthNeeded: true, error: firebaseError?.message || 'Unknown error' };
    }
    return { success: false, error: firebaseError?.message || 'Unknown error' };
  }
}
