// src/services/users/users-directory.service.ts
import { collection, query, orderBy, limit, startAfter, getDocs, where, DocumentSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { logger } from '../../services/logger-service';
import { USERS_DIRECTORY_CONFIG } from '../../config/users-directory.config';
import type { BulgarianUser } from '../../types/user/bulgarian-user.types';

const DEFAULT_STATS = {
  totalListings: 0,
  activeListings: 0,
  totalViews: 0,
  totalMessages: 0,
  trustScore: 0
};

const DEFAULT_VERIFICATION = {
  email: false,
  phone: false,
  id: false,
  business: false
};

const sanitizeUser = (doc: any): BulgarianUser => {
  const data = doc.data ? doc.data() : doc;
  return {
    ...data,
    uid: doc.id ?? data.uid,
    profileType: data.profileType ?? 'private',
    planTier: data.planTier ?? 'free',
    stats: { ...DEFAULT_STATS, ...data.stats },
    verification: { ...DEFAULT_VERIFICATION, ...data.verification }
  } as BulgarianUser;
};

export interface UsersQueryFilters {
  profileType?: 'private' | 'dealer' | 'company';
  region?: string;
  verifiedOnly?: boolean;
  onlineOnly?: boolean;
}

export interface UsersQueryResult {
  users: BulgarianUser[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}

class UsersDirectoryService {
  async getUsers(
    filters: UsersQueryFilters = {},
    lastDoc: DocumentSnapshot | null = null
  ): Promise<UsersQueryResult> {
    try {
      const usersRef = collection(db, 'users');
      let q = query(usersRef, orderBy('createdAt', 'desc'));

      if (filters.profileType && filters.profileType !== 'private') {
        q = query(q, where('profileType', '==', filters.profileType));
      }

      if (filters.locationData?.regionName) {
        q = query(q, where('location.locationData?.regionName', '==', filters.locationData?.regionName));
      }

      if (filters.verifiedOnly) {
        q = query(q, where('verification.email', '==', true));
      }

      if (filters.onlineOnly) {
        q = query(q, where('isOnline', '==', true));
      }

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      q = query(q, limit(USERS_DIRECTORY_CONFIG.PAGINATION.USERS_PER_PAGE));

      const snapshot = await getDocs(q);

      const users = snapshot.docs.map(doc => sanitizeUser(doc));

      return {
        users,
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
        hasMore: snapshot.docs.length === USERS_DIRECTORY_CONFIG.PAGINATION.USERS_PER_PAGE
      };
    } catch (error) {
      logger.error('Error fetching users', error as Error);
      throw error;
    }
  }

  async getOnlineUsers(): Promise<BulgarianUser[]> {
    try {
      const result = await this.getUsers({ onlineOnly: true }, null);
      return result.users.slice(0, USERS_DIRECTORY_CONFIG.PAGINATION.MAX_ONLINE_USERS);
    } catch (error) {
      logger.error('Error fetching online users', error as Error);
      return [];
    }
  }

  sanitizeUserForDisplay(user: BulgarianUser, viewerId?: string): Partial<BulgarianUser> {
    const isOwnProfile = viewerId === user.uid;

    const sanitized: Partial<BulgarianUser> = {
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL,
      profileType: user.profileType,
      planTier: user.planTier,
      location: user.location,
      verification: user.verification,
      stats: user.stats,
      isOnline: (user as any).isOnline,
    };

    if (isOwnProfile || (user as any).showEmail) {
      sanitized.email = user.email;
    }

    if (isOwnProfile || (user as any).showPhone) {
      sanitized.phoneNumber = user.phoneNumber;
    }

    if (user.profileType === 'dealer' && (user as any).dealerSnapshot) {
      sanitized.dealerSnapshot = (user as any).dealerSnapshot;
    }

    if (user.profileType === 'company' && (user as any).companySnapshot) {
      sanitized.companySnapshot = (user as any).companySnapshot;
    }

    return sanitized;
  }
}

export const usersDirectoryService = new UsersDirectoryService();
