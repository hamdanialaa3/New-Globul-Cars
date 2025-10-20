"use strict";
// functions/src/team/permissions.ts
// Team Permissions Configuration
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultPermissions = getDefaultPermissions;
exports.mergePermissions = mergePermissions;
exports.validatePermissionHierarchy = validatePermissionHierarchy;
/**
 * Get default permissions for a team role
 */
function getDefaultPermissions(role) {
    switch (role) {
        case 'owner':
            return {
                // Full access to everything
                canCreateListings: true,
                canEditListings: true,
                canDeleteListings: true,
                canPublishListings: true,
                canReadMessages: true,
                canSendMessages: true,
                canDeleteMessages: true,
                canRespondToReviews: true,
                canViewReviews: true,
                canViewAnalytics: true,
                canViewFinancials: true,
                canInviteMembers: true,
                canRemoveMembers: true,
                canEditMemberRoles: true,
                canEditBusinessProfile: true,
                canManageSubscriptions: true,
            };
        case 'admin':
            return {
                // Nearly full access, except subscriptions
                canCreateListings: true,
                canEditListings: true,
                canDeleteListings: true,
                canPublishListings: true,
                canReadMessages: true,
                canSendMessages: true,
                canDeleteMessages: true,
                canRespondToReviews: true,
                canViewReviews: true,
                canViewAnalytics: true,
                canViewFinancials: true,
                canInviteMembers: true,
                canRemoveMembers: true,
                canEditMemberRoles: false, // Cannot change roles
                canEditBusinessProfile: true,
                canManageSubscriptions: false,
            };
        case 'manager':
            return {
                // Manage listings and team, limited analytics
                canCreateListings: true,
                canEditListings: true,
                canDeleteListings: false, // Cannot delete
                canPublishListings: true,
                canReadMessages: true,
                canSendMessages: true,
                canDeleteMessages: false,
                canRespondToReviews: true,
                canViewReviews: true,
                canViewAnalytics: true,
                canViewFinancials: false, // Cannot see financials
                canInviteMembers: true,
                canRemoveMembers: false,
                canEditMemberRoles: false,
                canEditBusinessProfile: false,
                canManageSubscriptions: false,
            };
        case 'sales':
            return {
                // Focus on listings and customer communication
                canCreateListings: true,
                canEditListings: true,
                canDeleteListings: false,
                canPublishListings: false, // Needs approval
                canReadMessages: true,
                canSendMessages: true,
                canDeleteMessages: false,
                canRespondToReviews: false, // Cannot respond to reviews
                canViewReviews: true,
                canViewAnalytics: true,
                canViewFinancials: false,
                canInviteMembers: false,
                canRemoveMembers: false,
                canEditMemberRoles: false,
                canEditBusinessProfile: false,
                canManageSubscriptions: false,
            };
        case 'support':
            return {
                // Focus on customer support only
                canCreateListings: false,
                canEditListings: false,
                canDeleteListings: false,
                canPublishListings: false,
                canReadMessages: true,
                canSendMessages: true,
                canDeleteMessages: false,
                canRespondToReviews: true, // Can respond to reviews
                canViewReviews: true,
                canViewAnalytics: false,
                canViewFinancials: false,
                canInviteMembers: false,
                canRemoveMembers: false,
                canEditMemberRoles: false,
                canEditBusinessProfile: false,
                canManageSubscriptions: false,
            };
        default:
            throw new Error(`Unknown role: ${role}`);
    }
}
/**
 * Merge custom permissions with role defaults
 */
function mergePermissions(rolePermissions, customPermissions) {
    if (!customPermissions) {
        return rolePermissions;
    }
    return Object.assign(Object.assign({}, rolePermissions), customPermissions);
}
/**
 * Validate permission hierarchy
 * Ensures lower roles cannot have more permissions than higher roles
 */
function validatePermissionHierarchy(role, permissions) {
    const ownerPermissions = getDefaultPermissions('owner');
    // Owner can have any permissions
    if (role === 'owner') {
        return true;
    }
    // Check that user doesn't have permissions they shouldn't
    const roleDefaults = getDefaultPermissions(role);
    // Ensure no permission exceeds role defaults + owner approval
    for (const key in permissions) {
        const permKey = key;
        if (permissions[permKey] && !roleDefaults[permKey] && !ownerPermissions[permKey]) {
            return false;
        }
    }
    return true;
}
//# sourceMappingURL=permissions.js.map