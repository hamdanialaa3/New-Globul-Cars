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
      // Private plans
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

      case 'premium':
        return {
          canAddListings: true,
          maxListings: 10,
          canFeatureListings: true,
          canBulkUpload: false,
          hasAnalytics: true,
          hasAdvancedAnalytics: false,
          hasExportAnalytics: true,
          hasTeam: false,
          maxTeamMembers: 0,
          canAssignRoles: false,
          canExportData: true,
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
          canRequestConsultations: true,
          canCustomizeBranding: false,
          canHideCompetitors: false,
          hasFeaturedBadge: false
        };

      // Dealer plans
      case 'dealer_basic':
        return {
          canAddListings: true,
          maxListings: 50,
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

      case 'dealer_pro':
        return {
          canAddListings: true,
          maxListings: 150,
          canFeatureListings: true,
          canBulkUpload: true,
          hasAnalytics: true,
          hasAdvancedAnalytics: true,
          hasExportAnalytics: true,
          hasTeam: true,
          maxTeamMembers: 5,
          canAssignRoles: true,
          canExportData: true,
          canImportData: true,
          canBulkEdit: true,
          canUseAPI: true,
          hasWebhooks: true,
          apiRateLimitPerHour: 1000,
          canCreateCampaigns: true,
          maxCampaigns: 10,
          canUseEmailMarketing: true,
          hasPrioritySupport: true,
          hasAccountManager: false,
          canRequestConsultations: true,
          canCustomizeBranding: true,
          canHideCompetitors: false,
          hasFeaturedBadge: true
        };

      case 'dealer_enterprise':
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

      // Company plans
      case 'company_starter':
        return {
          canAddListings: true,
          maxListings: 100,
          canFeatureListings: true,
          canBulkUpload: true,
          hasAnalytics: true,
          hasAdvancedAnalytics: true,
          hasExportAnalytics: true,
          hasTeam: true,
          maxTeamMembers: 10,
          canAssignRoles: true,
          canExportData: true,
          canImportData: true,
          canBulkEdit: true,
          canUseAPI: true,
          hasWebhooks: true,
          apiRateLimitPerHour: 2000,
          canCreateCampaigns: true,
          maxCampaigns: 5,
          canUseEmailMarketing: true,
          hasPrioritySupport: true,
          hasAccountManager: false,
          canRequestConsultations: true,
          canCustomizeBranding: true,
          canHideCompetitors: false,
          hasFeaturedBadge: true
        };

      case 'company_pro':
        return {
          canAddListings: true,
          maxListings: -1, // Unlimited
          canFeatureListings: true,
          canBulkUpload: true,
          hasAnalytics: true,
          hasAdvancedAnalytics: true,
          hasExportAnalytics: true,
          hasTeam: true,
          maxTeamMembers: 50,
          canAssignRoles: true,
          canExportData: true,
          canImportData: true,
          canBulkEdit: true,
          canUseAPI: true,
          hasWebhooks: true,
          apiRateLimitPerHour: 5000,
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

      case 'company_enterprise':
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
          apiRateLimitPerHour: 50000,
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
      premium: { bg: 'Премиум', en: 'Premium' },
      dealer_basic: { bg: 'Дилър - Базов', en: 'Dealer - Basic' },
      dealer_pro: { bg: 'Дилър - Професионален', en: 'Dealer - Pro' },
      dealer_enterprise: { bg: 'Дилър - Корпоративен', en: 'Dealer - Enterprise' },
      company_starter: { bg: 'Компания - Стартиращ', en: 'Company - Starter' },
      company_pro: { bg: 'Компания - Професионален', en: 'Company - Pro' },
      company_enterprise: { bg: 'Компания - Корпоративен', en: 'Company - Enterprise' }
    };

    return names[planTier]?.[language] || planTier;
  }

  /**
   * Compare two plan tiers (returns true if tier1 > tier2)
   */
  static isHigherTier(tier1: PlanTier, tier2: PlanTier): boolean {
    const tierRanking: Record<PlanTier, number> = {
      free: 0,
      premium: 1,
      dealer_basic: 2,
      dealer_pro: 3,
      dealer_enterprise: 4,
      company_starter: 3,
      company_pro: 4,
      company_enterprise: 5
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

    if (currentType === 'private') {
      if (currentTier === 'free') {
        suggestions.push({
          tier: 'premium',
          benefits: [
            '10 активни обяви вместо 3',
            'Аналитика и статистики',
            'Експорт на данни',
            'Консултации с експерти'
          ]
        });
      }

      // Suggest dealer upgrade
      suggestions.push({
        tier: 'dealer_basic',
        benefits: [
          '50 активни обяви',
          'Отборна работа (2 члена)',
          'Приоритетна поддръжка',
          'Фирмен профил'
        ]
      });
    }

    if (currentType === 'dealer') {
      if (currentTier === 'dealer_basic') {
        suggestions.push({
          tier: 'dealer_pro',
          benefits: [
            '150 активни обяви вместо 50',
            'Отбор до 5 души',
            'API достъп',
            'Имейл маркетинг'
          ]
        });
      }

      if (currentTier === 'dealer_pro') {
        suggestions.push({
          tier: 'dealer_enterprise',
          benefits: [
            'Неограничени обяви',
            'Неограничен отбор',
            'Персонален мениджър',
            'Персонализиран бранд'
          ]
        });
      }
    }

    return suggestions;
  }
}

export default PermissionsService;

