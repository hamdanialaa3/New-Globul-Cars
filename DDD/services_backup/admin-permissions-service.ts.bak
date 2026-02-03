// Admin Service for managing users and system permissions
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { queryAllCollections, countAllVehicles, VEHICLE_COLLECTIONS } from './search/multi-collection-helper';
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-service';

export interface AdminPermissions {
  userId: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'user';
  permissions: string[];
  accessLevel: 'full' | 'limited' | 'read_only';
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date;
  location?: {
    city: string;
    region: string;
    postalCode: string;
    address?: string;
  };
}

export class AdminService {
  private static instance: AdminService;

  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  // Check if user has admin permissions
  async isAdmin(userId: string): Promise<boolean> {
    try {
      const adminDoc = await getDoc(doc(db, 'admin_permissions', userId));
      if (!adminDoc.exists()) return false;
      
      const adminData = adminDoc.data() as AdminPermissions;
      return adminData.isActive && (adminData.role === 'admin' || adminData.role === 'super_admin');
    } catch (error) {
      serviceLogger.error('Error checking admin status', error as Error, { userId });
      return false;
    }
  }

  // Check if user has super admin permissions
  async isSuperAdmin(userId: string): Promise<boolean> {
    try {
      const adminDoc = await getDoc(doc(db, 'admin_permissions', userId));
      if (!adminDoc.exists()) return false;
      
      const adminData = adminDoc.data() as AdminPermissions;
      return adminData.isActive && adminData.role === 'super_admin';
    } catch (error) {
      serviceLogger.error('Error checking super admin status', error as Error, { userId });
      return false;
    }
  }

  // Check if user has specific permission
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const adminDoc = await getDoc(doc(db, 'admin_permissions', userId));
      if (!adminDoc.exists()) return false;
      
