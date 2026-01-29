// advanced-user-management-types.ts
// Types and interfaces for advanced user management system

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystemRole: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  level: string;
  description: string;
}

export interface AdvancedUser {
  id: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  roles: string[];
  customPermissions: Permission[];
  status: 'active' | 'inactive' | 'suspended' | 'banned';
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy?: string;
  profileImageUrl?: string;
  preferences: {
    language: string;
    notifications: boolean;
    theme: 'light' | 'dark';
  };
}

export interface UserActivityLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: any; // Firestore Timestamp
  success: boolean;
}

export interface UserSession {
  id: string;
  userId: string;
  deviceInfo: {
    type: string;
    os: string;
    browser: string;
  };
  ipAddress: string;
  location?: {
    country: string;
    city: string;
  };
  startedAt: Date;
  lastActivityAt: Date;
  isActive: boolean;
}

export interface CreateUserData {
  email: string;
  displayName: string;
  phoneNumber?: string;
  roles?: string[];
  customPermissions?: Permission[];
  status?: 'active' | 'inactive' | 'suspended' | 'banned';
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  preferences?: {
    language: string;
    notifications: boolean;
    theme: 'light' | 'dark';
  };
}

export interface UpdateUserData {
  displayName?: string;
  phoneNumber?: string;
  roles?: string[];
  customPermissions?: Permission[];
  status?: 'active' | 'inactive' | 'suspended' | 'banned';
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  preferences?: {
    language: string;
    notifications: boolean;
    theme: 'light' | 'dark';
  };
}

export interface CreateRoleData {
  name: string;
  description: string;
  permissions: Permission[];
  isSystemRole?: boolean;
}

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  bannedUsers: number;
  newUsersToday: number;
  totalRoles: number;
  totalPermissions: number;
}