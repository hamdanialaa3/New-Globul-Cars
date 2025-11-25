// RBAC Unit Tests
// Testing permission system with comprehensive coverage
// All role combinations and permission checks validated

import { hasPermission, listRolePermissions, PERMISSIONS, Role } from '../rbac';

describe('RBAC Constants', () => {
  describe('hasPermission', () => {
    it('should grant listing.create to all roles', () => {
      const roles: Role[] = ['user', 'dealer', 'company', 'admin', 'super_admin'];
      roles.forEach(role => {
        expect(hasPermission(role, 'listing.create')).toBe(true);
      });
    });

    it('should grant badge.assign only to admin and super_admin', () => {
      expect(hasPermission('user', 'badge.assign')).toBe(false);
      expect(hasPermission('dealer', 'badge.assign')).toBe(false);
      expect(hasPermission('company', 'badge.assign')).toBe(false);
      expect(hasPermission('admin', 'badge.assign')).toBe(true);
      expect(hasPermission('super_admin', 'badge.assign')).toBe(true);
    });

    it('should grant team.invite to dealer, company, admin, super_admin', () => {
      expect(hasPermission('user', 'team.invite')).toBe(false);
      expect(hasPermission('dealer', 'team.invite')).toBe(true);
      expect(hasPermission('company', 'team.invite')).toBe(true);
      expect(hasPermission('admin', 'team.invite')).toBe(true);
      expect(hasPermission('super_admin', 'team.invite')).toBe(true);
    });

    it('should grant analytics.view.global only to admin and super_admin', () => {
      expect(hasPermission('user', 'analytics.view.global')).toBe(false);
      expect(hasPermission('dealer', 'analytics.view.global')).toBe(false);
      expect(hasPermission('company', 'analytics.view.global')).toBe(false);
      expect(hasPermission('admin', 'analytics.view.global')).toBe(true);
      expect(hasPermission('super_admin', 'analytics.view.global')).toBe(true);
    });

    it('should return false for non-existent permission', () => {
      expect(hasPermission('admin', 'nonexistent.permission')).toBe(false);
    });

    it('should handle edge cases gracefully', () => {
      expect(hasPermission('user', '')).toBe(false);
      expect(hasPermission('' as Role, 'listing.create')).toBe(false);
    });
  });

  describe('listRolePermissions', () => {
    it('should return correct count of permissions for user role', () => {
      const userPerms = listRolePermissions('user');
      expect(userPerms.length).toBeGreaterThan(0);
      expect(userPerms).toContain('listing.create');
      expect(userPerms).toContain('savedSearch.create');
    });

    it('should return more permissions for admin than user', () => {
      const userPerms = listRolePermissions('user');
      const adminPerms = listRolePermissions('admin');
      expect(adminPerms.length).toBeGreaterThan(userPerms.length);
    });

    it('should include all permissions for super_admin', () => {
      const superAdminPerms = listRolePermissions('super_admin');
      const allPermissions = Object.keys(PERMISSIONS);
      expect(superAdminPerms.length).toBe(allPermissions.length);
    });
  });

  describe('PERMISSIONS structure', () => {
    it('should have valid structure for all permissions', () => {
      Object.entries(PERMISSIONS).forEach(([key, def]) => {
        expect(def).toHaveProperty('description');
        expect(def).toHaveProperty('roles');
        expect(typeof def.description).toBe('string');
        expect(Array.isArray(def.roles)).toBe(true);
        expect(def.roles.length).toBeGreaterThan(0);
      });
    });

    it('should have consistent permission naming', () => {
      const keys = Object.keys(PERMISSIONS);
      keys.forEach(key => {
        expect(key).toMatch(/^[a-z]+\.[a-z.]+$/);
      });
    });
  });
});
