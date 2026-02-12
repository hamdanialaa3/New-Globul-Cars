// src/layouts/index.ts
/**
 * Layouts Barrel Export
 * 
 * Centralized export point for all layout components.
 * Makes imports cleaner and more maintainable.
 * 
 * Created: Week 3, Day 1
 * Part of: React Router Outlets Refactoring
 * 
 * @example
 * import { MainLayout, FullScreenLayout } from '@/layouts';
 */

// Main layout (with header/footer)
export { MainLayout } from './MainLayout';
export { default as MainLayoutDefault } from './MainLayout';

// Full screen layout (no header/footer)
export { FullScreenLayout } from './FullScreenLayout';
export { default as FullScreenLayoutDefault } from './FullScreenLayout';

/**
 * Layout Statistics
 * 
 * Total Layouts: 2
 * - MainLayout: For regular app pages (~60 routes)
 * - FullScreenLayout: For auth/admin pages (~15 routes)
 * 
 * All layouts use React Router v6 Outlet pattern for optimal performance.
 */
