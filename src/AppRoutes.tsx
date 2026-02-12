import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { bulgarianTheme, GlobalStyles } from './styles/theme';
import { useTheme } from './contexts/ThemeContext';
import { safeLazy } from './utils/lazyImport';
import SmartLoader from './components/SmartLoaderCSS';
import InactivityWarning from './components/InactivityWarning';
import { DebugAdsPage } from './features/ads/pages/DebugAdsPage';

// Lazy Loaded Components
const GlobalWorkflowTimer = safeLazy(() => import('./components/GlobalWorkflowTimer'));

// Auth Pages (Keep at root level for now)
const LoginPage = safeLazy(() => import('./pages/02_authentication/login/LoginPage/LoginPageGlassFixed'));
const RegisterPage = safeLazy(() => import('./pages/02_authentication/register/RegisterPage/RegisterPageGlassFixed'));
const ForgotPasswordPage = safeLazy(() => import('./pages/02_authentication/forgot-password/ForgotPasswordPage'));
const EmailVerificationPage = safeLazy(() => import('./pages/02_authentication/verification/EmailVerificationPage'));
const OAuthCallback = safeLazy(() => import('./pages/02_authentication/oauth/OAuthCallbackPage'));
const SuperAdminLogin = safeLazy(() => import('./pages/02_authentication/admin-login/SuperAdminLoginPage'));
const SuperAdminDashboard = safeLazy(() => import('./pages/06_admin/super-admin/SuperAdminDashboard'));
const SuperAdminUsersPage = safeLazy(() => import('./pages/06_admin/super-admin/SuperAdminUsersPage'));

// Modularized Routes & Layout
import { MainLayout } from './layouts/MainLayout';
import { MainRoutes } from './routes/MainRoutes';

const FullScreenLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div style={{ minHeight: '100vh' }}>
            <main
                id="main-content"
                role="main"
                style={{ minHeight: '100vh' }}
                tabIndex={-1}
            >
                {children}
            </main>
        </div>
    );
};

// Main AppRoutes Component
const AppRoutes: React.FC = () => {
    const { theme } = useTheme();

    // Create dynamic theme based on mode AND apply bulgarianTheme tokens
    const dynamicTheme = React.useMemo(() => ({
        ...bulgarianTheme,
        mode: theme
    }), [theme]);

    return (
        <ThemeProvider theme={dynamicTheme}>
            <GlobalStyles />
            <InactivityWarning />
            <Suspense fallback={null}>
                <GlobalWorkflowTimer />
            </Suspense>

            <Suspense fallback={<SmartLoader />}>
                <Routes>
                    {/* Auth Routes - Full Screen */}
                    <Route path="/login" element={
                        <FullScreenLayout>
                            <LoginPage />
                        </FullScreenLayout>
                    } />
                    <Route path="/register" element={
                        <FullScreenLayout>
                            <RegisterPage />
                        </FullScreenLayout>
                    } />
                    <Route path="/forgot-password" element={
                        <FullScreenLayout>
                            <ForgotPasswordPage />
                        </FullScreenLayout>
                    } />
                    <Route path="/verification" element={
                        <FullScreenLayout>
                            <EmailVerificationPage />
                        </FullScreenLayout>
                    } />
                    <Route path="/oauth/callback" element={
                        <FullScreenLayout>
                            <OAuthCallback />
                        </FullScreenLayout>
                    } />
                    <Route path="/super-admin-login" element={
                        <FullScreenLayout>
                            <SuperAdminLogin />
                        </FullScreenLayout>
                    } />
                    <Route path="/super-admin" element={
                        <FullScreenLayout>
                            <SuperAdminDashboard />
                        </FullScreenLayout>
                    } />
                    <Route path="/super-admin/users" element={
                        <FullScreenLayout>
                            <SuperAdminUsersPage />
                        </FullScreenLayout>
                    } />
                    <Route path="/debug/ads" element={
                        <FullScreenLayout>
                            <DebugAdsPage />
                        </FullScreenLayout>
                    } />

                    {/* Main Application Routes - Wrapped in MainLayout */}
                    <Route element={<MainLayout />}>
                        {/* 
                           We use a wildcard route since MainRoutes defines its own Routing.
                           This allows MainLayout to persist while MainRoutes handles all child paths.
                         */}
                        <Route path="/*" element={<MainRoutes />} />
                    </Route>
                </Routes>
            </Suspense>
        </ThemeProvider>
    );
};

export default AppRoutes;
