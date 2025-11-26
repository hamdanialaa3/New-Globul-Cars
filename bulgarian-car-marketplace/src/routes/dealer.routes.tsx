// src/routes/dealer.routes.tsx
/**
 * Dealer Routes
 * 
 * Contains all dealer-related routes (~6 routes):
 * - Dealer public page
 * - Dealer registration
 * - Dealer dashboard
 * - Dealer management
 * 
 * Created: Week 2, Day 4
 * Part of: Route Extraction Refactoring
 */

import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';

// Lazy load dealer pages
const DealerPublicPage = React.lazy(() => import('@/pages/05_dealer/DealerPublicPage'));
const DealerRegistrationPage = React.lazy(() => import('@/pages/05_dealer/DealerRegistrationPage'));
const DealerDashboardPage = React.lazy(() => import('@/pages/05_dealer/DealerDashboardPage'));

/**
 * Dealer Routes Component
 * 
 * Renders all dealer-related routes
 * 
 * Routes:
 * - /dealer/:slug - Public dealer page
 * - /dealer-registration - Dealer registration form
 * - /dealer-dashboard - Dealer dashboard (protected)
 * 
 * @returns {JSX.Element} Dealer routes
 */
export const DealerRoutes: React.FC = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                {/* Dealer Public Page */}
                <Route path="/dealer/:slug" element={<DealerPublicPage />} />

                {/* Dealer Registration */}
                <Route path="/dealer-registration" element={<DealerRegistrationPage />} />

                {/* Dealer Dashboard (Protected) */}
                <Route
                    path="/dealer-dashboard"
                    element={
                        <ProtectedRoute>
                            <DealerDashboardPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Suspense>
    );
};

/**
 * Usage in App.tsx:
 * 
 * import { FEATURE_FLAGS } from '@/config/feature-flags';
 * import { DealerRoutes } from '@/routes/dealer.routes';
 * 
 * // In your Routes:
 * {FEATURE_FLAGS.USE_EXTRACTED_ROUTES ? (
 *   <Route path="/*" element={<DealerRoutes />} />
 * ) : (
 *   // Legacy dealer routes
 *   <>
 *     <Route path="/dealer/:slug" element={...} />
 *     <Route path="/dealer-registration" element={...} />
 *     ...
 *   </>
 * )}
 */

/**
 * Route Details:
 * 
 * 1. /dealer/:slug
 *    - Public dealer profile page
 *    - Shows dealer information, listings, reviews
 *    - No authentication required
 * 
 * 2. /dealer-registration
 *    - Dealer registration form
 *    - For businesses wanting to become dealers
 *    - No authentication required (but creates account)
 * 
 * 3. /dealer-dashboard
 *    - Dealer management dashboard
 *    - Requires authentication
 *    - Dealer-only access
 */

/**
 * Security Notes:
 * 
 * - Public pages: No authentication required
 * - Dashboard: Requires ProtectedRoute (authenticated users only)
 * - Consider adding dealer-specific role check in future
 */

export default DealerRoutes;