      const adminData = adminDoc.data() as AdminPermissions;
      return adminData.isActive && adminData.permissions.includes(permission);
    } catch (error) {
      serviceLogger.error('Error checking permission', error as Error, { userId, permission });
      return false;
    }
  }

  // Grant admin permissions to user
  async grantAdminPermissions(
    userId: string, 
    role: 'admin' | 'super_admin' | 'moderator',
    permissions: string[],
    grantedBy: string
  ): Promise<void> {
    try {
      const adminPermissions: AdminPermissions = {
        userId,
        role,
        permissions,
        accessLevel: role === 'super_admin' ? 'full' : 'limited',
        grantedBy,
        grantedAt: new Date(),
        isActive: true
      };

      await setDoc(doc(db, 'admin_permissions', userId), adminPermissions);
      
      // Update user role in users collection
      await updateDoc(doc(db, 'users', userId), {
        role: role,
        isAdmin: true,
        updatedAt: new Date()
      });

      serviceLogger.info('Admin permissions granted to user', { userId, role, grantedBy });
    } catch (error) {
      serviceLogger.error('Error granting admin permissions', error as Error, { userId, role, grantedBy });
      throw error;
    }
  }

  // Revoke admin permissions
  async revokeAdminPermissions(userId: string, revokedBy: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'admin_permissions', userId), {
        isActive: false,
        revokedBy,
        revokedAt: new Date()
      });

      // Update user role in users collection
      await updateDoc(doc(db, 'users', userId), {
        role: 'user',
        isAdmin: false,
        updatedAt: new Date()
      });

      serviceLogger.info('Admin permissions revoked from user', { userId, revokedBy });
    } catch (error) {
      serviceLogger.error('Error revoking admin permissions', error as Error, { userId, revokedBy });
      throw error;
    }
  }

  // Get all admin users
  async getAllAdminUsers(): Promise<AdminUser[]> {
    try {
      const adminUsers: AdminUser[] = [];
      const adminPermissionsQuery = query(
        collection(db, 'admin_permissions'),
        where('isActive', '==', true)
      );
      
      const adminPermissionsSnapshot = await getDocs(adminPermissionsQuery);
      
      for (const adminDoc of adminPermissionsSnapshot.docs) {
        const adminData = adminDoc.data() as AdminPermissions;
        
        // Get user details
        const userDoc = await getDoc(doc(db, 'users', adminData.userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          adminUsers.push({
            uid: adminData.userId,
            email: userData.email,
            displayName: userData.displayName,
            phoneNumber: userData.phoneNumber,
            photoURL: userData.photoURL,
            role: adminData.role,
            permissions: adminData.permissions,
            isActive: adminData.isActive,
            createdAt: userData.createdAt,
            lastLoginAt: userData.lastLoginAt,
            location: userData.location
          });
        }
      }
      
      return adminUsers;
    } catch (error) {
      serviceLogger.error('Error getting admin users', error as Error);
      throw error;
    }
  }

  // Get user permissions
  async getUserPermissions(userId: string): Promise<AdminPermissions | null> {
    try {
      const adminDoc = await getDoc(doc(db, 'admin_permissions', userId));
      if (!adminDoc.exists()) return null;
      
      return adminDoc.data() as AdminPermissions;
    } catch (error) {
      serviceLogger.error('Error getting user permissions', error as Error, { userId });
      return null;
    }
  }

  // Create system admin user
  async createSystemAdmin(
    email: string,
    password: string,
    displayName: string,
    phoneNumber: string,
    location: { city?: string; region?: string; postalCode?: string; address?: string; coordinates?: { lat: number; lng: number } }
  ): Promise<string> {
    try {
      // This would typically be done through Firebase Auth
      // For now, we'll create the admin permissions document
      const adminUserId = 'system_admin_' + Date.now();
      
      const adminPermissions: AdminPermissions = {
        userId: adminUserId,
        role: 'super_admin',
        permissions: [
          'user_management',
          'car_management',
          'message_management',
          'analytics_access',
          'content_moderation',
          'system_administration',
          'data_export',
          'data_import',
          'user_ban',
          'user_delete',
          'content_delete',
          'system_settings'
        ],
        accessLevel: 'full',
        grantedBy: 'system',
        grantedAt: new Date(),
        isActive: true
      };

      await setDoc(doc(db, 'admin_permissions', adminUserId), adminPermissions);
      
      // Create user document
      const adminUser = {
        uid: adminUserId,
        email,
        displayName,
        phoneNumber,
        photoURL: 'https://via.placeholder.com/150/4267B2/FFFFFF?text=AH',
        bio: 'System Administrator - Full Access',
        preferredLanguage: 'en',
        location,
        profile: {
          isDealer: true,
          isAdmin: true,
          isSuperAdmin: true,
          companyName: 'Globul Cars Admin',
          taxNumber: 'BG123456789',
          dealerLicense: 'ADMIN-001',
          preferredCurrency: 'EUR',
          timezone: 'Europe/Sofia'
        },
        preferences: {
          notifications: true,
          marketingEmails: false,
          language: 'en',
          theme: 'light',
          currency: 'EUR'
        },
        verification: {
          email: { verified: true, verifiedAt: new Date() },
          phone: { verified: true, verifiedAt: new Date() },
          identity: { verified: true, verifiedAt: new Date() },
          business: { verified: true, verifiedAt: new Date() }
        },
        stats: {
          carsListed: 0,
          carsSold: 0,
          totalViews: 0,
          totalMessages: 0,
          rating: 5.0,
          totalRatings: 0
        },
        createdAt: new Date(),
        lastLoginAt: new Date(),
        isVerified: true,
        isActive: true,
        role: 'super_admin',
        accessLevel: 'full'
      };

      await setDoc(doc(db, 'users', adminUserId), adminUser);
      
      serviceLogger.info('System admin user created', { adminUserId, email });
      return adminUserId;
    } catch (error) {
      serviceLogger.error('Error creating system admin', error as Error, { email });
      throw error;
    }
  }

  // Get system statistics
  async getSystemStats(): Promise<any> {
    try {
      const stats = {
        totalUsers: 0,
        totalCars: 0,
        totalMessages: 0,
        totalAdmins: 0,
        activeUsers: 0,
        systemVersion: '1.0.0',
        lastUpdated: new Date()
      };

      // Get total users
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      stats.totalUsers = usersSnapshot.size;

      // Get total cars - ✅ ALL COLLECTIONS
      const totalCars = await countAllVehicles();
      stats.totalCars = totalCars;

      // Get total messages
      const messagesQuery = query(collection(db, 'messages'));
      const messagesSnapshot = await getDocs(messagesQuery);
      stats.totalMessages = messagesSnapshot.size;

      // Get total admins
      const adminQuery = query(
        collection(db, 'admin_permissions'),
        where('isActive', '==', true)
      );
      const adminSnapshot = await getDocs(adminQuery);
      stats.totalAdmins = adminSnapshot.size;

      return stats;
    } catch (error) {
      serviceLogger.error('Error getting system stats', error as Error);
      throw error;
    }
  }
}

export const adminService = AdminService.getInstance();
