import React, { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { safeLazy } from '../utils/lazyImport';
import PageTransition from '../components/PageTransition/PageTransition';

// Like AppRoutes.tsx, we define styles inline or use classes. 
// Ideally should use styled-components like the old MainLayout, 
// but to be safe and match AppRoutes visual 100%, we'll use the same inline styles/classes logic.

const Header = safeLazy(() => import('../components/Header/UnifiedHeader'));
const MobileHeader = safeLazy(() => import('../components/Header/MobileHeader'));
const MobileBottomNav = safeLazy(() => import('../components/layout/MobileBottomNav'));
const Footer = safeLazy(() => import('../components/Footer/Footer'));
const FloatingAddButton = safeLazy(() => import('../components/FloatingAddButton'));
// ✅ MERGED: RobotChatIcon and AIChatbotWidget merged into UnifiedAIChat
const UnifiedAIChat = safeLazy(() => import('../components/AI/UnifiedAIChat'));
const GracePeriodBanner = safeLazy(() => import('../components/billing/GracePeriodBanner'));
const IncompleteProfileAlert = safeLazy(() => import('../components/GuestAccountAlert/IncompleteProfileAlert'));

export const MainLayout: React.FC = () => {
    const location = useLocation();
    const isSellPage = location.pathname === '/sell/auto';
    const isDeleteMockCarsPage = location.pathname === '/admin/delete-mock-cars';
    const hideFooter = isSellPage || isDeleteMockCarsPage;
    
    return (
        <div className="main-layout" style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            ...(isSellPage && {
                overflow: 'hidden',
                height: '100vh'
            })
        }}>
            {!isSellPage && (
                <header role="banner">
                    <div className="desktop-header-only">
                        <Suspense fallback={<div style={{ height: '70px' }} />}>
                            <Header />
                        </Suspense>
                    </div>
                    <div className="mobile-header-only">
                        <Suspense fallback={<div style={{ height: '60px' }} />}>
                            <MobileHeader />
                        </Suspense>
                    </div>
                </header>
            )}

            {/* ✅ Incomplete Profile Alert - BELOW header, ABOVE main content */}
            {!isSellPage && (
                <div 
                    className="incomplete-profile-banner" 
                    style={{ 
                        width: '100%',
                        position: 'fixed',
                        top: '70px', /* Below header */
                        left: 0,
                        right: 0,
                        zIndex: 999,
                    }}
                >
                    <Suspense fallback={null}>
                        <IncompleteProfileAlert />
                    </Suspense>
                </div>
            )}

            <main
                id="main-content"
                role="main"
                style={{
                    flex: 1,
                    padding: isSellPage ? '0' : '0',
                    paddingTop: isSellPage ? '0' : '80px',
                    paddingBottom: isSellPage ? '0' : '80px',
                    backgroundColor: 'transparent',
                    transition: 'background-color 0.3s ease',
                    position: 'relative',
                    ...(isSellPage && {
                        overflow: 'hidden',
                        height: '100vh',
                        padding: '0',
                        margin: '0'
                    })
                }}
                tabIndex={-1}
            >
                <div className="grace-period-banner" aria-live="polite">
                    <Suspense fallback={null}>
                        <GracePeriodBanner />
                    </Suspense>
                </div>

                <div className="page-container" style={{
                    backgroundColor: 'transparent',
                    transition: 'background-color 0.3s ease',
                    ...(isSellPage && {
                        height: '100%',
                        width: '100%',
                        padding: '0',
                        margin: '0'
                    })
                }}>
                    <PageTransition>
                        <Suspense fallback={null}>
                            <Outlet />
                        </Suspense>
                    </PageTransition>
                </div>
            </main>

            {!hideFooter && (
                <footer role="contentinfo">
                    <Suspense fallback={<div style={{ height: '300px' }} />}>
                        <Footer />
                    </Suspense>
                </footer>
            )}

            {!hideFooter && (
                <>
                    <Suspense fallback={<div style={{ height: '60px' }} />}>
                        <MobileBottomNav />
                    </Suspense>

                    <Suspense fallback={null}>
                        <FloatingAddButton />
                    </Suspense>
                    <Suspense fallback={null}>
                        <UnifiedAIChat 
                            position="bottom-right"
                            bottom={304}
                            offset={32}
                            showBadge={false}
                        />
                    </Suspense>
                </>
            )}
        </div>
    );
};

export default MainLayout;
