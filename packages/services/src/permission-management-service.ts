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
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '@globul-cars/services';
import { serviceLogger } from './logger-wrapper';

// Permission Management Interfaces
export interface PermissionCategory {
  id: string;
  name: string;
  nameBg: string;
  nameEn: string;
  description: string;
  descriptionBg: string;
  descriptionEn: string;
  icon: string;
  order: number;
  isActive: boolean;
}

export interface PermissionTemplate {
  id: string;
  categoryId: string;
  name: string;
  nameBg: string;
  nameEn: string;
  description: string;
  descriptionBg: string;
  descriptionEn: string;
  resource: string;
  action: string;
  level: 'read' | 'write' | 'delete' | 'admin';
  isSystemPermission: boolean;
  isActive: boolean;
  order: number;
}

export interface RoleTemplate {
  id: string;
  name: string;
  nameBg: string;
  nameEn: string;
  description: string;
  descriptionBg: string;
  descriptionEn: string;
  permissions: string[];
  isSystemRole: boolean;
  isActive: boolean;
  level: 'basic' | 'advanced' | 'admin' | 'super_admin';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPermission {
  userId: string;
  permissions: string[];
  customPermissions: string[];
  inheritedFromRoles: string[];
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

class PermissionManagementService {
  private static instance: PermissionManagementService;

  private constructor() {}

  public static getInstance(): PermissionManagementService {
    if (!PermissionManagementService.instance) {
      PermissionManagementService.instance = new PermissionManagementService();
    }
    return PermissionManagementService.instance;
  }

  // Initialize default permissions and roles
  public async initializeDefaultPermissions(): Promise<void> {
    try {
      // Create permission categories
      const categories = [
        {
          id: 'user_management',
          name: 'User Management',
          nameBg: 'Управление на потребители',
          nameEn: 'User Management',
          description: 'Permissions related to user management',
          descriptionBg: 'Права, свързани с управлението на потребители',
          descriptionEn: 'Permissions related to user management',
          icon: 'Users',
          order: 1,
          isActive: true
        },
        {
          id: 'content_management',
          name: 'Content Management',
          nameBg: 'Управление на съдържание',
          nameEn: 'Content Management',
          description: 'Permissions related to content management',
          descriptionBg: 'Права, свързани с управлението на съдържание',
          descriptionEn: 'Permissions related to content management',
          icon: 'FileText',
          order: 2,
          isActive: true
        },
        {
          id: 'system_administration',
          name: 'System Administration',
          nameBg: 'Системна администрация',
          nameEn: 'System Administration',
          description: 'Permissions related to system administration',
          descriptionBg: 'Права, свързани със системната администрация',
          descriptionEn: 'Permissions related to system administration',
          icon: 'Settings',
          order: 3,
          isActive: true
        },
        {
          id: 'analytics_reporting',
          name: 'Analytics & Reporting',
          nameBg: 'Анализи и отчети',
          nameEn: 'Analytics & Reporting',
          description: 'Permissions related to analytics and reporting',
          descriptionBg: 'Права, свързани с анализите и отчетите',
          descriptionEn: 'Permissions related to analytics and reporting',
          icon: 'BarChart3',
          order: 4,
          isActive: true
        }
      ];

      // Create permission templates
      const permissions = [
        // User Management Permissions
        {
          id: 'users_create',
          categoryId: 'user_management',
          name: 'Create Users',
          nameBg: 'Създаване на потребители',
          nameEn: 'Create Users',
          description: 'Create new users in the system',
          descriptionBg: 'Създаване на нови потребители в системата',
          descriptionEn: 'Create new users in the system',
          resource: 'users',
          action: 'create',
          level: 'write' as const,
          isSystemPermission: true,
          isActive: true,
          order: 1
        },
        {
          id: 'users_read',
          categoryId: 'user_management',
          name: 'View Users',
          nameBg: 'Преглед на потребители',
          nameEn: 'View Users',
          description: 'View user information',
          descriptionBg: 'Преглед на информация за потребители',
          descriptionEn: 'View user information',
          resource: 'users',
          action: 'read',
          level: 'read' as const,
          isSystemPermission: true,
          isActive: true,
          order: 2
        },
        {
          id: 'users_update',
          categoryId: 'user_management',
          name: 'Update Users',
          nameBg: 'Обновяване на потребители',
          nameEn: 'Update Users',
          description: 'Update user information',
          descriptionBg: 'Обновяване на информация за потребители',
          descriptionEn: 'Update user information',
          resource: 'users',
          action: 'update',
          level: 'write' as const,
          isSystemPermission: true,
          isActive: true,
          order: 3
        },
        {
          id: 'users_delete',
          categoryId: 'user_management',
          name: 'Delete Users',
          nameBg: 'Изтриване на потребители',
          nameEn: 'Delete Users',
          description: 'Delete users from the system',
          descriptionBg: 'Изтриване на потребители от системата',
          descriptionEn: 'Delete users from the system',
          resource: 'users',
          action: 'delete',
          level: 'delete' as const,
          isSystemPermission: true,
          isActive: true,
          order: 4
        },
        {
          id: 'users_ban',
          categoryId: 'user_management',
          name: 'Ban Users',
          nameBg: 'Блокиране на потребители',
          nameEn: 'Ban Users',
          description: 'Ban or suspend users',
          descriptionBg: 'Блокиране или спиране на потребители',
          descriptionEn: 'Ban or suspend users',
          resource: 'users',
          action: 'ban',
          level: 'admin' as const,
          isSystemPermission: true,
          isActive: true,
          order: 5
        },
        // Content Management Permissions
        {
          id: 'cars_manage',
          categoryId: 'content_management',
          name: 'Manage Cars',
          nameBg: 'Управление на автомобили',
          nameEn: 'Manage Cars',
          description: 'Manage car listings',
          descriptionBg: 'Управление на обяви за автомобили',
          descriptionEn: 'Manage car listings',
          resource: 'cars',
          action: 'manage',
          level: 'write' as const,
          isSystemPermission: true,
          isActive: true,
          order: 1
        },
        {
          id: 'messages_manage',
          categoryId: 'content_management',
          name: 'Manage Messages',
          nameBg: 'Управление на съобщения',
          nameEn: 'Manage Messages',
          description: 'Manage user messages',
          descriptionBg: 'Управление на потребителски съобщения',
          descriptionEn: 'Manage user messages',
          resource: 'messages',
          action: 'manage',
          level: 'write' as const,
          isSystemPermission: true,
          isActive: true,
          order: 2
        },
        // System Administration Permissions
        {
          id: 'system_settings',
          categoryId: 'system_administration',
          name: 'System Settings',
          nameBg: 'Системни настройки',
          nameEn: 'System Settings',
          description: 'Manage system settings',
          descriptionBg: 'Управление на системните настройки',
          descriptionEn: 'Manage system settings',
          resource: 'system',
          action: 'settings',
          level: 'admin' as const,
          isSystemPermission: true,
          isActive: true,
          order: 1
        },
        {
          id: 'roles_manage',
          categoryId: 'system_administration',
          name: 'Manage Roles',
          nameBg: 'Управление на роли',
          nameEn: 'Manage Roles',
          description: 'Manage user roles and permissions',
          descriptionBg: 'Управление на потребителски роли и права',
          descriptionEn: 'Manage user roles and permissions',
          resource: 'roles',
          action: 'manage',
          level: 'admin' as const,
          isSystemPermission: true,
          isActive: true,
          order: 2
        },
        // Analytics Permissions
        {
          id: 'analytics_view',
          categoryId: 'analytics_reporting',
          name: 'View Analytics',
          nameBg: 'Преглед на анализи',
          nameEn: 'View Analytics',
          description: 'View system analytics',
          descriptionBg: 'Преглед на системни анализи',
          descriptionEn: 'View system analytics',
          resource: 'analytics',
          action: 'view',
          level: 'read' as const,
          isSystemPermission: true,
          isActive: true,
          order: 1
        },
        {
          id: 'reports_generate',
          categoryId: 'analytics_reporting',
          name: 'Generate Reports',
          nameBg: 'Генериране на отчети',
          nameEn: 'Generate Reports',
          description: 'Generate system reports',
          descriptionBg: 'Генериране на системни отчети',
          descriptionEn: 'Generate system reports',
          resource: 'reports',
          action: 'generate',
          level: 'write' as const,
          isSystemPermission: true,
          isActive: true,
          order: 2
        }
      ];

      // Create role templates
      const roles = [
        {
          id: 'super_admin',
          name: 'Super Administrator',
          nameBg: 'Супер администратор',
          nameEn: 'Super Administrator',
          description: 'Full system access with all permissions',
          descriptionBg: 'Пълен достъп до системата с всички права',
          descriptionEn: 'Full system access with all permissions',
          permissions: permissions.map(p => p.id),
          isSystemRole: true,
          isActive: true,
          level: 'super_admin' as const,
          createdBy: 'system',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'admin',
          name: 'Administrator',
          nameBg: 'Администратор',
          nameEn: 'Administrator',
          description: 'Administrative access with most permissions',
          descriptionBg: 'Административен достъп с повечето права',
          descriptionEn: 'Administrative access with most permissions',
          permissions: permissions.map(p => p.id),
          isSystemRole: true,
          isActive: true,
          level: 'admin' as const,
          createdBy: 'system',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'moderator',
          name: 'Moderator',
          nameBg: 'Модератор',
          nameEn: 'Moderator',
          description: 'Content moderation and user management',
          descriptionBg: 'Модерация на съдържание и управление на потребители',
          descriptionEn: 'Content moderation and user management',
          permissions: permissions.filter(p => 
            p.categoryId === 'user_management' || p.categoryId === 'content_management'
          ).map(p => p.id),
          isSystemRole: true,
          isActive: true,
          level: 'advanced' as const,
          createdBy: 'system',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'analyst',
          name: 'Analyst',
          nameBg: 'Аналитик',
          nameEn: 'Analyst',
          description: 'Analytics and reporting access',
          descriptionBg: 'Достъп до анализи и отчети',
          descriptionEn: 'Analytics and reporting access',
          permissions: permissions.filter(p => p.categoryId === 'analytics_reporting').map(p => p.id),
          isSystemRole: true,
          isActive: true,
          level: 'basic' as const,
          createdBy: 'system',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      // Save to Firestore
      const batch = writeBatch(db);
      
      // Save categories
      for (const category of categories) {
        const categoryRef = doc(db, 'permission_categories', category.id);
        batch.set(categoryRef, category);
      }
      
      // Save permissions
      for (const permission of permissions) {
        const permissionRef = doc(db, 'permission_templates', permission.id);
        batch.set(permissionRef, permission);
      }
      
      // Save roles
      for (const role of roles) {
        const roleRef = doc(db, 'role_templates', role.id);
        batch.set(roleRef, role);
      }
      
      await batch.commit();
      serviceLogger.info('Default permissions and roles initialized', { categoriesCount: categories.length, permissionsCount: permissions.length, rolesCount: roles.length });
    } catch (error) {
      serviceLogger.error('Error initializing default permissions', error as Error, {});
      throw error;
    }
  }

  // Get all permission categories
  public async getPermissionCategories(): Promise<PermissionCategory[]> {
    try {
      const q = query(collection(db, 'permission_categories'), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as PermissionCategory));
    } catch (error) {
      serviceLogger.error('Error getting permission categories', error as Error, {});
      return [];
    }
  }

  // Get all permission templates
  public async getPermissionTemplates(): Promise<PermissionTemplate[]> {
    try {
      const q = query(collection(db, 'permission_templates'), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as PermissionTemplate));
    } catch (error) {
      serviceLogger.error('Error getting permission templates', error as Error, {});
      return [];
    }
  }

  // Get permissions by category
  public async getPermissionsByCategory(categoryId: string): Promise<PermissionTemplate[]> {
    try {
      const q = query(
        collection(db, 'permission_templates'),
        where('categoryId', '==', categoryId),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as PermissionTemplate));
    } catch (error) {
      serviceLogger.error('Error getting permissions by category', error as Error, { categoryId });
      return [];
    }
  }

  // Get all role templates
  public async getRoleTemplates(): Promise<RoleTemplate[]> {
    try {
      const q = query(collection(db, 'role_templates'), orderBy('level', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as RoleTemplate));
    } catch (error) {
      serviceLogger.error('Error getting role templates', error as Error, {});
      return [];
    }
  }

  // Create custom role
  public async createCustomRole(
    roleData: Omit<RoleTemplate, 'id' | 'createdAt' | 'updatedAt'>,
    createdBy: string
  ): Promise<RoleTemplate> {
    try {
      const roleRef = doc(collection(db, 'role_templates'));
      const roleId = roleRef.id;
      
      const newRole: RoleTemplate = {
        id: roleId,
        ...roleData,
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(roleRef, newRole);
      return newRole;
    } catch (error) {
      serviceLogger.error('Error creating custom role', error as Error, { createdBy });
      throw error;
    }
  }

  // Update role
  public async updateRole(
    roleId: string,
    updates: Partial<RoleTemplate>,
    updatedBy: string
  ): Promise<void> {
    try {
      const roleRef = doc(db, 'role_templates', roleId);
      await updateDoc(roleRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        lastModifiedBy: updatedBy
      });
    } catch (error) {
      serviceLogger.error('Error updating role', error as Error, { roleId, updatedBy });
      throw error;
    }
  }

  // Delete role
  public async deleteRole(roleId: string): Promise<void> {
    try {
      const roleRef = doc(db, 'role_templates', roleId);
      await deleteDoc(roleRef);
    } catch (error) {
      serviceLogger.error('Error deleting role', error as Error, { roleId });
      throw error;
    }
  }

  // Grant permission to user
  public async grantPermissionToUser(
    userId: string,
    permissionId: string,
    grantedBy: string,
    expiresAt?: Date
  ): Promise<void> {
    try {
      const userPermissionRef = doc(db, 'user_permissions', `${userId}_${permissionId}`);
      const userPermission: UserPermission = {
        userId,
        permissions: [permissionId],
        customPermissions: [],
        inheritedFromRoles: [],
        grantedBy,
        grantedAt: new Date(),
        expiresAt,
        isActive: true
      };
      
      await setDoc(userPermissionRef, userPermission);
    } catch (error) {
      serviceLogger.error('Error granting permission to user', error as Error, { userId, permissionId, grantedBy });
      throw error;
    }
  }

  // Revoke permission from user
  public async revokePermissionFromUser(userId: string, permissionId: string): Promise<void> {
    try {
      const userPermissionRef = doc(db, 'user_permissions', `${userId}_${permissionId}`);
      await deleteDoc(userPermissionRef);
    } catch (error) {
      serviceLogger.error('Error revoking permission from user', error as Error, { userId, permissionId });
      throw error;
    }
  }

  // Check if user has permission
  public async userHasPermission(
    userId: string,
    resource: string,
    action: string,
    level: string
  ): Promise<boolean> {
    try {
      // Check direct permissions
      const directPermissionQuery = query(
        collection(db, 'user_permissions'),
        where('userId', '==', userId),
        where('isActive', '==', true)
      );
      const directSnapshot = await getDocs(directPermissionQuery);
      
      for (const doc of directSnapshot.docs) {
        const userPermission = doc.data() as UserPermission;
        // Check if permission matches
        if (userPermission.permissions.includes(`${resource}_${action}`)) {
          return true;
        }
      }
      
      // Check role-based permissions
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const userRoles = userData.roles || [];
        
        for (const roleId of userRoles) {
          const roleRef = doc(db, 'role_templates', roleId);
          const roleSnap = await getDoc(roleRef);
          
          if (roleSnap.exists()) {
            const roleData = roleSnap.data() as RoleTemplate;
            if (roleData.permissions.includes(`${resource}_${action}`)) {
              return true;
            }
          }
        }
      }
      
      return false;
    } catch (error) {
      serviceLogger.error('Error checking user permission', error as Error, { userId, resource, action });
      return false;
    }
  }

  // Get user's effective permissions
  public async getUserEffectivePermissions(userId: string): Promise<string[]> {
    try {
      const effectivePermissions: string[] = [];
      
      // Get user data
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const userRoles = userData.roles || [];
        
        // Get permissions from roles
        for (const roleId of userRoles) {
          const roleRef = doc(db, 'role_templates', roleId);
          const roleSnap = await getDoc(roleRef);
          
          if (roleSnap.exists()) {
            const roleData = roleSnap.data() as RoleTemplate;
            effectivePermissions.push(...roleData.permissions);
          }
        }
        
        // Get direct permissions
        const directPermissionQuery = query(
          collection(db, 'user_permissions'),
          where('userId', '==', userId),
          where('isActive', '==', true)
        );
        const directSnapshot = await getDocs(directPermissionQuery);
        
        for (const doc of directSnapshot.docs) {
          const userPermission = doc.data() as UserPermission;
          effectivePermissions.push(...userPermission.permissions);
        }
      }
      
      // Remove duplicates
      return [...new Set(effectivePermissions)];
    } catch (error) {
      serviceLogger.error('Error getting user effective permissions', error as Error, { userId });
      return [];
    }
  }
}

export const permissionManagementService = PermissionManagementService.getInstance();
