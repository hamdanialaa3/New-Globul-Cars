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
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-service';
import {
  PermissionCategory,
  PermissionTemplate,
  RoleTemplate,
  UserPermission
} from './permission-management-types';
import {
  DEFAULT_PERMISSION_CATEGORIES,
  DEFAULT_PERMISSION_TEMPLATES,
  DEFAULT_ROLE_TEMPLATES
} from './permission-management-data';

// Initialize default permissions and roles
export async function initializeDefaultPermissions(): Promise<void> {
  try {
    // Save to Firestore
    const batch = writeBatch(db);

    // Save categories
    for (const category of DEFAULT_PERMISSION_CATEGORIES) {
      const categoryRef = doc(db, 'permission_categories', category.id);
      batch.set(categoryRef, category);
    }

    // Save permissions
    for (const permission of DEFAULT_PERMISSION_TEMPLATES) {
      const permissionRef = doc(db, 'permission_templates', permission.id);
      batch.set(permissionRef, permission);
    }

    // Save roles
    for (const role of DEFAULT_ROLE_TEMPLATES) {
      const roleRef = doc(db, 'role_templates', role.id);
      batch.set(roleRef, role);
    }

    await batch.commit();
    serviceLogger.info('Default permissions and roles initialized', {
      categoriesCount: DEFAULT_PERMISSION_CATEGORIES.length,
      permissionsCount: DEFAULT_PERMISSION_TEMPLATES.length,
      rolesCount: DEFAULT_ROLE_TEMPLATES.length
    });
  } catch (error) {
    serviceLogger.error('Error initializing default permissions', error as Error, {});
    throw error;
  }
}

// Get all permission categories
export async function getPermissionCategories(): Promise<PermissionCategory[]> {
  try {
    const q = query(collection(db, 'permission_categories'), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id } as PermissionCategory));
  } catch (error) {
    serviceLogger.error('Error getting permission categories', error as Error, {});
    return [];
  }
}

// Get all permission templates
export async function getPermissionTemplates(): Promise<PermissionTemplate[]> {
  try {
    const q = query(collection(db, 'permission_templates'), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id } as PermissionTemplate));
  } catch (error) {
    serviceLogger.error('Error getting permission templates', error as Error, {});
    return [];
  }
}

// Get permissions by category
export async function getPermissionsByCategory(categoryId: string): Promise<PermissionTemplate[]> {
  try {
    const q = query(
      collection(db, 'permission_templates'),
      where('categoryId', '==', categoryId),
      orderBy('order', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id } as PermissionTemplate));
  } catch (error) {
    serviceLogger.error('Error getting permissions by category', error as Error, { categoryId });
    return [];
  }
}

// Get all role templates
export async function getRoleTemplates(): Promise<RoleTemplate[]> {
  try {
    const q = query(collection(db, 'role_templates'), orderBy('level', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id } as RoleTemplate));
  } catch (error) {
    serviceLogger.error('Error getting role templates', error as Error, {});
    return [];
  }
}

// Create custom role
export async function createCustomRole(
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
export async function updateRole(
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
export async function deleteRole(roleId: string): Promise<void> {
  try {
    const roleRef = doc(db, 'role_templates', roleId);
    await deleteDoc(roleRef);
  } catch (error) {
    serviceLogger.error('Error deleting role', error as Error, { roleId });
    throw error;
  }
}

// Grant permission to user
export async function grantPermissionToUser(
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
export async function revokePermissionFromUser(userId: string, permissionId: string): Promise<void> {
  try {
    const userPermissionRef = doc(db, 'user_permissions', `${userId}_${permissionId}`);
    await deleteDoc(userPermissionRef);
  } catch (error) {
    serviceLogger.error('Error revoking permission from user', error as Error, { userId, permissionId });
    throw error;
  }
}

// Check if user has permission
export async function userHasPermission(
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
export async function getUserEffectivePermissions(userId: string): Promise<string[]> {
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
