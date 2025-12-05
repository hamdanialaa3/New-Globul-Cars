// src/routes/auth.routes.tsx
/**
 * Authentication Routes
 * 
 * Contains all authentication-related routes:
 * - Login
 * - Register
 * - Email Verification
 * - OAuth Callback
 * 
 * All auth routes use FullScreenLayout (no header/footer)
 * 
 * Created: Week 2, Day 1-2
 * Part of: Route Extraction Refactoring
 */

import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

// Lazy load auth pages
const LoginPage = React.lazy(() => import('@/pages/02_authentication/login/LoginPage'));
const RegisterPage = React.lazy(() => import('@/pages/02_authentication/register/RegisterPage'));
const EmailVerificationPage = React.lazy(() => import('@/pages/02_authentication/verification/EmailVerificationPage'));
const OAuthCallback = React.lazy(() => import('@/pages/02_authentication/OAuthCallback'));

// Lazy load layout
const FullScreenLayout = React.lazy(() => import('@/components/FullScreenLayout'));

/**
 * Auth Routes Component
 * 
 * Renders all authentication routes with FullScreenLayout
 * 
 * Routes:
 * - /login - User login page
 * - /register - User registration page
 * - /verification - Email verification page
 * - /oauth/callback - OAuth callback handler
 * 
 * @returns {JSX.Element} Auth routes
 */
export const AuthRoutes: React.FC = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                {/* Login Route */}
                <Route
                    path="/login"
                    element={
                        <FullScreenLayout>
                            <LoginPage />
                        </FullScreenLayout>
                    }
                />

                {/* Register Route */}
                <Route
                    path="/register"
                    element={
                        <FullScreenLayout>
                            <RegisterPage />
                        </FullScreenLayout>
                    }
                />

                {/* Email Verification Route */}
                <Route
                    path="/verification"
                    element={
                        <FullScreenLayout>
                            <EmailVerificationPage />
                        </FullScreenLayout>
                    }
                />

                {/* OAuth Callback Route */}
                <Route
                    path="/oauth/callback"
                    element={
                        <FullScreenLayout>
                            <OAuthCallback />
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
 * import { AuthRoutes } from '@/routes/auth.routes';
 * 
 * // In your Routes:
 * {FEATURE_FLAGS.USE_AUTH_ROUTES ? (
 *   <Route path="/*" element={<AuthRoutes />} />
 * ) : (
 *   // Legacy auth routes
 *   <>
 *     <Route path="/login" element={...} />
 *     <Route path="/register" element={...} />
 *     ...
 *   </>
 * )}
 */

export default AuthRoutes;
