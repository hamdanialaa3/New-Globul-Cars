// RBAC Constants - Role permissions matrix (BG/EN agnostic keys)
// Keep under 300 lines, no emojis.

export type Role = 'user' | 'dealer' | 'company' | 'admin' | 'super_admin';

export interface PermissionDefinition {
  description: string; // English description; UI can map to t('rbac.*') later
  roles: Role[]; // roles that have this permission
}

// Permission keys used across components/services
export const PERMISSIONS: Record<string, PermissionDefinition> = {
  'listing.create': { description: 'Create listings', roles: ['user','dealer','company','admin','super_admin'] },
  'listing.publish': { description: 'Publish listings', roles: ['user','dealer','company','admin','super_admin'] },
  'listing.pause': { description: 'Pause listings', roles: ['user','dealer','company','admin','super_admin'] },
  'listing.delete': { description: 'Archive listings', roles: ['user','dealer','company','admin','super_admin'] },
  'verification.request': { description: 'Request verification', roles: ['user','dealer','company'] },
  'verification.approve': { description: 'Approve verification', roles: ['admin','super_admin'] },
  'badge.assign': { description: 'Assign badges', roles: ['admin','super_admin'] },
  'team.invite': { description: 'Invite team members', roles: ['dealer','company','admin','super_admin'] },
  'team.role.change': { description: 'Change team member roles', roles: ['dealer','company','admin','super_admin'] },
  'posts.create': { description: 'Create posts', roles: ['user','dealer','company','admin','super_admin'] },
  'posts.moderate': { description: 'Moderate posts', roles: ['admin','super_admin'] },
  'analytics.view.basic': { description: 'View basic analytics', roles: ['user','dealer','company','admin','super_admin'] },
  'analytics.view.advanced': { description: 'View advanced analytics', roles: ['dealer','company','admin','super_admin'] },
  'analytics.view.global': { description: 'View global marketplace stats', roles: ['admin','super_admin'] },
  'savedSearch.create': { description: 'Create saved searches', roles: ['user','dealer','company','admin','super_admin'] },
  'savedSearch.manage': { description: 'Manage saved searches', roles: ['user','dealer','company','admin','super_admin'] },
  'notification.read': { description: 'Read notifications', roles: ['user','dealer','company','admin','super_admin'] },
  'notification.send': { description: 'Send manual notifications', roles: ['admin','super_admin'] }
};

export function hasPermission(role: Role, permissionKey: string): boolean {
  const def = PERMISSIONS[permissionKey];
  if (!def) return false;
  return def.roles.includes(role);
}

// Helper: Filter permission keys available to a role
export function listRolePermissions(role: Role): string[] {
  return Object.keys(PERMISSIONS).filter(k => PERMISSIONS[k].roles.includes(role));
}

// Future extension: dynamic role hierarchy or Firestore-driven permissions table.
