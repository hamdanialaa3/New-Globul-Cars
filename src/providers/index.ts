// src/providers/index.ts
/**
 * Providers Barrel Export
 * 
 * Centralized export point for all provider components.
 * Makes imports cleaner and more maintainable.
 * 
 * @example
 * import { AppProviders } from '@/providers';
 */

export { AppProviders } from './AppProviders';

// Re-export for backward compatibility during migration
export { AppProviders as default } from './AppProviders';
