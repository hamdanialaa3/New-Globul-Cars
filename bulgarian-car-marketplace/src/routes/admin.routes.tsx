// src/routes/admin.routes.tsx
/**
 * Admin Routes
 * 
 * Contains all admin and super-admin routes:
 * - Regular Admin Dashboard
 * - Super Admin Login
 * - Super Admin Dashboard
 * - Super Admin Users Management
 * - Architecture Diagram
 * 
 * All admin routes use FullScreenLayout
 * 
 * Created: Week 2, Day 3-4
 * Part of: Route Extraction Refactoring
 */

import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

// Lazy load admin pages
const AdminPage = React.lazy(() => import('@/pages/06_admin/regular-admin/AdminPage'));
const SuperAdminLogin = React.lazy(() => import('@/pages/06_admin/super-admin/SuperAdminLogin'));
const SuperAdminDashboard = React.lazy(() => import('@/pages/06_admin/super-admin/SuperAdminDashboard'));
const SuperAdminUsersPage = React.lazy(() => import('@/pages/06_admin/super-admin/SuperAdminUsersPage'));
const ArchitectureDiagramPage = React.lazy(() => import('@/pages/ArchitectureDiagramPage'));

// Lazy load layout
const FullScreenLayout = React.lazy(() => import('@/components/FullScreenLayout'));

// Guards
import { AuthGuard } from '../components/guards';

/**
 * Admin Routes Component
 * 
 * Renders all admin-related routes with appropriate guards
 * 
 * Routes:
 * - /admin - Regular admin dashboard (requires admin role)
 * - /super-admin-login - Super admin login page
 * - /super-admin - Super admin dashboard
 * - /super-admin/users - Super admin users management
 * - /diagram - Architecture diagram (full screen)
 * 
 * @returns {JSX.Element} Admin routes
 */
export const AdminRoutes: React.FC = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                {/* Regular Admin Dashboard */}
                <Route
                    path="/admin"
                    element={
                        <AuthGuard requireAuth={true} requireAdmin={true}>
                            <FullScreenLayout>
                                <AdminPage />
                            </FullScreenLayout>
                        </AuthGuard>
                    }
                />

                {/* Super Admin Login */}
                <Route
                    path="/super-admin-login"
                    element={
                        <FullScreenLayout>
                            <SuperAdminLogin />
                        </FullScreenLayout>
                    }
                />

                {/* Super Admin Dashboard */}
                <Route
                    path="/super-admin"
                    element={
                        <FullScreenLayout>
                            <SuperAdminDashboard />
                        </FullScreenLayout>
                    }
                />

                {/* Super Admin Users Management */}
                <Route
                    path="/super-admin/users"
                    element={
                        <FullScreenLayout>
                            <SuperAdminUsersPage />
                        </FullScreenLayout>
                    }
                />

                {/* Architecture Diagram - Full Screen */}
                <Route
                    path="/diagram"
                    element={
                        <FullScreenLayout>
                            <ArchitectureDiagramPage />
                        </FullScreenLayout>
                    }
                />
            </Routes>
        </Suspense>
    );
};

/**
 * Usage in App.tsx:
 * 
 * import { FEATURE_FLAGS } from '../config/feature-flags';
 * import { AdminRoutes } from '@/routes/admin.routes';
 * 
 * // In your Routes:
 * {FEATURE_FLAGS.USE_ADMIN_ROUTES ? (
 *   <Route path="/*" element={<AdminRoutes />} />
 * ) : (
 *   // Legacy admin routes
 *   <>
 *     <Route path="/admin" element={...} />
 *     <Route path="/super-admin-login" element={...} />
 *     ...
 *   </>
 * )}
 */

/**
 * Security Notes:
 * 
 * - Regular admin routes use AuthGuard with requireAdmin={true}
 * - Super admin routes should have additional security checks
 * - All admin routes use FullScreenLayout (no header/footer)
 * - Consider adding IP whitelisting for super admin routes
 */

export default AdminRoutes;
