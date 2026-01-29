// advanced-user-management-data.ts
// Constants and data structures for advanced user management

import { Permission } from './advanced-user-management-types';

// Default system roles
export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  DEALER: 'dealer',
  PRIVATE_SELLER: 'private-seller',
  COMPANY: 'company',
  USER: 'user'
} as const;

// Default permissions
export const DEFAULT_PERMISSIONS: Permission[] = [
  // User management permissions
  {
    id: 'users.view',
    name: 'View Users',
    resource: 'users',
    action: 'view',
    level: 'own',
    description: 'Can view own user profile'
  },
  {
    id: 'users.view.all',
    name: 'View All Users',
    resource: 'users',
    action: 'view',
    level: 'all',
    description: 'Can view all user profiles'
  },
  {
    id: 'users.create',
    name: 'Create Users',
    resource: 'users',
    action: 'create',
    level: 'all',
    description: 'Can create new users'
  },
  {
    id: 'users.update',
    name: 'Update Users',
    resource: 'users',
    action: 'update',
    level: 'own',
    description: 'Can update own user profile'
  },
  {
    id: 'users.update.all',
    name: 'Update All Users',
    resource: 'users',
    action: 'update',
    level: 'all',
    description: 'Can update all user profiles'
  },
  {
    id: 'users.delete',
    name: 'Delete Users',
    resource: 'users',
    action: 'delete',
    level: 'all',
    description: 'Can delete users'
  },

  // Role management permissions
  {
    id: 'roles.view',
    name: 'View Roles',
    resource: 'roles',
    action: 'view',
    level: 'all',
    description: 'Can view roles'
  },
  {
    id: 'roles.create',
    name: 'Create Roles',
    resource: 'roles',
    action: 'create',
    level: 'all',
    description: 'Can create new roles'
  },
  {
    id: 'roles.update',
    name: 'Update Roles',
    resource: 'roles',
    action: 'update',
    level: 'all',
    description: 'Can update roles'
  },
  {
    id: 'roles.delete',
    name: 'Delete Roles',
    resource: 'roles',
    action: 'delete',
    level: 'all',
    description: 'Can delete roles'
  },

  // Content management permissions
  {
    id: 'cars.view',
    name: 'View Cars',
    resource: 'cars',
    action: 'view',
    level: 'all',
    description: 'Can view all car listings'
  },
  {
    id: 'cars.create',
    name: 'Create Car Listings',
    resource: 'cars',
    action: 'create',
    level: 'own',
    description: 'Can create own car listings'
  },
  {
    id: 'cars.update',
    name: 'Update Car Listings',
    resource: 'cars',
    action: 'update',
    level: 'own',
    description: 'Can update own car listings'
  },
  {
    id: 'cars.update.all',
    name: 'Update All Car Listings',
    resource: 'cars',
    action: 'update',
    level: 'all',
    description: 'Can update all car listings'
  },
  {
    id: 'cars.delete',
    name: 'Delete Car Listings',
    resource: 'cars',
    action: 'delete',
    level: 'own',
    description: 'Can delete own car listings'
  },
  {
    id: 'cars.delete.all',
    name: 'Delete All Car Listings',
    resource: 'cars',
    action: 'delete',
    level: 'all',
    description: 'Can delete all car listings'
  },

  // System permissions
  {
    id: 'system.admin',
    name: 'System Administration',
    resource: 'system',
    action: 'admin',
    level: 'all',
    description: 'Full system administration access'
  },
  {
    id: 'system.view.stats',
    name: 'View System Statistics',
    resource: 'system',
    action: 'view',
    level: 'stats',
    description: 'Can view system statistics'
  }
];

// User status options
export const USER_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  BANNED: 'banned'
} as const;

// Verification status options
export const VERIFICATION_STATUSES = {
  UNVERIFIED: 'unverified',
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
} as const;

// Activity log actions
export const ACTIVITY_ACTIONS = {
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  ROLE_CREATED: 'ROLE_CREATED',
  ROLE_UPDATED: 'ROLE_UPDATED',
  ROLE_DELETED: 'ROLE_DELETED',
  PERMISSION_GRANTED: 'PERMISSION_GRANTED',
  PERMISSION_REVOKED: 'PERMISSION_REVOKED',
  STATUS_CHANGED: 'STATUS_CHANGED',
  PROFILE_UPDATED: 'PROFILE_UPDATED'
} as const;

// Default user preferences
export const DEFAULT_USER_PREFERENCES = {
  language: 'bg',
  notifications: true,
  theme: 'light' as const
};

// System role definitions with default permissions
export const SYSTEM_ROLE_DEFINITIONS = {
  [SYSTEM_ROLES.SUPER_ADMIN]: {
    name: 'Super Administrator',
    description: 'Full system access with all permissions',
    permissions: DEFAULT_PERMISSIONS,
    isSystemRole: true
  },
  [SYSTEM_ROLES.ADMIN]: {
    name: 'Administrator',
    description: 'Administrative access with most permissions',
    permissions: DEFAULT_PERMISSIONS.filter(p => p.id !== 'system.admin'),
    isSystemRole: true
  },
  [SYSTEM_ROLES.MODERATOR]: {
    name: 'Moderator',
    description: 'Content moderation and user management',
    permissions: DEFAULT_PERMISSIONS.filter(p =>
      p.resource === 'users' || p.resource === 'cars' || p.id === 'system.view.stats'
    ),
    isSystemRole: true
  },
  [SYSTEM_ROLES.DEALER]: {
    name: 'Dealer',
    description: 'Professional car dealer with enhanced permissions',
    permissions: DEFAULT_PERMISSIONS.filter(p =>
      p.resource === 'cars' || p.id === 'users.view' || p.id === 'users.update'
    ),
    isSystemRole: true
  },
  [SYSTEM_ROLES.PRIVATE_SELLER]: {
    name: 'Private Seller',
    description: 'Individual car seller',
    permissions: DEFAULT_PERMISSIONS.filter(p =>
      p.resource === 'cars' && p.level === 'own'
    ),
    isSystemRole: true
  },
  [SYSTEM_ROLES.COMPANY]: {
    name: 'Company',
    description: 'Company account with team management',
    permissions: DEFAULT_PERMISSIONS.filter(p =>
      p.resource === 'cars' || p.id === 'users.view' || p.id === 'users.update'
    ),
    isSystemRole: true
  },
  [SYSTEM_ROLES.USER]: {
    name: 'User',
    description: 'Basic user with limited permissions',
    permissions: DEFAULT_PERMISSIONS.filter(p =>
      p.id === 'users.view' || p.id === 'cars.view' || (p.resource === 'cars' && p.level === 'own')
    ),
    isSystemRole: true
  }
};