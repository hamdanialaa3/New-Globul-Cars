/**
 * Empty States Components - Barrel Export
 * مكونات الحالة الفارغة - تصدير مركزي
 * 
 * @constitution
 * - Follows PROJECT_CONSTITUTION.md rules
 * - Uses path aliases (CONSTITUTION Section 2.3)
 * 
 * @author CTO & Lead Architect
 * @date January 2026
 */

export { default as NoSearchResults } from './NoSearchResults';
export { default as NoNotifications } from './NoNotifications';
export { default as NoSavedSearches } from './NoSavedSearches';
export { default as NoConsultations } from './NoConsultations';
export { default as NoCampaigns } from './NoCampaigns';
export { default as NoTeamMembers } from './NoTeamMembers';

// Re-export existing EmptyState component for compatibility
export { default as EmptyState } from '../Profile/EmptyState';
