// Admin Authentication Service
// This service handles admin user authentication and permissions

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber: string;
  photoURL: string;
  bio: string;
  preferredLanguage: string;
  location: {
    city: string;
    region: string;
    postalCode: string;
    address: string;
  };
  profile: {
    isDealer: boolean;
    isAdmin: boolean;
    isSuperAdmin: boolean;
    companyName: string;
    taxNumber: string;
    dealerLicense: string;
    preferredCurrency: string;
    timezone: string;
    permissions: {
      canManageUsers: boolean;
      canManageCars: boolean;
      canManageMessages: boolean;
      canManageReports: boolean;
      canAccessAnalytics: boolean;
      canModerateContent: boolean;
      canDeleteUsers: boolean;
      canBanUsers: boolean;
      canViewAllData: boolean;
      canExportData: boolean;
      canImportData: boolean;
      canManageSystem: boolean;
    };
  };
  preferences: {
    notifications: boolean;
    marketingEmails: boolean;
    language: string;
    theme: string;
    currency: string;
  };
  verification: {
    email: { verified: boolean; verifiedAt: Date };
    phone: { verified: boolean; verifiedAt: Date };
    identity: { verified: boolean; verifiedAt: Date };
    business: { verified: boolean; verifiedAt: Date };
  };
  stats: {
    carsListed: number;
    carsSold: number;
    totalViews: number;
    totalMessages: number;
    rating: number;
    totalRatings: number;
  };
  createdAt: Date;
  lastLoginAt: Date;
  isVerified: boolean;
  isActive: boolean;
  role: string;
  accessLevel: string;
  permissions: string[];
}

export class AdminAuthService {
  private static instance: AdminAuthService;
  private adminUsers: Map<string, AdminUser> = new Map();

  public static getInstance(): AdminAuthService {
    if (!AdminAuthService.instance) {
      AdminAuthService.instance = new AdminAuthService();
    }
    return AdminAuthService.instance;
  }

  constructor() {
    this.initializeAdminUsers();
  }

  private initializeAdminUsers() {
    // Pre-defined admin users
    const adminUsers: AdminUser[] = [
      {
        uid: 'admin_alaa_hamid_001',
        email: 'alaa.hamdani@yahoo.com',
        displayName: 'Alaa Hamid',
        phoneNumber: '+359879839671',
        photoURL: 'https://via.placeholder.com/150/4267B2/FFFFFF?text=AH',
        bio: 'System Administrator - Full Access',
        preferredLanguage: 'en',
        location: {
          city: 'Sofia',
          region: 'Sofia',
          postalCode: '1000',
          address: 'Tsar Simeon 77'
        },
        profile: {
          isDealer: true,
          isAdmin: true,
          isSuperAdmin: true,
          companyName: 'Globul Cars Admin',
          taxNumber: 'BG123456789',
          dealerLicense: 'ADMIN-001',
          preferredCurrency: 'EUR',
          timezone: 'Europe/Sofia',
          permissions: {
            canManageUsers: true,
            canManageCars: true,
            canManageMessages: true,
            canManageReports: true,
            canAccessAnalytics: true,
            canModerateContent: true,
            canDeleteUsers: true,
            canBanUsers: true,
            canViewAllData: true,
            canExportData: true,
            canImportData: true,
            canManageSystem: true
          }
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
        accessLevel: 'full',
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
        ]
      }
    ];

    // Store admin users in memory
    adminUsers.forEach(user => {
      this.adminUsers.set(user.email, user);
      this.adminUsers.set(user.uid, user);
    });
  }

  // Check if user is admin by email
  async isAdminByEmail(email: string): Promise<boolean> {
    const adminUser = this.adminUsers.get(email);
    return adminUser ? adminUser.profile.isAdmin : false;
  }

  // Check if user is super admin by email
  async isSuperAdminByEmail(email: string): Promise<boolean> {
    const adminUser = this.adminUsers.get(email);
    return adminUser ? adminUser.profile.isSuperAdmin : false;
  }

  // Get admin user by email
  async getAdminUserByEmail(email: string): Promise<AdminUser | null> {
    return this.adminUsers.get(email) || null;
  }

  // Get admin user by UID
  async getAdminUserByUID(uid: string): Promise<AdminUser | null> {
    return this.adminUsers.get(uid) || null;
  }

  // Check if user has specific permission
  async hasPermission(email: string, permission: string): Promise<boolean> {
    const adminUser = this.adminUsers.get(email);
    if (!adminUser) return false;
    return adminUser.permissions.includes(permission);
  }

  // Create admin user in Firestore (if permissions allow)
  async createAdminUserInFirestore(adminUser: AdminUser): Promise<boolean> {
    try {
      await setDoc(doc(db, 'users', adminUser.uid), adminUser);
      
      // Create admin permissions document
      const adminPermissions = {
        userId: adminUser.uid,
        role: adminUser.role,
        permissions: adminUser.permissions,
        accessLevel: adminUser.accessLevel,
        grantedBy: 'system',
        grantedAt: new Date(),
        expiresAt: null,
        isActive: true
      };
      
      await setDoc(doc(db, 'admin_permissions', adminUser.uid), adminPermissions);
      
      return true;
    } catch (error) {
      console.error('Error creating admin user in Firestore:', error);
      return false;
    }
  }

  // Get all admin users
  getAllAdminUsers(): AdminUser[] {
    return Array.from(this.adminUsers.values()).filter(user => user.profile.isAdmin);
  }

  // Get system statistics
  async getSystemStats(): Promise<any> {
    return {
      totalUsers: 0,
      totalCars: 0,
      totalMessages: 0,
      totalAdmins: this.getAllAdminUsers().length,
      activeUsers: 0,
      systemVersion: '1.0.0',
      lastUpdated: new Date()
    };
  }
}

export const adminAuthService = AdminAuthService.getInstance();
