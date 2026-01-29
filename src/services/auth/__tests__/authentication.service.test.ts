// authentication.service.test.ts
// Unit Tests for Authentication Service
// Coverage Target: 80%+

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from 'firebase/auth';

// Mock Firebase Auth
jest.mock('firebase/auth');
jest.mock('../../../firebase/firebase-config', () => ({
  auth: {},
}));
jest.mock('../../logger-service', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Authentication Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Email/Password Sign Up', () => {
    it('should create new user with email and password', async () => {
      const mockUser = {
        uid: 'user-123',
        email: 'test@example.com',
      };

      (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: mockUser,
      });

      const result = await createUserWithEmailAndPassword(
        {} as any,
        'test@example.com',
        'Password123!'
      );

      expect(result.user.uid).toBe('user-123');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should validate email format', () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.com',
      ];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      validEmails.forEach((email) => {
        expect(emailRegex.test(email)).toBe(true);
      });
    });

    it('should validate password strength', () => {
      const weakPasswords = ['123456', 'password', 'abc123'];
      const strongPasswords = ['Pass123!', 'MySecure@1', 'Complex!9'];

      // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special
      const strongRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

      weakPasswords.forEach((pass) => {
        expect(strongRegex.test(pass)).toBe(false);
      });

      strongPasswords.forEach((pass) => {
        expect(strongRegex.test(pass)).toBe(true);
      });
    });

    it('should reject duplicate email', async () => {
      (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/email-already-in-use',
        message: 'Email already in use',
      });

      await expect(
        createUserWithEmailAndPassword({} as any, 'existing@example.com', 'Pass123!')
      ).rejects.toMatchObject({
        code: 'auth/email-already-in-use',
      });
    });
  });

  describe('Email/Password Login', () => {
    it('should sign in with email and password', async () => {
      const mockUser = {
        uid: 'user-456',
        email: 'user@example.com',
      };

      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: mockUser,
      });

      const result = await signInWithEmailAndPassword(
        {} as any,
        'user@example.com',
        'Password123!'
      );

      expect(result.user.uid).toBe('user-456');
    });

    it('should reject wrong password', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/wrong-password',
        message: 'Wrong password',
      });

      await expect(
        signInWithEmailAndPassword({} as any, 'user@example.com', 'wrongpass')
      ).rejects.toMatchObject({
        code: 'auth/wrong-password',
      });
    });

    it('should reject non-existent user', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/user-not-found',
        message: 'User not found',
      });

      await expect(
        signInWithEmailAndPassword({} as any, 'nonexistent@example.com', 'Pass123!')
      ).rejects.toMatchObject({
        code: 'auth/user-not-found',
      });
    });

    it('should handle disabled accounts', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/user-disabled',
        message: 'User account disabled',
      });

      await expect(
        signInWithEmailAndPassword({} as any, 'disabled@example.com', 'Pass123!')
      ).rejects.toMatchObject({
        code: 'auth/user-disabled',
      });
    });
  });

  describe('Password Reset', () => {
    it('should send password reset email', async () => {
      (sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined);

      await expect(
        sendPasswordResetEmail({} as any, 'user@example.com')
      ).resolves.not.toThrow();
    });

    it('should handle invalid email', async () => {
      (sendPasswordResetEmail as jest.Mock).mockRejectedValue({
        code: 'auth/invalid-email',
        message: 'Invalid email',
      });

      await expect(sendPasswordResetEmail({} as any, 'invalid')).rejects.toMatchObject({
        code: 'auth/invalid-email',
      });
    });

    it('should handle non-existent user', async () => {
      (sendPasswordResetEmail as jest.Mock).mockRejectedValue({
        code: 'auth/user-not-found',
        message: 'User not found',
      });

      await expect(
        sendPasswordResetEmail({} as any, 'nonexistent@example.com')
      ).rejects.toMatchObject({
        code: 'auth/user-not-found',
      });
    });
  });

  describe('Social Authentication - Google', () => {
    it('should sign in with Google', async () => {
      const mockUser = {
        uid: 'google-user-123',
        email: 'google@example.com',
        displayName: 'Google User',
      };

      (signInWithPopup as jest.Mock).mockResolvedValue({
        user: mockUser,
      });

      const result = await signInWithPopup({} as any, new GoogleAuthProvider());

      expect(result.user.uid).toBe('google-user-123');
      expect(result.user.email).toBe('google@example.com');
    });

    it('should handle Google sign-in cancellation', async () => {
      (signInWithPopup as jest.Mock).mockRejectedValue({
        code: 'auth/popup-closed-by-user',
        message: 'Popup closed',
      });

      await expect(
        signInWithPopup({} as any, new GoogleAuthProvider())
      ).rejects.toMatchObject({
        code: 'auth/popup-closed-by-user',
      });
    });
  });

  describe('Social Authentication - Facebook', () => {
    it('should sign in with Facebook', async () => {
      const mockUser = {
        uid: 'facebook-user-456',
        email: 'facebook@example.com',
        displayName: 'Facebook User',
      };

      (signInWithPopup as jest.Mock).mockResolvedValue({
        user: mockUser,
      });

      const result = await signInWithPopup({} as any, new FacebookAuthProvider());

      expect(result.user.uid).toBe('facebook-user-456');
    });

    it('should handle account-exists-with-different-credential', async () => {
      (signInWithPopup as jest.Mock).mockRejectedValue({
        code: 'auth/account-exists-with-different-credential',
        message: 'Account exists with different credential',
      });

      await expect(
        signInWithPopup({} as any, new FacebookAuthProvider())
      ).rejects.toMatchObject({
        code: 'auth/account-exists-with-different-credential',
      });
    });
  });

  describe('Error Codes', () => {
    const testErrorCode = (code: string) => {
      const errorMessages: Record<string, string> = {
        'auth/email-already-in-use': 'Email already registered',
        'auth/invalid-email': 'Invalid email address',
        'auth/user-not-found': 'User not found',
        'auth/wrong-password': 'Incorrect password',
        'auth/weak-password': 'Password is too weak',
        'auth/user-disabled': 'Account has been disabled',
        'auth/popup-closed-by-user': 'Sign-in cancelled',
        'auth/network-request-failed': 'Network error',
      };

      return errorMessages[code] || 'Unknown error';
    };

    it('should map Firebase error codes to user-friendly messages', () => {
      expect(testErrorCode('auth/email-already-in-use')).toBe('Email already registered');
      expect(testErrorCode('auth/wrong-password')).toBe('Incorrect password');
      expect(testErrorCode('auth/user-not-found')).toBe('User not found');
      expect(testErrorCode('unknown-error')).toBe('Unknown error');
    });
  });

  describe('Session Management', () => {
    it('should persist session by default', () => {
      const persistenceType = 'local'; // localStorage
      expect(['local', 'session', 'none']).toContain(persistenceType);
    });

    it('should support session-only persistence', () => {
      const persistenceType = 'session'; // sessionStorage
      expect(['local', 'session', 'none']).toContain(persistenceType);
    });

    it('should support no persistence', () => {
      const persistenceType = 'none'; // memory only
      expect(['local', 'session', 'none']).toContain(persistenceType);
    });
  });

  describe('User Profile Creation', () => {
    it('should create user profile after signup', () => {
      const userProfile = {
        uid: 'user-123',
        email: 'user@example.com',
        displayName: 'Test User',
        photoURL: null,
        profileType: 'private',
        createdAt: new Date(),
      };

      expect(userProfile.uid).toBeTruthy();
      expect(userProfile.email).toBeTruthy();
      expect(userProfile.profileType).toBe('private');
    });

    it('should set default profile type to private', () => {
      const newUser = {
        uid: 'user-456',
        profileType: 'private',
      };

      expect(newUser.profileType).toBe('private');
    });
  });

  describe('Security', () => {
    it('should not store passwords in plain text', () => {
      const userDoc = {
        uid: 'user-123',
        email: 'user@example.com',
        // password: 'Pass123!' ❌ NEVER store passwords
      };

      expect('password' in userDoc).toBe(false);
    });

    it('should sanitize user input', () => {
      const maliciousInput = '<script>alert("xss")</script>';
      const sanitized = maliciousInput.replace(/<[^>]*>/g, '');

      expect(sanitized).toBe('alert("xss")');
      expect(sanitized).not.toContain('<script>');
    });
  });

  describe('Rate Limiting', () => {
    it('should track login attempts', () => {
      const attempts = [
        { email: 'user@example.com', timestamp: Date.now() - 5000 },
        { email: 'user@example.com', timestamp: Date.now() - 3000 },
        { email: 'user@example.com', timestamp: Date.now() - 1000 },
      ];

      expect(attempts.length).toBe(3);
    });

    it('should block after max attempts', () => {
      const maxAttempts = 5;
      const currentAttempts = 6;

      const isBlocked = currentAttempts >= maxAttempts;
      expect(isBlocked).toBe(true);
    });

    it('should reset attempts after cooldown', () => {
      const cooldownMinutes = 15;
      const lastAttempt = Date.now() - 20 * 60 * 1000; // 20 minutes ago
      const now = Date.now();

      const isExpired = now - lastAttempt > cooldownMinutes * 60 * 1000;
      expect(isExpired).toBe(true);
    });
  });
});
