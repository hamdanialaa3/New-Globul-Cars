// src/routes/index.ts
/**
 * Routes Barrel Export
 * 
 * Centralized export point for all route modules.
 * Makes imports cleaner and more maintainable.
 * 
 * Created: Week 2, Route Extraction Refactoring
 * 
 * @example
 * import { AuthRoutes, AdminRoutes, SellRoutes, MainRoutes } from '@/routes';
 */

// Auth routes (4 routes) ✅
export { AuthRoutes } from './auth.routes';
export { default as AuthRoutesDefault } from './auth.routes';

// Admin routes (5 routes) ✅
export { AdminRoutes } from './admin.routes';
export { default as AdminRoutesDefault } from './admin.routes';

// Sell routes (~25 routes) ✅
export { SellRoutes } from './sell.routes';
export { default as SellRoutesDefault } from './sell.routes';

// Main routes (~40 routes) ✅
export { MainRoutes } from './main.routes';
export { default as MainRoutesDefault } from './main.routes';

// Dealer routes (~3 routes) ✅
export { DealerRoutes } from './dealer.routes';
export { default as DealerRoutesDefault } from './dealer.routes';

/**
 * Route Statistics
 * 
 * Total Routes: ~77
 * - Auth: 4 routes ✅
 * - Admin: 5 routes ✅
 * - Sell: ~25 routes ✅
 * - Main: ~40 routes ✅
 * - Dealer: ~3 routes ✅
 * 
 * All route files created and ready for integration!
 */
