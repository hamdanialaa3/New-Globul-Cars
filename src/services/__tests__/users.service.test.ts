/**
 * Users Service Tests
 * Tests for user profile CRUD and access control operations
 *
 * @file users.service.test.ts
 * @since 2026-02-19
 */
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  limit: vi.fn(),
}));

vi.mock('../../firebase/firebase-config', () => ({
  db: {},
}));

vi.mock('../logger-service', () => ({
  serviceLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

import {
  getUserById,
  getUserByNumericId,
  getUserBySlug,
  isUserAdmin,
  isOwner,
  canAccessUserSettings,
} from '../users.service';
import { getDoc, getDocs } from 'firebase/firestore';

// Helper to create mock Firestore document
function mockDocSnap(id: string, data: Record<string, any>, exists = true) {
  return {
    id,
    exists: () => exists,
    data: () => data,
    ref: { id },
  };
}

function mockQuerySnapshot(docs: any[]) {
  return {
    empty: docs.length === 0,
    docs,
    size: docs.length,
  };
}

// Common test user data
const testUserData = {
  uid: 'user-uid-123',
  numericId: 456,
  profileSlug: 'john-doe',
  email: 'john@example.com',
  displayName: 'John Doe',
  photoURL: 'https://example.com/photo.jpg',
  roles: ['user'],
  profileType: 'private' as const,
  phoneNumber: '+359 888 123456',
  locationData: { cityName: 'Sofia', regionName: 'Sofia-City' },
};

const adminUserData = {
  ...testUserData,
  uid: 'admin-uid-1',
  numericId: 1,
  profileSlug: 'admin',
  email: 'admin@koli.one',
  displayName: 'Admin User',
  roles: ['admin'],
};

const superAdminData = {
  ...testUserData,
  uid: 'super-uid-1',
  numericId: 2,
  roles: ['superadmin'],
};

describe('users.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── getUserById ───────────────────────────────────────────────
  describe('getUserById', () => {
    it('should find user by Firebase UID', async () => {
      (getDoc as Mock).mockResolvedValue(mockDocSnap('user-uid-123', testUserData));

      const result = await getUserById('user-uid-123');

      expect(result).not.toBeNull();
      expect(result!.userId).toBe('user-uid-123');
      expect(result!.userNumericId).toBe(456);
      expect(result!.slug).toBe('john-doe');
      expect(result!.email).toBe('john@example.com');
      expect(result!.displayName).toBe('John Doe');
      expect(result!.roles).toEqual(['user']);
    });

    it('should return null when user not found', async () => {
      (getDoc as Mock).mockResolvedValue(mockDocSnap('missing-id', {}, false));

      const result = await getUserById('missing-id');

      expect(result).toBeNull();
    });

    it('should throw on Firestore error', async () => {
      (getDoc as Mock).mockRejectedValue(new Error('Firestore unavailable'));

      await expect(getUserById('err-id')).rejects.toThrow('Firestore unavailable');
    });

    it('should map BulgarianUser fields correctly', async () => {
      (getDoc as Mock).mockResolvedValue(mockDocSnap('uid-1', testUserData));

      const result = await getUserById('uid-1');

      expect(result!.phoneNumber).toBe('+359 888 123456');
      expect(result!.locationData?.cityName).toBe('Sofia');
      expect(result!.locationData?.regionName).toBe('Sofia-City');
      expect(result!.profileType).toBe('private');
    });

    it('should handle user with no slug (profileSlug)', async () => {
      const noSlugUser = { ...testUserData, profileSlug: undefined, slug: undefined };
      (getDoc as Mock).mockResolvedValue(mockDocSnap('uid-noslug', noSlugUser));

      const result = await getUserById('uid-noslug');

      expect(result!.slug).toBeUndefined();
    });
  });

  // ─── getUserByNumericId ────────────────────────────────────────
  describe('getUserByNumericId', () => {
    it('should find user by numeric ID', async () => {
      (getDocs as Mock).mockResolvedValue(
        mockQuerySnapshot([mockDocSnap('uid-456', testUserData)])
      );

      const result = await getUserByNumericId(456);

      expect(result).not.toBeNull();
      expect(result!.userNumericId).toBe(456);
      expect(result!.slug).toBe('john-doe');
    });

    it('should return null when numeric ID not found', async () => {
      (getDocs as Mock).mockResolvedValue(mockQuerySnapshot([]));

      const result = await getUserByNumericId(99999);

      expect(result).toBeNull();
    });

    it('should throw on Firestore error', async () => {
      (getDocs as Mock).mockRejectedValue(new Error('Network error'));

      await expect(getUserByNumericId(1)).rejects.toThrow('Network error');
    });
  });

  // ─── getUserBySlug ─────────────────────────────────────────────
  describe('getUserBySlug', () => {
    it('should find user by slug (profileSlug)', async () => {
      (getDocs as Mock).mockResolvedValue(
        mockQuerySnapshot([mockDocSnap('uid-slug', testUserData)])
      );

      const result = await getUserBySlug('john-doe');

      expect(result).not.toBeNull();
      expect(result!.slug).toBe('john-doe');
      expect(result!.displayName).toBe('John Doe');
    });

    it('should return null when slug not found', async () => {
      (getDocs as Mock).mockResolvedValue(mockQuerySnapshot([]));

      const result = await getUserBySlug('nonexistent-slug');

      expect(result).toBeNull();
    });

    it('should throw on Firestore error', async () => {
      (getDocs as Mock).mockRejectedValue(new Error('Auth error'));

      await expect(getUserBySlug('test')).rejects.toThrow('Auth error');
    });
  });

  // ─── isUserAdmin ───────────────────────────────────────────────
  describe('isUserAdmin', () => {
    it('should return true for admin role', async () => {
      (getDoc as Mock).mockResolvedValue(mockDocSnap('admin-id', adminUserData));

      const result = await isUserAdmin('admin-id');

      expect(result).toBe(true);
    });

    it('should return true for superadmin role', async () => {
      (getDoc as Mock).mockResolvedValue(mockDocSnap('super-id', superAdminData));

      const result = await isUserAdmin('super-id');

      expect(result).toBe(true);
    });

    it('should return false for regular user', async () => {
      (getDoc as Mock).mockResolvedValue(mockDocSnap('user-id', testUserData));

      const result = await isUserAdmin('user-id');

      expect(result).toBe(false);
    });

    it('should return false when user not found', async () => {
      (getDoc as Mock).mockResolvedValue(mockDocSnap('missing', {}, false));

      const result = await isUserAdmin('missing');

      expect(result).toBe(false);
    });

    it('should return false on error (fail-safe)', async () => {
      (getDoc as Mock).mockRejectedValue(new Error('DB down'));

      const result = await isUserAdmin('err-id');

      expect(result).toBe(false);
    });
  });

  // ─── isOwner ───────────────────────────────────────────────────
  describe('isOwner', () => {
    it('should return true when IDs match', async () => {
      const result = await isOwner('user-1', 'user-1');
      expect(result).toBe(true);
    });

    it('should return false when IDs differ', async () => {
      const result = await isOwner('user-1', 'user-2');
      expect(result).toBe(false);
    });
  });

  // ─── canAccessUserSettings ─────────────────────────────────────
  describe('canAccessUserSettings', () => {
    it('should allow access for profile owner', async () => {
      // No need for Firestore call since isOwner is synchronous check
      const result = await canAccessUserSettings('user-1', 'user-1');

      expect(result).toBe(true);
    });

    it('should allow access for admin', async () => {
      (getDoc as Mock).mockResolvedValue(mockDocSnap('admin-uid', adminUserData));

      const result = await canAccessUserSettings('admin-uid', 'other-user');

      expect(result).toBe(true);
    });

    it('should allow access for superadmin', async () => {
      (getDoc as Mock).mockResolvedValue(mockDocSnap('super-uid', superAdminData));

      const result = await canAccessUserSettings('super-uid', 'other-user');

      expect(result).toBe(true);
    });

    it('should deny access for non-owner non-admin', async () => {
      (getDoc as Mock).mockResolvedValue(mockDocSnap('regular-uid', testUserData));

      const result = await canAccessUserSettings('regular-uid', 'other-user-uid');

      expect(result).toBe(false);
    });

    it('should return false on error (fail-safe)', async () => {
      (getDoc as Mock).mockRejectedValue(new Error('Permission error'));

      const result = await canAccessUserSettings('uid-1', 'uid-2');

      expect(result).toBe(false);
    });
  });
});
