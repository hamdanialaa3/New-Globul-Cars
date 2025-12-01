// src/layouts/MainLayout.tsx
/**
 * Main Layout with React Router Outlet
 * 
 * This layout is used for most application pages.
 * Includes: Header + Content Area + Footer + Floating Elements
 * 
 * Uses React Router v6 Outlet pattern for better performance:
 * - Layout renders once and persists across route changes
 * - Only the content area (Outlet) re-renders on navigation
 * - Follows React Router best practices
 * 
 * Created: Week 3, Day 1
 * Part of: React Router Outlets Refactoring
 */

import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';

// Lazy load layout components
const Header = React.lazy(() => import('../components/Header/UnifiedHeader'));
const Footer = React.lazy(() => import('../components/Footer/Footer'));
const FloatingAddButton = React.lazy(() => import('../components/FloatingAddButton'));
const RobotChatIcon = React.lazy(() => import('../components/AI/RobotChatIcon'));
const ProgressBar = React.lazy(() => import('../components/ProgressBar'));

// Styled Components
const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-top: 80px; /* Fixed header height + margin */
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  transition: background-color 0.3s ease, color 0.3s ease;
  
  @media (max-width: 768px) {
    padding-top: 70px;
  }
`;

const MainContent = styled.main<{ $isDark: boolean }>`
  flex: 1;
  padding-bottom: 80px;
  background-color: ${({ theme }) => theme.colors.background};
  min-height: calc(100vh - 200px);
  transition: background-color 0.3s ease;
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;

  @media (max-width: 768px) {
    padding: 0 10px;
  }
`;

const LoadingFallback = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: 18px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

/**
 * Main Layout Component
 * 
 * Provides the standard application layout with header, footer, and floating elements.
 * Uses React Router Outlet to render child routes.
 * 
 * Features:
 * - Persistent header and footer across route changes
 * - Dark/Light theme support
 * - Floating action button
 * - AI chatbot icon
 * - Loading states with Suspense
 * - Responsive design
 * 
 * @returns {JSX.Element} Main layout with outlet for child routes
 */
export const MainLayout: React.FC = () => {
    const { isDark } = useTheme();

    return (
        <LayoutContainer>
            {/* Header - Renders once, persists across routes */}
            <Suspense fallback={<div style={{ height: '80px' }} />}>
                <Header />
            </Suspense>

            {/* Main Content Area - Outlet renders child routes here */}
            <MainContent $isDark={isDark}>
                <ContentWrapper>
                    <Suspense
                        fallback={
                            <LoadingFallback>
                                <Suspense fallback={<div>Loading...</div>}>
                                    <ProgressBar duration={2000} />
                                </Suspense>
                            </LoadingFallback>
                        }
                    >
                        {/* Child routes render here */}
                        <Outlet />
                    </Suspense>
                </ContentWrapper>
            </MainContent>

            {/* Footer - Renders once, persists across routes */}
            <Suspense fallback={<div style={{ height: '100px' }} />}>
                <Footer />
            </Suspense>

            {/* Floating Elements - Persist across routes */}
            <Suspense fallback={null}>
                <FloatingAddButton />
            </Suspense>

            <Suspense fallback={null}>
                <RobotChatIcon />
            </Suspense>
        </LayoutContainer>
    );
};

/**
 * Usage in Routes:
 * 
 * <Routes>
 *   <Route element={<MainLayout />}>
 *     <Route path="/" element={<HomePage />} />
 *     <Route path="/cars" element={<CarsPage />} />
 *     <Route path="/social" element={<SocialFeedPage />} />
 *   </Route>
 * </Routes>
 */

/**
 * Benefits of Outlet Pattern:
 * 
 * 1. Performance:
 *    - Layout renders once, not on every route change
 *    - Header/Footer don't re-render unnecessarily
 *    - Faster route transitions
 * 
 * 2. Code Quality:
 *    - No need to wrap every route in layout
 *    - Cleaner route definitions
 *    - Follows React Router best practices
 * 
 * 3. User Experience:
 *    - Smoother transitions
 *    - Persistent UI elements (header, footer)
 *    - Better scroll position handling
 * 
 * 4. Maintainability:
 *    - Single source of truth for layout
 *    - Easier to update layout globally
 *    - Less code duplication
 */

/**
 * Layout State Persistence:
 * 
 * Because the layout persists across routes, you can:
 * - Maintain scroll position in header
 * - Keep menu expanded/collapsed state
 * - Preserve search bar focus
 * - Maintain theme toggle state
 * 
 * Note: Route-specific state should NOT be in layout
 */

export default MainLayout;
