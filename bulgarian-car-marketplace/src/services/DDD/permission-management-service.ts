import { initializeDefaultPermissions } from './permission-management-operations';
import {
  getPermissionCategories,
  getPermissionTemplates,
  getPermissionsByCategory,
  getRoleTemplates,
  createCustomRole,
  updateRole,
  deleteRole,
  grantPermissionToUser,
  revokePermissionFromUser,
  userHasPermission,
  getUserEffectivePermissions
} from './permission-management-operations';
import { PermissionCategory, PermissionTemplate, RoleTemplate } from './permission-management-types';

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
    return initializeDefaultPermissions();
  }

  // Get all permission categories
  public async getPermissionCategories(): Promise<PermissionCategory[]> {
    return getPermissionCategories();
  }

  // Get all permission templates
  public async getPermissionTemplates(): Promise<PermissionTemplate[]> {
    return getPermissionTemplates();
  }

  // Get permissions by category
  public async getPermissionsByCategory(categoryId: string): Promise<PermissionTemplate[]> {
    return getPermissionsByCategory(categoryId);
  }

  // Get all role templates
  public async getRoleTemplates(): Promise<RoleTemplate[]> {
    return getRoleTemplates();
  }

  // Create custom role
  public async createCustomRole(
    roleData: Omit<RoleTemplate, 'id' | 'createdAt' | 'updatedAt'>,
    createdBy: string
  ): Promise<RoleTemplate> {
    return createCustomRole(roleData, createdBy);
  }

  // Update role
  public async updateRole(
    roleId: string,
    updates: Partial<RoleTemplate>,
    updatedBy: string
  ): Promise<void> {
    return updateRole(roleId, updates, updatedBy);
  }

  // Delete role
  public async deleteRole(roleId: string): Promise<void> {
    return deleteRole(roleId);
  }

  // Grant permission to user
  public async grantPermissionToUser(
    userId: string,
    permissionId: string,
    grantedBy: string,
    expiresAt?: Date
  ): Promise<void> {
    return grantPermissionToUser(userId, permissionId, grantedBy, expiresAt);
  }

  // Revoke permission from user
  public async revokePermissionFromUser(userId: string, permissionId: string): Promise<void> {
    return revokePermissionFromUser(userId, permissionId);
  }

  // Check if user has permission
  public async userHasPermission(
    userId: string,
    resource: string,
    action: string,
    level: string
  ): Promise<boolean> {
    return userHasPermission(userId, resource, action, level);
  }

  // Get user's effective permissions
  public async getUserEffectivePermissions(userId: string): Promise<string[]> {
    return getUserEffectivePermissions(userId);
  }
}

export const permissionManagementService = PermissionManagementService.getInstance();
