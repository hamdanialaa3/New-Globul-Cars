import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { firebaseAuthRealUsers } from './firebase-auth-real-users';
import { serviceLogger } from './logger-wrapper';

// User Management Interfaces
export interface UserRole {
  id: string;
  name: string;
  nameBg: string;
  nameEn: string;
  description: string;
  descriptionBg: string;
  descriptionEn: string;
  permissions: Permission[];
  isSystemRole: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  category: string;
  name: string;
  nameBg: string;
  nameEn: string;
  description: string;
  descriptionBg: string;
  descriptionEn: string;
  resource: string;
  action: string;
  level: 'read' | 'write' | 'delete' | 'admin';
}

export interface AdvancedUser {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  location: {
    city: string;
    region: string;
    country: string;
    postalCode?: string;
    address?: string;
  };
  profile: {
    isDealer: boolean;
    preferredCurrency: 'EUR';
    timezone: string;
    language: 'bg' | 'en';
    avatar?: string;
    coverImage?: string;
  };
  roles: string[];
  customPermissions: Permission[];
  status: 'active' | 'inactive' | 'suspended' | 'banned';
  verification: {
    email: boolean;
    phone: boolean;
    identity: boolean;
    business: boolean;
  };
  preferences: {
    notifications: boolean;
    marketingEmails: boolean;
    language: 'bg' | 'en';
    currency: 'EUR';
  };
  security: {
    lastLogin: Date;
    loginCount: number;
    failedAttempts: number;
    twoFactorEnabled: boolean;
    ipAddresses: string[];
    userAgent: string;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
}

export interface UserActivityLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
}

export interface UserSession {
  id: string;
  userId: string;
  sessionToken: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  isActive: boolean;
  lastActivity: Date;
  createdAt: Date;
  expiresAt: Date;
}

class AdvancedUserManagementService {
  private static instance: AdvancedUserManagementService;

  private constructor() {}

  public static getInstance(): AdvancedUserManagementService {
    if (!AdvancedUserManagementService.instance) {
      AdvancedUserManagementService.instance = new AdvancedUserManagementService();
    }
    return AdvancedUserManagementService.instance;
  }

  // Create new user with role assignment
  public async createUser(
    userData: Partial<AdvancedUser>, 
    roleIds: string[], 
    createdBy: string
  ): Promise<AdvancedUser> {
    let newUser: AdvancedUser | undefined;
    
    try {
      const userRef = doc(collection(db, 'users'));
      const userId = userRef.id;
      
      newUser = {
        uid: userId,
        email: userData.email || '',
        displayName: userData.displayName || '',
        phoneNumber: userData.phoneNumber,
        location: {
          city: userData.location?.city || 'Sofia',
          region: userData.location?.region || 'Sofia',
          country: 'Bulgaria',
          postalCode: userData.location?.postalCode,
          address: userData.location?.address
        },
        profile: {
          isDealer: userData.profile?.isDealer || false,
          preferredCurrency: 'EUR',
          timezone: userData.profile?.timezone || 'Europe/Sofia',
          language: userData.profile?.language || 'bg',
          avatar: userData.profile?.avatar,
          coverImage: userData.profile?.coverImage
        },
        roles: roleIds,
        customPermissions: userData.customPermissions || [],
        status: 'active',
        verification: {
          email: false,
          phone: false,
          identity: false,
          business: false
        },
        preferences: {
          notifications: true,
          marketingEmails: false,
          language: 'bg',
          currency: 'EUR'
        },
        security: {
          lastLogin: new Date(),
          loginCount: 0,
          failedAttempts: 0,
          twoFactorEnabled: false,
          ipAddresses: [],
          userAgent: navigator.userAgent
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy,
        lastModifiedBy: createdBy
      };

      await setDoc(userRef, newUser);
      
      // Log user creation
      await this.logUserActivity(userId, 'USER_CREATED', 'user', userId, 
        `User created by ${createdBy}`, true);
      
      return newUser;
    } catch (error) {
      serviceLogger.error('Error creating user', error as Error, { userId: newUser?.uid });
      throw error;
    }
  }

  // Get all users with pagination and filtering
  public async getUsers(
    page: number = 1, 
    limitCount: number = 50, 
    filters?: {
      status?: string;
      role?: string;
      search?: string;
      createdBy?: string;
    }
  ): Promise<{ users: AdvancedUser[]; total: number; hasMore: boolean }> {
    try {
      serviceLogger.debug('Getting users from Firebase', { page, limitCount, filters });
      
      // Try to get users from Firebase Auth first (REAL data!)
      try {
        const authUsers = await firebaseAuthRealUsers.getAuthUsersList();
        serviceLogger.info('Got REAL users from Firebase Auth', { count: authUsers.length });
        
        // Convert Firebase Auth users to AdvancedUser format
        const convertedUsers: AdvancedUser[] = authUsers.map(authUser => ({
          uid: authUser.uid,
          email: authUser.email,
          displayName: authUser.displayName || 'User',
          phoneNumber: authUser.phoneNumber || undefined,
          location: {
            city: 'Sofia',
            region: 'Sofia',
            country: 'Bulgaria'
          },
          profile: {
            isDealer: false,
            preferredCurrency: 'EUR' as const,
            timezone: 'Europe/Sofia',
            language: 'bg' as const,
            avatar: authUser.photoURL || undefined
          },
          roles: ['user'],
          customPermissions: [],
          status: authUser.disabled ? 'suspended' : 'active' as const,
          verification: {
            email: authUser.emailVerified,
            phone: !!authUser.phoneNumber,
            identity: false,
            business: false
          },
          preferences: {
            notifications: true,
            marketingEmails: false,
            language: 'bg' as const,
            currency: 'EUR' as const
          },
          security: {
            lastLogin: authUser.lastSignInTime ? new Date(authUser.lastSignInTime) : new Date(),
            loginCount: 0,
            failedAttempts: 0,
            twoFactorEnabled: false,
            ipAddresses: [],
            userAgent: 'Firebase Auth'
          },
          createdAt: authUser.createdAt ? new Date(authUser.createdAt) : new Date(),
          updatedAt: new Date(),
          createdBy: 'system',
          lastModifiedBy: 'system'
        }));
        
        // Apply filters if needed
        let filteredUsers = convertedUsers;
        
        if (filters?.status) {
          filteredUsers = filteredUsers.filter(u => u.status === filters.status);
        }
        
        if (filters?.search) {
          const searchLower = filters.search.toLowerCase();
          filteredUsers = filteredUsers.filter(u => 
            u.email.toLowerCase().includes(searchLower) ||
            u.displayName.toLowerCase().includes(searchLower)
          );
        }
        
        // Pagination
        const startIndex = (page - 1) * limitCount;
        const endIndex = startIndex + limitCount;
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
        
        return {
          users: paginatedUsers,
          total: filteredUsers.length,
          hasMore: endIndex < filteredUsers.length
        };
        
      } catch (authError) {
        serviceLogger.warn('Could not get from Firebase Auth - falling back to Firestore', { error: authError });
      }
      
      // Fallback: Get from Firestore
      let q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }
      
      if (filters?.role) {
        q = query(q, where('roles', 'array-contains', filters.role));
      }
      
      if (filters?.createdBy) {
        q = query(q, where('createdBy', '==', filters.createdBy));
      }
      
      q = query(q, limit(limitCount * page));
      
      const snapshot = await getDocs(q);
      const users = snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as AdvancedUser));
      
