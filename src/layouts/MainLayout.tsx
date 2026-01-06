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

export const MainLayout: React.FC = () => {
    const location = useLocation();
    const isSellPage = location.pathname === '/sell/auto';
    
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

            {!isSellPage && (
                <footer role="contentinfo">
                    <Suspense fallback={<div style={{ height: '300px' }} />}>
                        <Footer />
                    </Suspense>
                </footer>
            )}

            {!isSellPage && (
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
