import React, { Suspense } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { bulgarianTheme, GlobalStyles } from './styles/theme';
import { useTheme } from './contexts/ThemeContext';
import { safeLazy } from './utils/lazyImport';
import SmartLoader from './components/SmartLoaderCSS';
import InactivityWarning from './components/InactivityWarning';
import { DebugAdsPage } from './features/campaigns/pages/CampaignDebugPage';
import { AuthGuard } from './components/guards/AuthGuard';
import { SuperAdminAuthGuard } from './components/guards/SuperAdminAuthGuard';

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
const CarModerationPage = safeLazy(() => import('./pages/06_admin/CarModerationPage'));

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

const AdminDataFixPage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div style={{
            minHeight: '100vh',
            background: '#f0f2f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
            <div style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '48px',
                width: '100%',
                maxWidth: '480px',
                border: '1px solid #e0e0e0',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                textAlign: 'center',
            }}>
                <div style={{
                    width: '56px',
                    height: '56px',
                    background: '#000000',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    fontSize: '24px',
                }}>🔧</div>
                <h1 style={{ color: '#000000', fontSize: '22px', fontWeight: 700, margin: '0 0 12px' }}>
                    Admin Data Fix Tools
                </h1>
                <p style={{ color: '#555555', fontSize: '15px', lineHeight: 1.6, margin: '0 0 32px' }}>
                    This tool is currently under maintenance. Please check back later or use the Super Admin dashboard.
                </p>
                <button
                    onClick={() => navigate('/super-admin')}
                    style={{
                        background: '#000000',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '14px 28px',
                        fontSize: '15px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        width: '100%',
                    }}
                >
                    ← Go to Super Admin
                </button>
            </div>
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
                            <SuperAdminAuthGuard>
                                <SuperAdminDashboard />
                            </SuperAdminAuthGuard>
                        </FullScreenLayout>
                    } />
                    <Route path="/super-admin/users" element={
                        <FullScreenLayout>
                            <SuperAdminAuthGuard>
                                <SuperAdminUsersPage />
                            </SuperAdminAuthGuard>
                        </FullScreenLayout>
                    } />
                    <Route path="/super-admin/moderation" element={
                        <FullScreenLayout>
                            <SuperAdminAuthGuard>
                                <CarModerationPage />
                            </SuperAdminAuthGuard>
                        </FullScreenLayout>
                    } />
                    <Route path="/debug/ads" element={
                        <FullScreenLayout>
                            <DebugAdsPage />
                        </FullScreenLayout>
                    } />
                    <Route path="/debug/campaigns" element={
                        <FullScreenLayout>
                            <DebugAdsPage />
                        </FullScreenLayout>
                    } />
                    <Route path="/admin/data-fix" element={
                        <FullScreenLayout>
                            <AuthGuard requireAuth={true} requireAdmin={true} redirectTo="/super-admin-login" showMessage={false}>
                                <AdminDataFixPage />
                            </AuthGuard>
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
