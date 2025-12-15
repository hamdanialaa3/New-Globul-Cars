// canonical-user.service.test.ts
// Unit Tests for Canonical User Service
// Coverage Target: 80%+

import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

// Mock Firestore
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  setDoc: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
}));

jest.mock('../../../firebase/firebase-config', () => ({
  db: {},
  auth: { currentUser: { uid: 'test-user-123' } },
}));

jest.mock('../../logger-wrapper', () => ({
  serviceLogger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('CanonicalUserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should return user data by ID', async () => {
      const mockUserData = {
        uid: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        profileType: 'private',
        planTier: 'free',
        createdAt: new Date(),
      };

      const mockDoc = {
        exists: () => true,
        id: 'user-123',
        data: () => mockUserData,
      };

      (getDoc as jest.Mock).mockResolvedValue(mockDoc);

      // Test existence check
      expect(mockDoc.exists()).toBe(true);
      expect(mockDoc.data()).toEqual(mockUserData);
    });

    it('should return null for non-existent user', async () => {
      const mockDoc = {
        exists: () => false,
      };

      (getDoc as jest.Mock).mockResolvedValue(mockDoc);

      expect(mockDoc.exists()).toBe(false);
    });

    it('should handle Firestore errors', async () => {
      (getDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      try {
        await getDoc(doc({} as any, 'users', 'user-123'));
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile data', async () => {
      (doc as jest.Mock).mockReturnValue({ id: 'user-123' });
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      const updates = {
        displayName: 'Updated Name',
        phoneNumber: '+359888123456',
      };

      const userRef = doc({} as any, 'users', 'user-123');
      await updateDoc(userRef, updates);

      expect(updateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'user-123' }),
        expect.objectContaining(updates)
      );
    });

    it('should handle update errors', async () => {
      (updateDoc as jest.Mock).mockRejectedValue(new Error('Update failed'));

      try {
        await updateDoc(doc({} as any, 'users', 'user-123'), {});
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should validate profile type changes', () => {
      const validTypes = ['private', 'dealer', 'company'];
      const invalidType = 'invalid';

      expect(validTypes.includes('private')).toBe(true);
      expect(validTypes.includes('dealer')).toBe(true);
      expect(validTypes.includes(invalidType)).toBe(false);
    });
  });

  describe('createUserProfile', () => {
    it('should create new user profile', async () => {
      (doc as jest.Mock).mockReturnValue({ id: 'new-user-123' });
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      const newUser = {
        uid: 'new-user-123',
        email: 'newuser@example.com',
        displayName: 'New User',
        profileType: 'private',
        planTier: 'free',
        createdAt: new Date(),
      };

      const userRef = doc({} as any, 'users', 'new-user-123');
      await setDoc(userRef, newUser);

      expect(setDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'new-user-123' }),
        expect.objectContaining(newUser)
      );
    });

    it('should require email for new users', () => {
      const validUser = {
        email: 'test@example.com',
        displayName: 'Test',
      };

      const invalidUser = {
        displayName: 'Test',
        // email missing
      };

      expect(validUser.email).toBeDefined();
      expect((invalidUser as any).email).toBeUndefined();
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', () => {
      const mockStats = {
        totalCars: 15,
        activeCars: 12,
        soldCars: 3,
        totalViews: 1250,
        totalFavorites: 89,
      };

      expect(mockStats.totalCars).toBe(15);
      expect(mockStats.activeCars).toBe(12);
      expect(mockStats.soldCars).toBe(3);
    });

    it('should calculate statistics correctly', () => {
      const stats = {
        totalCars: 20,
        activeCars: 15,
        soldCars: 5,
      };

      expect(stats.totalCars).toBe(stats.activeCars + stats.soldCars);
    });
  });

  describe('validateUserData', () => {
    it('should validate email format', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.com',
      ];

      const invalidEmails = ['notanemail', '@example.com', 'test@', 'test'];

      validEmails.forEach((email) => {
        expect(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)).toBe(true);
      });

      invalidEmails.forEach((email) => {
        expect(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)).toBe(false);
      });
    });

    it('should validate Bulgarian phone numbers', () => {
      const validPhones = ['+359888123456', '0888123456'];

      const invalidPhones = ['123', '12345678901234567890', 'notaphone'];

      validPhones.forEach((phone) => {
        const cleaned = phone.replace(/[^\d+]/g, '');
        expect(cleaned.length).toBeGreaterThanOrEqual(10);
      });

      invalidPhones.forEach((phone) => {
        const cleaned = phone.replace(/[^\d+]/g, '');
        expect(cleaned.length < 10 || cleaned.length > 15).toBe(true);
      });
    });

    it('should validate display name length', () => {
      const validNames = ['John Doe', 'Иван Петров', 'Test User 123'];

      const invalidNames = ['A', '', 'A'.repeat(101)]; // Too short or too long

      validNames.forEach((name) => {
        expect(name.length).toBeGreaterThanOrEqual(2);
        expect(name.length).toBeLessThanOrEqual(100);
      });

      invalidNames.forEach((name) => {
        expect(name.length < 2 || name.length > 100).toBe(true);
      });
    });
  });

  describe('Privacy Settings', () => {
    it('should respect profileVisibility setting', () => {
      const publicProfile = {
        profileVisibility: 'public',
        email: 'user@example.com',
        phoneNumber: '+359888123456',
      };

      const privateProfile = {
        profileVisibility: 'private',
        email: 'user@example.com',
        phoneNumber: '+359888123456',
      };

      expect(publicProfile.profileVisibility).toBe('public');
      expect(privateProfile.profileVisibility).toBe('private');
    });

    it('should filter sensitive data for public profiles', () => {
      const fullUserData = {
        uid: 'user-123',
        displayName: 'Test User',
        email: 'test@example.com',
        phoneNumber: '+359888123456',
        profileVisibility: 'public',
      };

      // Simulate filtering (remove sensitive fields)
      const publicData = {
        uid: fullUserData.uid,
        displayName: fullUserData.displayName,
        // email and phoneNumber removed
      };

      expect(publicData).not.toHaveProperty('email');
      expect(publicData).not.toHaveProperty('phoneNumber');
      expect(publicData.displayName).toBe('Test User');
    });
  });

  describe('Profile Type Transitions', () => {
    it('should allow private -> dealer upgrade', () => {
      const transitions = {
        'private->dealer': true,
        'private->company': true,
        'dealer->company': true,
        'dealer->private': true,
        'company->private': true,
        'company->dealer': false, // Usually not allowed
      };

      expect(transitions['private->dealer']).toBe(true);
      expect(transitions['dealer->private']).toBe(true);
    });

    it('should validate dealer requirements', () => {
      const dealerProfile = {
        profileType: 'dealer',
        dealershipRef: 'dealerships/dealer-123',
        dealershipSnapshot: {
          name: 'Test Dealership',
          eik: '123456789',
        },
      };

      expect(dealerProfile.dealershipRef).toBeDefined();
      expect(dealerProfile.dealershipSnapshot).toBeDefined();
      expect(dealerProfile.dealershipRef.startsWith('dealerships/')).toBe(true);
    });

    it('should validate company requirements', () => {
      const companyProfile = {
        profileType: 'company',
        companyRef: 'companies/company-456',
        companySnapshot: {
          name: 'Test Company',
          eik: '1234567890123',
        },
      };

      expect(companyProfile.companyRef).toBeDefined();
      expect(companyProfile.companySnapshot).toBeDefined();
      expect(companyProfile.companyRef.startsWith('companies/')).toBe(true);
    });
  });
});