      // Apply search filter if provided
      let filteredUsers = users;
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredUsers = users.filter(user => 
          user.displayName.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm) ||
          user.location.city.toLowerCase().includes(searchTerm)
        );
      }
      
      return {
        users: filteredUsers.slice((page - 1) * limitCount, page * limitCount),
        total: filteredUsers.length,
        hasMore: filteredUsers.length >= limitCount
      };
    } catch (error) {
      serviceLogger.error('Error getting users', error as Error, { page, limitCount, filters });
      return { users: [], total: 0, hasMore: false };
    }
  }

  // Update user information
  public async updateUser(
    userId: string, 
    updates: Partial<AdvancedUser>, 
    modifiedBy: string
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
        lastModifiedBy: modifiedBy
      };
      
      await updateDoc(userRef, updateData);
      
      // Log user update
      await this.logUserActivity(userId, 'USER_UPDATED', 'user', userId, 
        `User updated by ${modifiedBy}`, true);
    } catch (error) {
      serviceLogger.error('Error updating user', error as Error, { userId, modifiedBy });
      throw error;
    }
  }

  // Assign roles to user
  public async assignRoles(
    userId: string, 
    roleIds: string[], 
    assignedBy: string
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        roles: roleIds,
        updatedAt: serverTimestamp(),
        lastModifiedBy: assignedBy
      });
      
      await this.logUserActivity(userId, 'ROLES_ASSIGNED', 'user', userId, 
        `Roles assigned by ${assignedBy}: ${roleIds.join(', ')}`, true);
    } catch (error) {
      serviceLogger.error('Error assigning roles', error as Error, { userId, roleIds, assignedBy });
      throw error;
    }
  }

  // Create custom role
  public async createRole(
    roleData: Omit<UserRole, 'id' | 'createdAt' | 'updatedAt'>, 
    createdBy: string
  ): Promise<UserRole> {
    try {
      const roleRef = doc(collection(db, 'roles'));
      const roleId = roleRef.id;
      
      const newRole: UserRole = {
        id: roleId,
        ...roleData,
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(roleRef, newRole);
      
      await this.logUserActivity(createdBy, 'ROLE_CREATED', 'role', roleId, 
        `Role created: ${roleData.name}`, true);
      
      return newRole;
    } catch (error) {
      serviceLogger.error('Error creating role', error as Error, { roleName: roleData.name, createdBy });
      throw error;
    }
  }

  // Get all roles
  public async getRoles(): Promise<UserRole[]> {
    try {
      const q = query(collection(db, 'roles'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as UserRole));
    } catch (error) {
      serviceLogger.error('Error getting roles', error as Error);
      return [];
    }
  }

  // Get user permissions (roles + custom permissions)
  public async getUserPermissions(userId: string): Promise<Permission[]> {
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
  public async hasPermission(
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

  // Suspend or ban user
  public async changeUserStatus(
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
      
      await this.logUserActivity(userId, 'STATUS_CHANGED', 'user', userId, 
        `Status changed to ${status} by ${changedBy}. Reason: ${reason}`, true);
    } catch (error) {
      serviceLogger.error('Error changing user status', error as Error, { userId, status, reason, changedBy });
      throw error;
    }
  }

  // Get user activity logs
  public async getUserActivityLogs(
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
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as UserActivityLog));
    } catch (error) {
      serviceLogger.error('Error getting user activity logs', error as Error, { userId, limitCount });
      return [];
    }
  }

  // Log user activity
  private async logUserActivity(
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

  // Get system statistics
  public async getSystemStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    suspendedUsers: number;
    bannedUsers: number;
    newUsersToday: number;
    totalRoles: number;
    totalPermissions: number;
  }> {
    try {
      const [usersSnapshot, rolesSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'roles'))
      ]);
      
      const users = usersSnapshot.docs.map(doc => doc.data() as AdvancedUser);
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

export const advancedUserManagementService = AdvancedUserManagementService.getInstance();
