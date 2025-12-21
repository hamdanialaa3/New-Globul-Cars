/**
 * Permissions Service - Calculate and manage user permissions
 * Phase 2A: Core Service Layer
 * 
 * This service calculates permissions based on profile type and plan tier.
 * All permission checks should go through this service.
 * 
 * File: src/services/profile/PermissionsService.ts
 */

import type { 
  ProfileType, 
  PlanTier,
  ProfilePermissions as BaseProfilePermissions
} from '../../types/user/bulgarian-user.types';

// Extended permissions for business accounts
export interface ProfilePermissions extends BaseProfilePermissions {
  // Listing permissions
  canAddListings: boolean;
  maxListings: number; // -1 = unlimited
  canFeatureListings: boolean;
  canBulkUpload: boolean;
  
  // Analytics permissions
  hasAnalytics: boolean;
  hasAdvancedAnalytics: boolean;
  hasExportAnalytics: boolean;
  
  // Team permissions
  hasTeam: boolean;
  maxTeamMembers: number;
  canAssignRoles: boolean;
  
  // Data permissions
  canExportData: boolean;
  canImportData: boolean;
  canBulkEdit: boolean;
  
  // API & Integration
  canUseAPI: boolean;
  hasWebhooks: boolean;
  apiRateLimitPerHour: number;
  
  // Marketing & Campaigns
  canCreateCampaigns: boolean;
  maxCampaigns: number;
  canUseEmailMarketing: boolean;
  
  // Support & Services
  hasPrioritySupport: boolean;
  hasAccountManager: boolean;
  canRequestConsultations: boolean;
  
  // Display & Branding
  canCustomizeBranding: boolean;
  canHideCompetitors: boolean;
  hasFeaturedBadge: boolean;
}

export class PermissionsService {
  /**
   * Get complete permissions for a profile type and plan tier
   */
  static getPermissions(profileType: ProfileType, planTier: PlanTier): ProfilePermissions {
    // Base permissions by tier
    const tierPermissions = this.getTierPermissions(planTier);
    
    // Type-specific permissions
    const typePermissions = this.getTypePermissions(profileType);
    
    // Merge permissions
    return {
      ...tierPermissions,
      ...typePermissions
    };
  }

  /**
   * Get permissions based on plan tier
   */
  private static getTierPermissions(planTier: PlanTier): ProfilePermissions {
    switch (planTier) {
      case 'free':
        return {
          canAddListings: true,
          maxListings: 3,
          canFeatureListings: false,
          canBulkUpload: false,
          hasAnalytics: false,
          hasAdvancedAnalytics: false,
          hasExportAnalytics: false,
          hasTeam: false,
          maxTeamMembers: 0,
          canAssignRoles: false,
          canExportData: false,
          canImportData: false,
          canBulkEdit: false,
          canUseAPI: false,
          hasWebhooks: false,
          apiRateLimitPerHour: 0,
          canCreateCampaigns: false,
          maxCampaigns: 0,
          canUseEmailMarketing: false,
          hasPrioritySupport: false,
          hasAccountManager: false,
          canRequestConsultations: false,
          canCustomizeBranding: false,
          canHideCompetitors: false,
          hasFeaturedBadge: false
        };

      case 'dealer':
        return {
          canAddListings: true,
          maxListings: 10,
          canFeatureListings: true,
          canBulkUpload: true,
          hasAnalytics: true,
          hasAdvancedAnalytics: false,
          hasExportAnalytics: true,
          hasTeam: true,
          maxTeamMembers: 2,
          canAssignRoles: false,
          canExportData: true,
          canImportData: true,
          canBulkEdit: true,
          canUseAPI: false,
          hasWebhooks: false,
          apiRateLimitPerHour: 0,
          canCreateCampaigns: true,
          maxCampaigns: 2,
          canUseEmailMarketing: false,
          hasPrioritySupport: true,
          hasAccountManager: false,
          canRequestConsultations: true,
          canCustomizeBranding: false,
          canHideCompetitors: false,
          hasFeaturedBadge: true
        };

      case 'company':
        return {
          canAddListings: true,
          maxListings: -1, // Unlimited
          canFeatureListings: true,
          canBulkUpload: true,
          hasAnalytics: true,
          hasAdvancedAnalytics: true,
          hasExportAnalytics: true,
          hasTeam: true,
          maxTeamMembers: -1, // Unlimited
          canAssignRoles: true,
          canExportData: true,
          canImportData: true,
          canBulkEdit: true,
          canUseAPI: true,
          hasWebhooks: true,
          apiRateLimitPerHour: 10000,
          canCreateCampaigns: true,
          maxCampaigns: -1, // Unlimited
          canUseEmailMarketing: true,
          hasPrioritySupport: true,
          hasAccountManager: true,
          canRequestConsultations: true,
          canCustomizeBranding: true,
          canHideCompetitors: true,
          hasFeaturedBadge: true
        };

      default:
        // Default to free tier permissions
        return this.getTierPermissions('free');
    }
  }

