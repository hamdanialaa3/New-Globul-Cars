// src/layouts/FullScreenLayout.tsx
/**
 * Full Screen Layout with React Router Outlet
 * 
 * This layout is used for pages that need full screen (no header/footer):
 * - Authentication pages (login, register, verification)
 * - Admin pages (admin dashboard, super admin)
 * - Special pages (architecture diagram)
 * 
 * Uses React Router v6 Outlet pattern for better performance.
 * 
 * Created: Week 3, Day 1
 * Part of: React Router Outlets Refactoring
 */

import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '@/contexts/ThemeContext';

// Lazy load progress bar
const ProgressBar = React.lazy(() => import('@/components/ProgressBar'));

// Styled Components
const FullScreenContainer = styled.div<{ $isDark: boolean }>`
  min-height: 100vh;
  width: 100%;
  background-color: ${({ $isDark }) => ($isDark ? '#0f172a' : '#ffffff')};
  color: ${({ $isDark }) => ($isDark ? '#f1f5f9' : '#1e293b')};
  transition: background-color 0.3s ease, color 0.3s ease;
  display: flex;
  flex-direction: column;
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-x: hidden;
`;

const LoadingFallback = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-size: 18px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

/**
 * Full Screen Layout Component
 * 
 * Provides a full-screen layout without header or footer.
 * Uses React Router Outlet to render child routes.
 * 
 * Features:
 * - Full screen (no header/footer)
 * - Dark/Light theme support
 * - Loading states with Suspense
 * - Responsive design
 * - Minimal chrome for focused experiences
 * 
 * Use Cases:
 * - Authentication flows
 * - Admin dashboards
 * - Special full-screen experiences
 * - Presentation modes
 * 
 * @returns {JSX.Element} Full screen layout with outlet for child routes
 */
export const FullScreenLayout: React.FC = () => {
    const { isDark } = useTheme();

    return (
        <FullScreenContainer $isDark={isDark}>
            <ContentArea>
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
            </ContentArea>
        </FullScreenContainer>
    );
};

/**
 * Usage in Routes:
 * 
 * <Routes>
 *   <Route element={<FullScreenLayout />}>
 *     <Route path="/login" element={<LoginPage />} />
 *     <Route path="/register" element={<RegisterPage />} />
 *     <Route path="/verification" element={<EmailVerificationPage />} />
 *     <Route path="/super-admin" element={<SuperAdminDashboard />} />
 *   </Route>
 * </Routes>
 */

/**
 * Benefits of Outlet Pattern:
 * 
 * 1. Performance:
 *    - Layout renders once
 *    - No re-renders on route changes
 *    - Faster transitions
 * 
 * 2. Consistency:
 *    - All full-screen pages have same base styling
 *    - Theme support built-in
 *    - Consistent loading states
 * 
 * 3. Maintainability:
 *    - Single source of truth
 *    - Easy to update globally
 *    - Less code duplication
 */

/**
 * Comparison with MainLayout:
 * 
 * MainLayout:
 * - Has header and footer
 * - Has floating elements
 * - For regular app pages
 * 
 * FullScreenLayout:
 * - No header or footer
 * - No floating elements
 * - For focused experiences
 */

export default FullScreenLayout;
