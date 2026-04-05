// src/components/guards/index.ts
/**
 * Guards Barrel Export
 *
 * Centralized export point for all guard components
 * Makes imports cleaner and more maintainable
 *
 * @example
 * import { AuthGuard } from '../../components/guards';
 */

export { AuthGuard, type AuthGuardProps } from './AuthGuard';
export { NumericIdGuard } from './NumericIdGuard';
export { RequireCompanyGuard } from './RequireCompanyGuard';
export { RoleGuard } from './RoleGuard';
export { SuperAdminAuthGuard } from './SuperAdminAuthGuard';

// Re-export for backward compatibility during migration
export { AuthGuard as default } from './AuthGuard';