  /**
   * Get additional permissions based on profile type
   */
  private static getTypePermissions(profileType: ProfileType): Partial<ProfilePermissions> {
    switch (profileType) {
      case 'private':
        return {
          // Private users get no additional permissions
        };

      case 'dealer':
        return {
          // Dealers get enhanced listing features
          canFeatureListings: true
        };

      case 'company':
        return {
          // Companies get enhanced team features
          hasTeam: true
        };

      default:
        return {};
    }
  }

  /**
   * Check if user can perform a specific action
   */
  static can(
    action: keyof ProfilePermissions,
    profileType: ProfileType,
    planTier: PlanTier
  ): boolean {
    const permissions = this.getPermissions(profileType, planTier);
    const value = permissions[action];

    // Handle boolean permissions
    if (typeof value === 'boolean') {
      return value;
    }

    // Handle numeric permissions (treat -1 as unlimited/true, 0 as false, >0 as true)
    if (typeof value === 'number') {
      return value !== 0;
    }

    return false;
  }

  /**
   * Get listing limit for user
   */
  static getListingLimit(profileType: ProfileType, planTier: PlanTier): number {
    const permissions = this.getPermissions(profileType, planTier);
    return permissions.maxListings;
  }

  /**
   * Get team member limit
   */
  static getTeamLimit(profileType: ProfileType, planTier: PlanTier): number {
    const permissions = this.getPermissions(profileType, planTier);
    return permissions.maxTeamMembers;
  }

  /**
   * Get campaign limit
   */
  static getCampaignLimit(profileType: ProfileType, planTier: PlanTier): number {
    const permissions = this.getPermissions(profileType, planTier);
    return permissions.maxCampaigns;
  }

  /**
   * Get API rate limit
   */
  static getAPIRateLimit(profileType: ProfileType, planTier: PlanTier): number {
    const permissions = this.getPermissions(profileType, planTier);
    return permissions.apiRateLimitPerHour;
  }

  /**
   * Get plan tier name for display
   */
  static getPlanDisplayName(planTier: PlanTier, language: 'bg' | 'en' = 'bg'): string {
    const names: Record<PlanTier, { bg: string; en: string }> = {
      free: { bg: 'Безплатен', en: 'Free' },
      dealer: { bg: 'Дилър', en: 'Dealer' },
      company: { bg: 'Компания', en: 'Company' }
    };

    return names[planTier]?.[language] || planTier;
  }

  /**
   * Compare two plan tiers (returns true if tier1 > tier2)
   */
  static isHigherTier(tier1: PlanTier, tier2: PlanTier): boolean {
    const tierRanking: Record<PlanTier, number> = {
      free: 0,
      dealer: 1,
      company: 2
    };

    return tierRanking[tier1] > tierRanking[tier2];
  }

  /**
   * Get upgrade suggestions
   */
  static getUpgradeSuggestions(
    currentType: ProfileType,
    currentTier: PlanTier
  ): Array<{ tier: PlanTier; benefits: string[] }> {
    const suggestions: Array<{ tier: PlanTier; benefits: string[] }> = [];

    if (currentTier === 'free') {
      suggestions.push({
        tier: 'dealer',
        benefits: [
          '10 активни обяви',
          'Аналитика',
          'Приоритетна поддръжка'
        ]
      });
    }

    if (currentTier === 'dealer') {
      suggestions.push({
        tier: 'company',
        benefits: [
          'Неограничени обяви',
          'API достъп',
          'Персонален мениджър'
        ]
      });
    }

    return suggestions;
  }
}

export default PermissionsService;

