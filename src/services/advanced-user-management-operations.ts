// advanced-user-management-operations.ts
// Business logic operations for advanced user management

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { db, auth } from '@/firebase/index';
import { serviceLogger } from '@/services/logger-service';

import {
  AdvancedUser,
  UserRole,
  Permission,
  UserActivityLog,
  CreateUserData,
  UpdateUserData,
  CreateRoleData,
  SystemStats
} from './advanced-user-management-types';
import {
  DEFAULT_USER_PREFERENCES,
  ACTIVITY_ACTIONS
} from './advanced-user-management-data';

// Generate a strong temporary password so the account is secure until the reset email is completed.
const generateStrongTempPassword = (length: number = 20): string => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=';
  const getRandomValues = (buffer: Uint32Array) => {
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      crypto.getRandomValues(buffer);
    } else {
      // Fallback for non-browser environments (tests)
      for (let i = 0; i < buffer.length; i += 1) {
        buffer[i] = Math.floor(Math.random() * alphabet.length);
      }
    }
  };

  const array = new Uint32Array(length);
  getRandomValues(array);

  return Array.from(array)
    .map(value => alphabet[value % alphabet.length])
    .join('');
};

// User CRUD operations
export class UserOperations {
  // Create new user
  static async createUser(
    userData: CreateUserData,
    createdBy: string
  ): Promise<AdvancedUser> {
    try {
      // Create Firebase Auth user with a strong temporary password (never exposed to the user)
      const temporaryPassword = generateStrongTempPassword();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        temporaryPassword
      );

      const user = userCredential.user;
      const userId = user.uid;

      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: userData.displayName
      });

      // Create user document in Firestore
      const userRef = doc(db, 'users', userId);
      const newUser: AdvancedUser = {
        id: userId,
        email: userData.email,
        displayName: userData.displayName,
        phoneNumber: userData.phoneNumber,
        roles: userData.roles || [],
        customPermissions: userData.customPermissions || [],
        status: userData.status || 'active',
        verificationStatus: userData.verificationStatus || 'unverified',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastModifiedBy: createdBy,
        preferences: userData.preferences || DEFAULT_USER_PREFERENCES
      };

      await setDoc(userRef, newUser);

      // Force a secure password reset so the end-user chooses their own password
      await sendPasswordResetEmail(auth, userData.email);

      await ActivityOperations.logUserActivity(createdBy, ACTIVITY_ACTIONS.USER_CREATED, 'user', userId,
        `User created: ${userData.displayName}`, true);

      return newUser;
    } catch (error) {
      serviceLogger.error('Error creating user', error as Error, { email: userData.email, createdBy });
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<AdvancedUser | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return { ...userSnap.data(), id: userSnap.id } as AdvancedUser;
      }
      return null;
    } catch (error) {
      serviceLogger.error('Error getting user by ID', error as Error, { userId });
      return null;
    }
  }

  // Get all users with pagination
  static async getUsers(limitCount: number = 50): Promise<AdvancedUser[]> {
    try {
      const q = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id } as AdvancedUser));
    } catch (error) {
      serviceLogger.error('Error getting users', error as Error, { limitCount });
      return [];
    }
  }

  // Update user
  static async updateUser(
    userId: string,
    updateData: UpdateUserData,
    updatedBy: string
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
        lastModifiedBy: updatedBy
      });

      await ActivityOperations.logUserActivity(updatedBy, ACTIVITY_ACTIONS.USER_UPDATED, 'user', userId,
        `User updated: ${Object.keys(updateData).join(', ')}`, true);
    } catch (error) {
      serviceLogger.error('Error updating user', error as Error, { userId, updatedBy });
      throw error;
    }
  }

  // Delete user
  static async deleteUser(userId: string, deletedBy: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);

      await ActivityOperations.logUserActivity(deletedBy, ACTIVITY_ACTIONS.USER_DELETED, 'user', userId,
        'User deleted', true);
    } catch (error) {
      serviceLogger.error('Error deleting user', error as Error, { userId, deletedBy });
      throw error;
    }
  }

  // Get user's cars
  static async getUserCars(userId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'cars'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }));
    } catch (error) {
      serviceLogger.error('Error getting user cars', error as Error, { userId });
      return [];
    }
  }

  // Get user's messages
  static async getUserMessages(userId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'messages'),
        where('participants', 'array-contains', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }));
    } catch (error) {
      serviceLogger.error('Error getting user messages', error as Error, { userId });
      return [];
    }
  }
}

