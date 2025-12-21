// advanced-user-management-service.ts
// Orchestrator service for advanced user management system

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
  UserOperations,
  RoleOperations,
  PermissionOperations,
  ActivityOperations,
  SystemOperations
} from './advanced-user-management-operations';

export class AdvancedUserManagementService {
  private static instance: AdvancedUserManagementService;

  private constructor() {}

  public static getInstance(): AdvancedUserManagementService {
    if (!AdvancedUserManagementService.instance) {
      AdvancedUserManagementService.instance = new AdvancedUserManagementService();
    }
    return AdvancedUserManagementService.instance;
  }

  // User CRUD operations
  public async createUser(
    userData: CreateUserData,
    createdBy: string
  ): Promise<AdvancedUser> {
    return UserOperations.createUser(userData, createdBy);
  }

  public async getUserById(userId: string): Promise<AdvancedUser | null> {
    return UserOperations.getUserById(userId);
  }

  public async getUsers(limitCount: number = 50): Promise<AdvancedUser[]> {
    return UserOperations.getUsers(limitCount);
  }

  public async updateUser(
    userId: string,
    updateData: UpdateUserData,
    updatedBy: string
  ): Promise<void> {
    return UserOperations.updateUser(userId, updateData, updatedBy);
  }

  public async deleteUser(userId: string, deletedBy: string): Promise<void> {
    return UserOperations.deleteUser(userId, deletedBy);
  }

  // Role operations
  public async createRole(
    roleData: CreateRoleData,
    createdBy: string
  ): Promise<UserRole> {
    return RoleOperations.createRole(roleData, createdBy);
  }

  public async getRoles(): Promise<UserRole[]> {
    return RoleOperations.getRoles();
  }

  // Permission operations
  public async getUserPermissions(userId: string): Promise<Permission[]> {
    return PermissionOperations.getUserPermissions(userId);
  }

  public async hasPermission(
    userId: string,
    resource: string,
    action: string,
    level: string
  ): Promise<boolean> {
    return PermissionOperations.hasPermission(userId, resource, action, level);
  }

  // Activity operations
  public async getUserActivityLogs(
    userId: string,
    limitCount: number = 100
  ): Promise<UserActivityLog[]> {
    return ActivityOperations.getUserActivityLogs(userId, limitCount);
  }

  // System operations
  public async changeUserStatus(
    userId: string,
    status: 'active' | 'inactive' | 'suspended' | 'banned',
    reason: string,
    changedBy: string
  ): Promise<void> {
    return SystemOperations.changeUserStatus(userId, status, reason, changedBy);
  }

  public async getSystemStats(): Promise<SystemStats> {
    return SystemOperations.getSystemStats();
  }
}

export const advancedUserManagementService = AdvancedUserManagementService.getInstance();
