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
                <header role="banner" style={{ 
                    flexShrink: 0,
                    height: '64px',   /* Spacer for fixed header */
                    minHeight: '64px'
                }}>
                    <div className="desktop-header-only">
                        <Suspense fallback={null}>
                            <Header />
                        </Suspense>
                    </div>
                    <div className="mobile-header-only">
                        <Suspense fallback={null}>
                            <MobileHeader />
                        </Suspense>
                    </div>
                </header>
            )}

            {/* Incomplete Profile Alert - flows naturally after header spacer */}
            {!isSellPage && (
                <Suspense fallback={null}>
                    <IncompleteProfileAlert />
                </Suspense>
            )}

            <main
                id="main-content"
                role="main"
                style={{
                    flex: 1,
                    paddingTop: isSellPage ? '0' : '0',
                    paddingBottom: isSellPage ? '0' : '0',
                    marginTop: isSellPage ? '0' : '0',
                    backgroundColor: 'transparent',
                    transition: 'background-color 0.3s ease',
                    position: 'relative',
                    boxSizing: 'border-box',
                    ...(isSellPage && {
                        overflow: 'hidden',
                        height: '100vh',
                        padding: '0',
                        margin: '0',
                        marginTop: '0'
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

            {/* MobileBottomNav: always rendered (hides itself on ≥768px via CSS) */}
            <Suspense fallback={null}>
                <MobileBottomNav />
            </Suspense>

            {!hideFooter && (
                <>
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