// Role operations
export class RoleOperations {
  // Create role
  static async createRole(
    roleData: CreateRoleData,
    createdBy: string
  ): Promise<UserRole> {
    try {
      const roleRef = doc(collection(db, 'roles'));
      const roleId = roleRef.id;

      const newRole: UserRole = {
        id: roleId,
        ...roleData,
        isSystemRole: roleData.isSystemRole || false,
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(roleRef, newRole);

      await ActivityOperations.logUserActivity(createdBy, ACTIVITY_ACTIONS.ROLE_CREATED, 'role', roleId,
        `Role created: ${roleData.name}`, true);

      return newRole;
    } catch (error) {
      serviceLogger.error('Error creating role', error as Error, { roleName: roleData.name, createdBy });
      throw error;
    }
  }

  // Get all roles
  static async getRoles(): Promise<UserRole[]> {
    try {
      const q = query(collection(db, 'roles'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id } as UserRole));
    } catch (error) {
      serviceLogger.error('Error getting roles', error as Error);
      return [];
    }
  }
}

// Permission operations
export class PermissionOperations {
  // Get user permissions (roles + custom permissions)
  static async getUserPermissions(userId: string): Promise<Permission[]> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return [];
      }

      const userData = userSnap.data() as AdvancedUser;
      const allPermissions: Permission[] = [];

      // Get permissions from roles
      for (const roleId of userData.roles) {
        const roleRef = doc(db, 'roles', roleId);
        const roleSnap = await getDoc(roleRef);
        if (roleSnap.exists()) {
          const roleData = roleSnap.data() as UserRole;
          allPermissions.push(...roleData.permissions);
        }
      }

      // Add custom permissions
      allPermissions.push(...userData.customPermissions);

      // Remove duplicates
      const uniquePermissions = allPermissions.filter((permission, index, self) =>
        index === self.findIndex(p => p.id === permission.id)
      );

      return uniquePermissions;
    } catch (error) {
      serviceLogger.error('Error getting user permissions', error as Error, { userId });
      return [];
    }
  }

  // Check if user has specific permission
  static async hasPermission(
    userId: string,
    resource: string,
    action: string,
    level: string
  ): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions(userId);
      return permissions.some(permission =>
        permission.resource === resource &&
        permission.action === action &&
        permission.level === level
      );
    } catch (error) {
      serviceLogger.error('Error checking permission', error as Error, { userId, resource, action, level });
      return false;
    }
  }
}

// Activity logging operations
export class ActivityOperations {
  // Get user activity logs
  static async getUserActivityLogs(
    userId: string,
    limitCount: number = 100
  ): Promise<UserActivityLog[]> {
    try {
      const q = query(
        collection(db, 'user_activity_logs'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id } as UserActivityLog));
    } catch (error) {
      serviceLogger.error('Error getting user activity logs', error as Error, { userId, limitCount });
      return [];
    }
  }

  // Log user activity
  static async logUserActivity(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    details: string,
    success: boolean
  ): Promise<void> {
    try {
      const logRef = doc(collection(db, 'user_activity_logs'));
      const logEntry: Omit<UserActivityLog, 'id'> = {
        userId,
        action,
        resource,
        resourceId,
        details,
        ipAddress: 'N/A', // In production, get from request
        userAgent: navigator.userAgent,
        timestamp: serverTimestamp() as any,
        success
      };

      await setDoc(logRef, logEntry);
    } catch (error) {
      serviceLogger.error('Error logging user activity', error as Error, { userId, action, resource });
    }
  }
}

// System operations
export class SystemOperations {
  // Change user status
  static async changeUserStatus(
    userId: string,
    status: 'active' | 'inactive' | 'suspended' | 'banned',
    reason: string,
    changedBy: string
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        status,
        updatedAt: serverTimestamp(),
        lastModifiedBy: changedBy
      });

      await ActivityOperations.logUserActivity(userId, ACTIVITY_ACTIONS.STATUS_CHANGED, 'user', userId,
        `Status changed to ${status} by ${changedBy}. Reason: ${reason}`, true);
    } catch (error) {
      serviceLogger.error('Error changing user status', error as Error, { userId, status, reason, changedBy });
      throw error;
    }
  }

  // Get system statistics
  static async getSystemStats(): Promise<SystemStats> {
    try {
      const [usersSnapshot, rolesSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'roles'))
      ]);

      const users = usersSnapshot.docs.map((doc: any) => doc.data() as AdvancedUser);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.status === 'active').length,
        suspendedUsers: users.filter(u => u.status === 'suspended').length,
        bannedUsers: users.filter(u => u.status === 'banned').length,
        newUsersToday: users.filter(u => u.createdAt >= today).length,
        totalRoles: rolesSnapshot.docs.length,
        totalPermissions: 0 // Calculate from roles
      };
    } catch (error) {
      serviceLogger.error('Error getting system stats', error as Error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        suspendedUsers: 0,
        bannedUsers: 0,
        newUsersToday: 0,
        totalRoles: 0,
        totalPermissions: 0
      };
    }
  }
}
