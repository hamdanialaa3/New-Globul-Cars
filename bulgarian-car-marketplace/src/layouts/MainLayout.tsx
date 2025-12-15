import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { safeLazy } from '../utils/lazyImport';

// Like AppRoutes.tsx, we define styles inline or use classes. 
// Ideally should use styled-components like the old MainLayout, 
// but to be safe and match AppRoutes visual 100%, we'll use the same inline styles/classes logic.

const Header = safeLazy(() => import('../components/Header/UnifiedHeader'));
const MobileHeader = safeLazy(() => import('../components/Header/MobileHeader'));
const MobileBottomNav = safeLazy(() => import('../components/layout/MobileBottomNav'));
const Footer = safeLazy(() => import('../components/Footer/Footer'));
const FloatingAddButton = safeLazy(() => import('../components/FloatingAddButton'));
const RobotChatIcon = safeLazy(() => import('../components/AI/RobotChatIcon'));

export const MainLayout: React.FC = () => {
    return (
        <div className="main-layout" style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column'
        }}>
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

            <main
                id="main-content"
                role="main"
                style={{
                    flex: 1,
                    padding: '0',
                    paddingTop: '80px',
                    paddingBottom: '80px',
                    backgroundColor: 'transparent',
                    transition: 'background-color 0.3s ease'
                }}
                tabIndex={-1}
            >
                <div className="page-container" style={{
                    backgroundColor: 'transparent',
                    transition: 'background-color 0.3s ease'
                }}>
                    <Suspense fallback={null}>
                        <Outlet />
                    </Suspense>
                </div>
            </main>

            <footer role="contentinfo">
                <Suspense fallback={<div style={{ height: '300px' }} />}>
                    <Footer />
                </Suspense>
            </footer>

            <Suspense fallback={<div style={{ height: '60px' }} />}>
                <MobileBottomNav />
            </Suspense>

            <Suspense fallback={null}>
                <FloatingAddButton />
            </Suspense>
            <Suspense fallback={null}>
                <RobotChatIcon />
            </Suspense>
        </div>
    );
};

export default MainLayout;
